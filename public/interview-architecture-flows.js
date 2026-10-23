// Step-through architecture flows for the Interview Architecture Studio.
// Nodes sit at fixed x/y on a w×h stage, edges join node sides with cubic curves,
// and each step lights up the nodes and edges it touches while the rest dims.
// Node ids reuse the project's `components` keys, so clicking a flow node opens
// the same component card the Mermaid diagrams use.

const SVG_NS = 'http://www.w3.org/2000/svg';
const MIN_SCALE = 0.62;
const NODE_W = 200;

const KIND_LABEL = { person: 'person', code: 'service', llm: 'LLM call', store: 'storage', guard: 'guard', obs: 'telemetry' };
const KIND_ICON = { person: 'person', code: 'code', llm: 'sparkle', store: 'db', guard: 'shield', obs: 'pulse' };
const WHO_LABEL = { person: 'person', code: 'code decides', model: 'model decides', human: 'human decides' };

const G = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const GLYPH = {
  person: G('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  review: G('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>'),
  code: G('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
  sparkle: G('<path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="M19 16v4M17 18h4"/>'),
  db: G('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  shield: G('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  lock: G('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  check: G('<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'),
  pulse: G('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'),
  layers: G('<path d="M12 3 2 8l10 5 10-5z"/><path d="m2 13 10 5 10-5"/><path d="m2 17.5 10 5 10-5"/>'),
  list: G('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>'),
  send: G('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>'),
  chart: G('<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17V9"/>'),
  graph: G('<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7 7.5l3.5 8M17 7.5l-3.5 8M7.5 6h9"/>'),
  search: G('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
  tool: G('<path d="M4 20l7-7"/><circle cx="15.5" cy="8.5" r="4.5"/>'),
  file: G('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>'),
};

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function anchor(n, side, off = 0) {
  if (side === 'l') return [n.x, n.y + n.h / 2 + off];
  if (side === 'r') return [n.x + n.w, n.y + n.h / 2 + off];
  if (side === 't') return [n.x + n.w / 2 + off, n.y];
  return [n.x + n.w / 2 + off, n.y + n.h];
}
function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
}
// Control points leave each side perpendicular to it, so curves never cut back through their own node.
function pathFor(e, a, b) {
  const [x1, y1] = a, [x2, y2] = b, dx = x2 - x1, dy = y2 - y1;
  const fromH = e.fromSide === 'l' || e.fromSide === 'r', toH = e.toSide === 'l' || e.toSide === 'r';
  let c1, c2;
  if (fromH && toH) { c1 = [x1 + dx * 0.45, y1]; c2 = [x2 - dx * 0.45, y2]; }
  else if (!fromH && !toH) { c1 = [x1, y1 + dy * 0.45]; c2 = [x2, y2 - dy * 0.45]; }
  else if (fromH) { c1 = [x1 + dx * 0.5, y1]; c2 = [x2, y2 - dy * 0.5]; }
  else { c1 = [x1, y1 + dy * 0.5]; c2 = [x2 - dx * 0.5, y2]; }
  return { d: `M${x1},${y1} C${c1} ${c2} ${x2},${y2}`, mid: bez(a, c1, c2, b, e.lt ?? 0.5) };
}

export function mountFlow({ host, flow, components = {}, walk = [], onNode = () => {} }) {
  let active = -1, timer = null, raf = 0;
  const kinds = new Set(flow.nodes.map(n => n.kind));

  host.innerHTML = `
    ${flow.stats ? `<div class="fx-stats">${flow.stats.map(s => `<div><span class="n">${esc(s.n)}<span class="u">${esc(s.u)}</span></span><span class="l">${esc(s.l)}</span></div>`).join('')}</div>` : ''}
    <div class="fx-bar">
      <div class="fx-legend">${Object.entries(KIND_LABEL).filter(([k]) => kinds.has(k)).map(([k, l]) => `<i class="fx-pill k-${k}">${l}</i>`).join('')}<i class="fx-pill fx-inf">dashed = design-level</i></div>
      <button type="button" class="smallbtn fx-play" aria-pressed="false">Auto-play</button>
      <span class="fx-hint"><kbd>←</kbd> <kbd>→</kbd> to step · <kbd>Esc</kbd> to clear</span>
    </div>
    <div class="fx-grid">
      <div class="fx-stagewrap"><p class="fx-cap">${esc(flow.caption)}</p><div class="fx-viewport"><div class="fx-sizer"><div class="fx-stage"></div></div></div></div>
      <aside class="fx-side"></aside>
    </div>`;
  const viewport = host.querySelector('.fx-viewport'), sizer = host.querySelector('.fx-sizer');
  const stage = host.querySelector('.fx-stage'), playBtn = host.querySelector('.fx-play'), list = host.querySelector('.fx-side');
  stage.style.width = flow.w + 'px';
  stage.style.height = flow.h + 'px';

  const byId = {};
  for (const n of flow.nodes) {
    const key = n.comp || n.id, inferred = n.inferred ?? !!components[key]?.inferred, w = n.w || NODE_W;
    const el = document.createElement('div');
    el.className = 'fx-node' + (inferred ? ' inferred' : '');
    el.dataset.id = n.id;
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.style.cssText = `left:${n.x}px;top:${n.y}px;width:${w}px`;
    el.innerHTML = `<span class="ic k-${n.kind}">${GLYPH[n.icon || KIND_ICON[n.kind]] || GLYPH.code}</span>`
      + `<span class="tx"><span class="nm">${esc(n.name)}</span><span class="cp">${esc(n.cap)}</span>`
      + `<span class="fx-pills"><i class="fx-pill k-${n.kind}">${KIND_LABEL[n.kind]}</i>${(n.pills || []).map(p => `<i class="fx-pill mono">${esc(p)}</i>`).join('')}</span></span>`;
    el.addEventListener('click', () => onNodeClick(n.id));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNodeClick(n.id); } });
    stage.appendChild(el);
    byId[n.id] = { ...n, w, el };
  }
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'fx-edges');
  stage.prepend(svg);
  const labels = document.createElement('div');
  stage.appendChild(labels);

  const payload = s => {
    const w = walk[s.pay];
    if (!w) return '';
    const pre = x => `<pre>${esc(JSON.stringify(x, null, 2))}</pre>`;
    return `<div class="fx-pay"><div class="fx-paylabel">Payload · ${esc(w[0])}</div><div class="fx-io"><div><label>Input</label>${pre(w[1])}</div><div><label>Output</label>${pre(w[2])}</div></div></div>`;
  };
  list.innerHTML = `
    <div class="fx-stephead"><b>${esc(flow.title)}</b><span>${flow.steps.length} steps</span></div>
    <ol class="fx-steps">${flow.steps.map((s, i) => `
      <li data-i="${i}"><button type="button" class="fx-st"><span class="sn">${i + 1}</span><span class="stt"><b>${esc(s.t)}</b><i class="fx-pill w-${s.who}">${WHO_LABEL[s.who]}</i><span class="sum">${esc(s.sum)}</span></span></button>
        <div class="fx-detail"><ul>${s.pts.map(p => `<li>${p}</li>`).join('')}</ul>${s.why ? `<p class="fx-why">${s.why}</p>` : ''}${payload(s)}</div></li>`).join('')}
    </ol>
    <div class="fx-nav"><button type="button" class="smallbtn" data-go="-1">← Previous</button><button type="button" class="smallbtn" data-go="1">Next →</button></div>`;
  const [prevBtn, nextBtn] = list.querySelectorAll('.fx-nav button');

  // Edges need measured node heights, so they are redrawn whenever the stage
  // becomes visible or a node changes size (tab switches, fonts loading).
  function drawEdges() {
    for (const n of Object.values(byId)) n.h = n.el.offsetHeight;
    if (!flow.nodes.length || !byId[flow.nodes[0].id].h) return;
    svg.setAttribute('width', flow.w);
    svg.setAttribute('height', flow.h);
    const head = cls => `<marker id="fx-ah${cls}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fx-head${cls ? ' on' : ''}"/></marker>`;
    svg.innerHTML = `<defs>${head('')}${head('-on')}</defs>`;
    labels.innerHTML = '';
    for (const e of flow.edges) {
      const a = anchor(byId[e.from], e.fromSide, e.off || 0);
      const b = anchor(byId[e.to], e.toSide, e.toOff ?? e.off ?? 0);
      const { d, mid } = pathFor(e, a, b);
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'fx-edge' + (e.dashed ? ' dashed' : ''));
      g.dataset.id = e.id;
      g.innerHTML = `<path class="hit" d="${d}"/><path class="line" d="${d}"/>`;
      g.querySelector('.hit').addEventListener('click', () => { stop(); const i = flow.steps.findIndex(s => s.edges.includes(e.id)); if (i >= 0) setActive(i); });
      svg.appendChild(g);
      if (e.label) {
        const l = document.createElement('span');
        l.className = 'fx-label';
        l.dataset.id = e.id;
        l.textContent = e.label;
        l.style.left = mid[0] + 'px';
        l.style.top = mid[1] + 'px';
        labels.appendChild(l);
      }
    }
    paint();
  }
  // Scale the stage down to fit narrow screens, but never below MIN_SCALE; past that it scrolls sideways.
  function fit() {
    const avail = viewport.clientWidth;
    if (!avail) return;
    const s = Math.max(MIN_SCALE, Math.min(1, avail / flow.w));
    stage.style.transform = `scale(${s})`;
    sizer.style.width = Math.round(flow.w * s) + 'px';
    sizer.style.height = Math.round(flow.h * s) + 'px';
  }
  function paint() {
    const s = flow.steps[active];
    const on = id => !!s && (s.nodes.includes(id) || s.edges.includes(id));
    stage.classList.toggle('focus', !!s);
    stage.querySelectorAll('.fx-node').forEach(el => el.classList.toggle('on', on(el.dataset.id)));
    svg.querySelectorAll('.fx-edge').forEach(g => {
      const lit = on(g.dataset.id);
      g.classList.toggle('on', lit);
      g.querySelector('.line').setAttribute('marker-end', lit ? 'url(#fx-ah-on)' : 'url(#fx-ah)');
    });
    labels.querySelectorAll('.fx-label').forEach(l => l.classList.toggle('on', on(l.dataset.id)));
    list.querySelectorAll('.fx-steps > li').forEach(li => li.classList.toggle('on', +li.dataset.i === active));
    prevBtn.disabled = active <= 0;
    nextBtn.disabled = active >= flow.steps.length - 1;
  }
  function setActive(i) { active = i; paint(); }
  function step(delta) { setActive(Math.max(0, Math.min(flow.steps.length - 1, active + delta))); }

  // A node click always opens its component card; which step it lights up is a policy choice.
  function onNodeClick(id) {
    stop();
    stage.querySelectorAll('.fx-node').forEach(el => el.classList.toggle('sel', el.dataset.id === id));
    onNode(byId[id].comp || id);
    const touching = flow.steps.flatMap((s, i) => (s.nodes.includes(id) ? [i] : []));
    // TODO(human): choose which step to activate from `touching`, given the current `active` step.
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.textContent = 'Auto-play';
  }
  playBtn.addEventListener('click', () => {
    if (timer) return stop();
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.textContent = 'Stop';
    if (active < 0 || active >= flow.steps.length - 1) setActive(0);
    timer = setInterval(() => (active < flow.steps.length - 1 ? step(1) : stop()), 6000);
  });
  list.querySelectorAll('.fx-st').forEach(b => b.addEventListener('click', () => {
    stop();
    const i = +b.parentElement.dataset.i;
    setActive(i === active ? -1 : i);
  }));
  prevBtn.addEventListener('click', () => { stop(); step(-1); });
  nextBtn.addEventListener('click', () => { stop(); step(1); });
  const onKey = e => {
    if (!host.offsetParent || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stop(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stop(); step(-1); }
    else if (e.key === 'Escape') { stop(); setActive(-1); }
  };
  document.addEventListener('keydown', onKey);

  const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { fit(); drawEdges(); }); });
  ro.observe(viewport);
  Object.values(byId).forEach(n => ro.observe(n.el));
  fit();
  drawEdges();

  return {
    destroy() {
      stop();
      ro.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      host.innerHTML = '';
    },
  };
}

// Layout grid shared by the flows: four 200px columns, three rows (a fourth for taller flows).
const X = [20, 330, 640, 950], Y = [24, 214, 404, 594];
const at = (c, r) => ({ x: X[c], y: Y[r] });

export const FLOWS = {
  cerebro: {
    title: 'Cerebro · one retention work item',
    caption: 'One client, from the nightly snapshot to a measured outcome. The AI prepares the human; code and people decide who is contacted and how.',
    stats: [
      { n: '~1.2M', u: 'clients', l: 'segmentation snapshot rebuilt from BigQuery every night' },
      { n: '3', u: 'planes', l: 'customer data, retention application, engagement and management' },
      { n: '1', u: 'human gate', l: 'every draft is approved, edited or rejected before outreach' },
      { n: '0', u: 'contacts chosen by AI', l: 'code ranks the queue; the model only prepares the call' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'BQ', ...at(0, 0), kind: 'store', name: 'BigQuery', cap: 'customer, lifecycle and engagement data', pills: ['source'] },
      { id: 'SNAP', ...at(1, 0), kind: 'code', icon: 'layers', name: 'Segmentation snapshot', cap: '~1.2M clients, rebuilt every night', pills: ['nightly'] },
      { id: 'QUEUE', ...at(2, 0), kind: 'code', icon: 'list', name: 'Retention / VIP queues', cap: 'ranked work items with reason codes', pills: ['FastAPI'] },
      { id: 'WORK', ...at(3, 0), kind: 'person', name: 'Agent workspace', cap: 'a retention agent opens the next item', pills: ['Next.js'] },
      { id: 'FUNNEL', ...at(0, 1), kind: 'code', icon: 'chart', name: 'Funnel reporting', cap: 'queue → contact → outcome' },
      { id: 'PII', ...at(1, 1), kind: 'guard', name: 'PII redaction', cap: 'only allowed context reaches the model' },
      { id: 'PREP', ...at(2, 1), kind: 'code', icon: 'file', name: 'Call-prep service', cap: 'builds the task from trusted context' },
      { id: 'AI', ...at(3, 1), kind: 'llm', name: 'LLM provider', cap: 'brief, talking points, outreach draft', pills: ['structured'] },
      { id: 'SUPA', ...at(0, 2), kind: 'store', name: 'Operational state', cap: 'queue items, reviews, contact outcomes', pills: ['Postgres'] },
      { id: 'VOICE', ...at(1, 2), kind: 'code', icon: 'send', name: 'Engagement readiness', cap: 'approved action, allowed channel only' },
      { id: 'REVIEW', ...at(2, 2), kind: 'person', icon: 'review', name: 'Human review', cap: 'the agent approves, edits or rejects', pills: ['required'] },
      { id: 'CONS', ...at(3, 2), kind: 'guard', icon: 'lock', name: 'Consent gate', cap: 'which channels this client allows' },
    ],
    edges: [
      { id: 'e-load', from: 'BQ', to: 'SNAP', fromSide: 'r', toSide: 'l', label: 'nightly load' },
      { id: 'e-rank', from: 'SNAP', to: 'QUEUE', fromSide: 'r', toSide: 'l', label: 'segments' },
      { id: 'e-item', from: 'QUEUE', to: 'WORK', fromSide: 'r', toSide: 'l', label: 'queue item' },
      { id: 'e-profile', from: 'SNAP', to: 'PII', fromSide: 'b', toSide: 't', label: 'client profile' },
      { id: 'e-open', from: 'WORK', to: 'PREP', fromSide: 'b', toSide: 't', label: 'prepare this call' },
      { id: 'e-ctx', from: 'PII', to: 'PREP', fromSide: 'r', toSide: 'l', label: 'allowed only' },
      { id: 'e-call', from: 'PREP', to: 'AI', fromSide: 'r', toSide: 'l', off: -12, label: 'context + task' },
      { id: 'e-reply', from: 'AI', to: 'PREP', fromSide: 'l', toSide: 'r', off: 12, label: 'brief + draft' },
      { id: 'e-draft', from: 'PREP', to: 'REVIEW', fromSide: 'b', toSide: 't', label: 'draft + sources' },
      { id: 'e-consent', from: 'CONS', to: 'REVIEW', fromSide: 'l', toSide: 'r', label: 'consent state' },
      { id: 'e-approve', from: 'REVIEW', to: 'VOICE', fromSide: 'l', toSide: 'r', label: 'approved' },
      { id: 'e-outcome', from: 'VOICE', to: 'SUPA', fromSide: 'l', toSide: 'r', label: 'outcome' },
      { id: 'e-report', from: 'SUPA', to: 'FUNNEL', fromSide: 't', toSide: 'b', label: 'funnel events' },
    ],
    steps: [
      { t: 'The customer snapshot is rebuilt every night', who: 'code', nodes: ['BQ', 'SNAP'], edges: ['e-load'], pay: 0,
        sum: 'About 1.2M clients from BigQuery become one point-in-time segmentation snapshot.',
        pts: ['A nightly job reads customer, lifecycle and engagement data from <b>BigQuery</b> and writes a versioned snapshot of roughly <b>1.2M clients</b>.',
          'Everything downstream reads from that snapshot instead of ad-hoc queries, so any queue item can be traced back to the data that produced it.',
          'A partial rebuild or a schema change quietly degrades queue quality. The snapshot is the first thing to check when the queues look wrong.'],
        why: '<b>Why a snapshot?</b> It gives every team the same reproducible view of the population for that day, which is what makes the prioritization explainable later.' },
      { t: 'Segments become ranked work queues', who: 'code', nodes: ['SNAP', 'QUEUE', 'WORK'], edges: ['e-rank', 'e-item'], pay: 1,
        sum: 'Segmentation turns a large population into retention and VIP queues a team can actually work.',
        pts: ['The queue builder turns segment and priority signals into <b>ranked work items</b>, each with reason codes such as an engagement drop on a high-value client.',
          'Agents work the queue from the operator workspace. Code decides who is in the queue; the AI never chooses who gets contacted.',
          'Bad ranking is the main risk at this step: it buries the team in low-value work. The exact scoring shown in the payload is illustrative.'] },
      { t: 'Only allowed context is gathered', who: 'code', nodes: ['WORK', 'SNAP', 'PII', 'PREP'], edges: ['e-open', 'e-profile', 'e-ctx'],
        sum: 'The prep service collects trusted client context, and redaction decides what may reach the model.',
        pts: ['When an agent opens a work item, the call-prep service gathers trusted context: the client profile, recent activity and the relevant policy.',
          'A redaction step removes PII and anything outside the allowed context before the task is built. It is drawn dashed because it is a design-level control; confirm the details before claiming them.',
          'The model works from the same facts the queue was built on, not from whatever happens to be in a CRM note.'] },
      { t: 'The model drafts the call prep', who: 'model', nodes: ['PREP', 'AI'], edges: ['e-call', 'e-reply'], pay: 2,
        sum: 'A call brief, talking points and an outreach draft, each tied back to its trusted source.',
        pts: ['The model gets the allowed context and a structured task, and returns a <b>call brief</b>, <b>talking points</b> and an <b>outreach draft</b>.',
          'Claims cite their source (profile, policy), so the agent can check them before using any of it.',
          'The model only writes. It does not decide who is contacted, through which channel, or whether anything is sent.'],
        why: '<b>Why so constrained?</b> Hallucinated or overconfident claims are the main failure mode, so the output is bound to trusted data and always goes to a person next.' },
      { t: 'A person approves, edits or rejects', who: 'human', nodes: ['PREP', 'REVIEW', 'CONS'], edges: ['e-draft', 'e-consent'], pay: 3,
        sum: 'Consequential outreach stays under human control and within the client’s consent.',
        pts: ['The agent reviews the draft and approves it, edits it or rejects it.',
          'The consent gate says which channels this client has agreed to (in the example, email yes and voice no), so an approved message can only go where it is allowed.',
          'Skipping this gate is a regulatory and customer risk, so there is no path from the model to a client that goes around it.'] },
      { t: 'Hand off to an allowed channel', who: 'code', nodes: ['REVIEW', 'VOICE'], edges: ['e-approve'],
        sum: 'Consent-aware engagement readiness: the approved action is prepared for the channel it is allowed on.',
        pts: ['The approved action moves to engagement readiness for the channel the consent gate allowed.',
          'Channel availability, timing or a change in consent can still invalidate it, so readiness is checked at hand-off as well as at review.'] },
      { t: 'Close the loop in the funnel', who: 'code', nodes: ['VOICE', 'SUPA', 'FUNNEL'], edges: ['e-outcome', 'e-report'], pay: 4,
        sum: 'Contact and outcome events roll up into management funnel reporting.',
        pts: ['Delivery status and outcome (for example <span class="mono">re-engaged</span>) are stored against the queue item in operational state. Supabase / Postgres is the design-level choice here.',
          'Funnel reporting reconciles queue, contact and outcome, so management sees delivered results rather than generated activity.'],
        why: '<b>The point of the project:</b> analytics became an operational queue, and outcome reporting closes the loop so the prioritization can be judged.' },
    ],
  },

  nexus: {
    title: 'Nexus · one permission-aware question',
    caption: 'One question through a permission-aware RAG agent. Identity travels with the request, permissions are checked before the model sees anything, and risky cases go to a person.',
    stats: [
      { n: '1', u: 'identity', l: 'user and tenant scope travel with the request through every node' },
      { n: '1', u: 'permission check', l: 'runs on retrieved chunks before the model sees any of them' },
      { n: '3', u: 'model families', l: 'Claude, GPT and Gemini behind one routed, structured call' },
      { n: '1', u: 'human path', l: 'high risk or a spent retry budget hands off with full state' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'GUARD', ...at(1, 0), kind: 'guard', name: 'Input guard', cap: 'scope check; blocks injection and PII', pills: ['Guardrails'] },
      { id: 'GRAPH', ...at(2, 0), kind: 'code', icon: 'graph', name: 'LangGraph workflow', cap: 'explicit nodes and state, bounded steps', pills: ['LangGraph'] },
      { id: 'LF', ...at(3, 0), kind: 'obs', name: 'LangFuse', cap: 'traces prompts, tools, models, failures', pills: ['sanitized'] },
      { id: 'USER', ...at(0, 1), kind: 'person', name: 'User + identity', cap: 'question plus user and tenant scope', pills: ['chat / API'] },
      { id: 'OUT', ...at(1, 1), kind: 'guard', icon: 'check', name: 'Output guard', cap: 'schema, citations and policy checks', pills: ['structured'] },
      { id: 'TOOL', ...at(2, 1), kind: 'code', icon: 'tool', name: 'Tool execution', cap: 'typed calls to backend systems', pills: ['timeouts'] },
      { id: 'RETR', ...at(3, 1), kind: 'store', icon: 'search', name: 'R2R hybrid retrieval', cap: 'vector + keyword over enterprise content', pills: ['R2R'] },
      { id: 'HUMAN', ...at(0, 2), kind: 'person', icon: 'review', name: 'Human escalation', cap: 'takes over with agent state and reason', pills: ['handoff'] },
      { id: 'LLM', ...at(1, 2), kind: 'llm', name: 'Multi-model LLM', cap: 'answers from supplied evidence only', pills: ['Claude · GPT · Gemini'] },
      { id: 'CTX', ...at(2, 2), kind: 'code', icon: 'layers', name: 'Context assembly', cap: 'authorized chunks + tool results, bounded' },
      { id: 'ACL', ...at(3, 2), kind: 'guard', icon: 'lock', name: 'Permission filter', cap: 'drops chunks the caller cannot read', pills: ['pre-generation'] },
    ],
    edges: [
      { id: 'e-ask', from: 'USER', to: 'GUARD', fromSide: 't', toSide: 'l', label: 'question + identity' },
      { id: 'e-clean', from: 'GUARD', to: 'GRAPH', fromSide: 'r', toSide: 'l', label: 'checked input' },
      { id: 'e-trace', from: 'GRAPH', to: 'LF', fromSide: 'r', toSide: 'l', dashed: true, label: 'every node' },
      { id: 'e-tool', from: 'GRAPH', to: 'TOOL', fromSide: 'b', toSide: 't', off: -40, label: 'typed call' },
      { id: 'e-retr', from: 'GRAPH', to: 'RETR', fromSide: 'b', toSide: 't', off: 40, toOff: -20, label: 'query + tenant' },
      { id: 'e-cand', from: 'RETR', to: 'ACL', fromSide: 'b', toSide: 't', label: 'candidates + scores' },
      { id: 'e-authz', from: 'ACL', to: 'CTX', fromSide: 'l', toSide: 'r', label: 'authorized' },
      { id: 'e-result', from: 'TOOL', to: 'CTX', fromSide: 'b', toSide: 't', off: -40, label: 'typed result' },
      { id: 'e-evid', from: 'CTX', to: 'LLM', fromSide: 'l', toSide: 'r', label: 'evidence' },
      { id: 'e-draft', from: 'LLM', to: 'OUT', fromSide: 't', toSide: 'b', off: 40, label: 'structured draft' },
      { id: 'e-answer', from: 'OUT', to: 'USER', fromSide: 'l', toSide: 'r', label: 'safe answer' },
      { id: 'e-escalate', from: 'OUT', to: 'HUMAN', fromSide: 'b', toSide: 't', off: -50, toOff: 50, label: 'risk · retries spent' },
    ],
    steps: [
      { t: 'A question arrives with an identity', who: 'person', nodes: ['USER', 'GUARD'], edges: ['e-ask'], pay: 0,
        sum: 'Every later retrieval and tool call is evaluated in this caller’s authorization context.',
        pts: ['The request carries the question plus the <b>user and tenant identity</b>, and that identity travels with it through every node.',
          'Input guardrails check scope and block or strip unsafe input, such as prompt injection or sensitive data, before the agent runs.',
          'Losing identity between layers is how RAG turns into a data-leak path, so it is attached at the edge instead of looked up later.'] },
      { t: 'LangGraph decides the next node', who: 'code', nodes: ['GUARD', 'GRAPH', 'LF'], edges: ['e-clean', 'e-trace'],
        sum: 'Agent execution is an explicit state machine, not an open-ended loop.',
        pts: ['The checked request enters a <b>LangGraph</b> workflow. Each node returns the next node plus updated state, so a run can be inspected and is bounded.',
          'Routing and planning decide whether this question needs retrieval, a tool, or both. The router and planner nodes are design-level detail.',
          'Prompts, tool calls, model choices and failures are traced to <b>LangFuse</b>, sanitized so the traces do not leak the context they describe.'],
        why: '<b>Why a graph?</b> Unbounded ReAct loops create runaway cost and tool use. A graph makes every transition explicit and countable.' },
      { t: 'Hybrid retrieval finds candidates', who: 'code', nodes: ['GRAPH', 'RETR'], edges: ['e-retr'], pay: 1,
        sum: 'R2R runs hybrid search with a tenant filter and returns scored candidate chunks.',
        pts: ['<b>R2R</b> runs hybrid (vector + keyword) retrieval over indexed enterprise content, using the query and the tenant filter.',
          'It returns candidates with scores. A high score means relevant, not allowed: in the payload, <span class="mono">ch_2</span> scores 0.87 but belongs to another team.'] },
      { t: 'Permissions are checked before generation', who: 'code', nodes: ['RETR', 'ACL', 'CTX'], edges: ['e-cand', 'e-authz'], pay: 2,
        sum: 'Only chunks this user may read are kept. Filtering after generation would be too late.',
        pts: ['The permission filter checks each candidate against the caller’s groups and drops the rest: <span class="mono">ch_1</span> stays, <span class="mono">ch_2</span> is filtered out.',
          'This happens <b>before</b> the model sees anything. Once a chunk is in the prompt, no output filter can reliably take it back out.'],
        why: '<b>Why here?</b> The vector store is not treated as globally readable. Authorization belongs to each chunk and is checked on every request.' },
      { t: 'Tools are explicit, typed calls', who: 'code', nodes: ['GRAPH', 'TOOL', 'CTX'], edges: ['e-tool', 'e-result'],
        sum: 'When the plan needs live data or an action, the tool node makes a typed call with timeouts and retries.',
        pts: ['A tool call is a typed state transition: a typed call goes in, a typed result or error comes out.',
          'Tools touch real systems, so they need auth, idempotency and timeouts. The timeout, retry and circuit-breaker wrapper is design-level detail.',
          'Tool results join the authorized chunks in context assembly, which builds one bounded evidence package.'] },
      { t: 'The model answers from evidence', who: 'model', nodes: ['CTX', 'LLM', 'OUT'], edges: ['e-evid', 'e-draft'], pay: 3,
        sum: 'Claude, GPT or Gemini generate a structured answer with sources, which is validated before it goes anywhere.',
        pts: ['The model gets the system policy, the evidence package and the task, and returns a structured draft in an <span class="mono">AnswerWithSources</span> shape.',
          'Routing across <b>Claude / GPT / Gemini</b>, prompt and model versioning, evals, and retries with fallbacks sit around this call.',
          'The output guard checks the shape, the citations and the policy. Free-form output would break the automation downstream.'] },
      { t: 'A safe answer, or a person takes over', who: 'code', nodes: ['OUT', 'USER', 'HUMAN'], edges: ['e-answer', 'e-escalate'], pay: 4,
        sum: 'Validated answers go back to the user; risky cases or a spent retry budget go to a person with full context.',
        pts: ['If validation passes, the answer and its sources return to the user.',
          'If the risk is high or the retry budget is spent (two tool failures in the payload), the graph routes to <b>human escalation</b>.',
          'The handoff carries the agent state and the reason, so the person does not have to restart the investigation.'] },
    ],
  },

  dems: {
    title: 'DEMS / Lasso · one feature change, traced to its owners',
    caption: 'One feature materialization, from a non-blocking emit to an owner alert. The ledger keeps the history; drift, freshness and lineage are all read from it.',
    stats: [
      { n: '11', u: 'days', l: 'of silent forecast drift at an earlier job that shaped this design' },
      { n: '0', u: 'blocking writes', l: 'telemetry is emitted asynchronously, off the request path' },
      { n: '1', u: 'append-only ledger', l: 'the single history every analytic reads from' },
      { n: '3', u: 'signals', l: 'drift, freshness and lineage, checked separately' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'FS', ...at(0, 0), kind: 'store', icon: 'db', name: 'Feature store events', cap: 'read, write and materialization metadata', pills: ['data plane'] },
      { id: 'EMIT', ...at(1, 0), kind: 'code', icon: 'send', name: 'Lasso async emitter', cap: 'sample, buffer, batch; never blocks serving', pills: ['non-blocking'] },
      { id: 'BUS', ...at(2, 0), kind: 'code', icon: 'layers', name: 'Kafka transport', cap: 'buffers producers from analytics consumers', pills: ['Kafka'] },
      { id: 'LEDGER', ...at(3, 0), kind: 'store', icon: 'list', name: 'Append-only ledger', cap: 'immutable, ordered event history', pills: ['DEMS'] },
      { id: 'REG', ...at(0, 1), kind: 'code', icon: 'file', name: 'Model lifecycle events', cap: 'register, promote and deploy changes' },
      { id: 'LIN', ...at(1, 1), kind: 'code', icon: 'graph', name: 'Lineage index', cap: 'features and events mapped to models' },
      { id: 'SLA', ...at(2, 1), kind: 'code', icon: 'pulse', name: 'Freshness / SLA checks', cap: 'late, missing or stale upstream data' },
      { id: 'DRIFT', ...at(3, 1), kind: 'code', icon: 'chart', name: 'PSI / KS drift', cap: 'current vs baseline input distributions', pills: ['PSI · KS'] },
      { id: 'SERVE', ...at(0, 2), kind: 'obs', name: 'Serving telemetry', cap: 'requests, feature stats, latency, errors' },
      { id: 'IMPACT', ...at(1, 2), kind: 'code', icon: 'search', name: 'Impact analysis', cap: 'which models, endpoints and owners' },
      { id: 'ALERT', ...at(2, 2), kind: 'guard', icon: 'shield', name: 'Alert / retrain signal', cap: 'notify the owner; no blind retraining', pills: ['governed'] },
      { id: 'BASE', ...at(3, 2), kind: 'store', icon: 'db', name: 'Training baseline', cap: 'reference window to compare against' },
    ],
    edges: [
      { id: 'e-fs', from: 'FS', to: 'EMIT', fromSide: 'r', toSide: 'l', toOff: -30, label: 'feature event' },
      { id: 'e-reg', from: 'REG', to: 'EMIT', fromSide: 'r', toSide: 'l', toOff: 0, label: 'lifecycle' },
      { id: 'e-serve', from: 'SERVE', to: 'EMIT', fromSide: 'r', toSide: 'l', toOff: 30, label: 'serving stats' },
      { id: 'e-batch', from: 'EMIT', to: 'BUS', fromSide: 'r', toSide: 'l', dashed: true, label: 'async batch' },
      { id: 'e-append', from: 'BUS', to: 'LEDGER', fromSide: 'r', toSide: 'l', label: 'append' },
      { id: 'e-lin', from: 'LEDGER', to: 'LIN', fromSide: 'b', toSide: 't', off: -80, toOff: 0, label: 'dependencies' },
      { id: 'e-fresh', from: 'LEDGER', to: 'SLA', fromSide: 'b', toSide: 't', off: -40, toOff: 0, label: 'event times' },
      { id: 'e-win', from: 'LEDGER', to: 'DRIFT', fromSide: 'b', toSide: 't', off: 40, label: 'new window' },
      { id: 'e-base', from: 'BASE', to: 'DRIFT', fromSide: 't', toSide: 'b', off: 40, label: 'baseline' },
      { id: 'e-drift', from: 'DRIFT', to: 'ALERT', fromSide: 'b', toSide: 't', off: -60, toOff: 60, label: 'severity' },
      { id: 'e-stale', from: 'SLA', to: 'ALERT', fromSide: 'b', toSide: 't', off: -40, label: 'violation' },
      { id: 'e-impact', from: 'LIN', to: 'IMPACT', fromSide: 'b', toSide: 't', label: 'impact graph' },
      { id: 'e-owners', from: 'IMPACT', to: 'ALERT', fromSide: 'r', toSide: 'l', label: 'models+owners' },
    ],
    steps: [
      { t: 'Data and model changes become events', who: 'code', nodes: ['FS', 'REG', 'SERVE', 'EMIT'], edges: ['e-fs', 'e-reg', 'e-serve'],
        sum: 'Feature writes, model lifecycle changes and serving stats are all treated as operational events.',
        pts: ['The feature store reports reads, writes and materializations. The model registry reports register, promote and deploy. Serving reports requests, feature stats, latency and errors.',
          'Instrumenting the data plane matters most. A model can keep returning <b>200 OK</b> while its inputs have quietly gone wrong.',
          'Model events are what let a later drift signal be tied to a specific model version.'],
        why: '<b>Why all three?</b> Availability is not model health. Without data and lifecycle events, nothing connects a bad input to the model that consumed it.' },
      { t: 'Emit without slowing the request', who: 'code', nodes: ['EMIT', 'BUS'], edges: ['e-batch'], pay: 0,
        sum: 'The Lasso emitter queues the event and returns. Serving never waits on a database write.',
        pts: ['A <span class="mono">feature_materialized</span> event with row count and null ratio is queued and gets an <span class="mono">event_id</span> straight away.',
          'Sampling, buffering and batching happen in the emitter library. Those internals are design-level detail.',
          'Under backpressure the rule is to drop or degrade telemetry before degrading inference.'] },
      { t: 'The ledger keeps the history', who: 'code', nodes: ['BUS', 'LEDGER'], edges: ['e-append'], pay: 1,
        sum: 'Kafka decouples producers from consumers, and each event is appended to an immutable ledger.',
        pts: ['The event lands in a partition with a sequence number and a schema version, and it is never updated in place.',
          'Mutable state would lose the order of events, which is exactly what you need to reconstruct an incident.',
          'Consumer lag can hide an incident, so the pipeline needs its own lag and dropped-event monitoring. That part is design-level.'],
        why: '<b>Why append-only?</b> It answers “what changed, and when did it start?” long after the fact, for audits and post-mortems.' },
      { t: 'Freshness is checked on its own', who: 'code', nodes: ['LEDGER', 'SLA'], edges: ['e-fresh'],
        sum: 'Event times, row counts and null ratios are checked against freshness and completeness expectations.',
        pts: ['A schema can be valid while the data behind it is late or stale. That is a separate failure from drift.',
          'Validity, freshness and distribution are monitored separately, so one healthy signal does not mask another.'] },
      { t: 'Drift is measured against a baseline', who: 'code', nodes: ['LEDGER', 'BASE', 'DRIFT'], edges: ['e-win', 'e-base'], pay: 2,
        sum: 'PSI and KS compare the serving window with the training window for the changed feature.',
        pts: ['For <span class="mono">fs:spend:v12</span>, the payload shows a PSI of 0.18 marked as a warning. The values are illustrative, and exact production thresholds are not claimed here.',
          'This catches input-distribution change without waiting for labels.',
          'PSI and KS detect covariate drift. They do not prove that the relationship to the target has changed.'] },
      { t: 'Lineage shows who is affected', who: 'code', nodes: ['LEDGER', 'LIN', 'IMPACT'], edges: ['e-lin', 'e-impact'], pay: 3,
        sum: 'The lineage index maps the feature to the models, endpoints and owners that depend on it.',
        pts: ['Given <span class="mono">fs:spend:v12</span>, impact analysis returns the dependent models (<span class="mono">reco:v41</span>, <span class="mono">vip:v9</span>) and the owning team.',
          'Lineage is built from platform events, not reconstructed by hand from notebooks after the incident.',
          'Missing instrumentation leaves blind spots, and stale ownership data slows the response.'] },
      { t: 'The owner is told, not auto-retrained', who: 'human', nodes: ['DRIFT', 'SLA', 'IMPACT', 'ALERT'], edges: ['e-drift', 'e-stale', 'e-owners'], pay: 4,
        sum: 'A breach becomes an alert to the owning team, with the affected models attached.',
        pts: ['The action in the payload is <span class="mono">notify_owner</span> with <span class="mono">auto_retrain: false</span>.',
          'Drift starts an investigation or a governed retraining workflow. Retraining on every drift signal can be unsafe.',
          'The alert links straight to lineage and owners, so the team starts from impact rather than a search.'],
        why: '<b>The point of the project:</b> it turns “the endpoint is up” into “the ML system is behaving as expected.” The 11-day silent drift seen earlier would surface as an alert instead.' },
    ],
  },

  ekaconnect: {
    title: 'EkaConnect · one WhatsApp message, one customer history',
    caption: 'One inbound WhatsApp message, normalized into a canonical conversation, checked for identity and consent, answered once, and written to the owned CRM.',
    stats: [
      { n: '5', u: 'channels', l: 'WhatsApp, Telegram, Instagram, Messenger and email' },
      { n: '1', u: 'conversation model', l: 'every provider payload is normalized before business logic' },
      { n: '1', u: 'idempotency key', l: 'per outbound action, so a retry never sends twice' },
      { n: '1', u: 'writer', l: 'per capability during the phased move off HubSpot' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'CH', ...at(0, 0), kind: 'person', name: 'Channel providers', cap: 'customer writes on WhatsApp, email, etc.', pills: ['external'] },
      { id: 'ADAPT', ...at(1, 0), kind: 'code', icon: 'tool', name: 'Channel adapters', cap: 'provider APIs kept out of the core', pills: ['webhooks'] },
      { id: 'CANON', ...at(2, 0), kind: 'code', icon: 'layers', name: 'Canonical conversation', cap: 'one model for every channel', pills: ['conv + msg'] },
      { id: 'ID', ...at(3, 0), kind: 'code', icon: 'search', name: 'Identity resolution', cap: 'links channel IDs to a known contact' },
      { id: 'STATE', ...at(0, 1), kind: 'code', icon: 'list', name: 'Delivery state machine', cap: 'sent, delivered, failed, read, replied' },
      { id: 'INBOX', ...at(2, 1), kind: 'person', icon: 'review', name: '361-Inboxes', cap: 'agents see and act on one thread', pills: ['human'] },
      { id: 'CONSENT', ...at(3, 1), kind: 'guard', icon: 'lock', name: 'Consent gate', cap: 'channel + purpose: allowed or blocked' },
      { id: 'CRM', ...at(0, 2), kind: 'store', icon: 'db', name: 'Owned CRM', cap: 'contact, lead and opportunity records', pills: ['target'] },
      { id: 'HUB', ...at(1, 2), kind: 'store', name: 'HubSpot legacy', cap: 'replaced in phases, not big-bang', pills: ['legacy'] },
      { id: 'DISPATCH', ...at(2, 2), kind: 'guard', icon: 'send', name: 'Idempotent dispatch', cap: 'one send per action, even on retry', pills: ['idempotency key'] },
      { id: 'JOURNEY', ...at(3, 2), kind: 'code', icon: 'graph', name: 'Journey automation', cap: 'lifecycle rules for routine steps' },
    ],
    edges: [
      { id: 'e-in', from: 'CH', to: 'ADAPT', fromSide: 'r', toSide: 'l', off: -12, label: 'message' },
      { id: 'e-out', from: 'ADAPT', to: 'CH', fromSide: 'l', toSide: 'r', off: 12, label: 'send' },
      { id: 'e-norm', from: 'ADAPT', to: 'CANON', fromSide: 'r', toSide: 'l', label: 'envelope' },
      { id: 'e-resolve', from: 'CANON', to: 'ID', fromSide: 'r', toSide: 'l', label: 'identities' },
      { id: 'e-consent', from: 'ID', to: 'CONSENT', fromSide: 'b', toSide: 't', label: 'contact_id' },
      { id: 'e-human', from: 'CONSENT', to: 'INBOX', fromSide: 'l', toSide: 'r', label: 'allowed' },
      { id: 'e-auto', from: 'CONSENT', to: 'JOURNEY', fromSide: 'b', toSide: 't', label: 'allowed trigger' },
      { id: 'e-reply', from: 'INBOX', to: 'DISPATCH', fromSide: 'b', toSide: 't', label: 'agent reply' },
      { id: 'e-plan', from: 'JOURNEY', to: 'DISPATCH', fromSide: 'l', toSide: 'r', label: 'planned' },
      { id: 'e-send', from: 'DISPATCH', to: 'ADAPT', fromSide: 'l', toSide: 'b', off: -30, toOff: 40, label: 'send(action_id)' },
      { id: 'e-cb', from: 'ADAPT', to: 'STATE', fromSide: 'b', toSide: 'r', off: -40, toOff: 0, label: 'callbacks' },
      { id: 'e-crm', from: 'STATE', to: 'CRM', fromSide: 'b', toSide: 't', label: 'interaction' },
      { id: 'e-hub', from: 'CRM', to: 'HUB', fromSide: 'r', toSide: 'l', dashed: true, label: 'one writer' },
    ],
    steps: [
      { t: 'A message arrives on one channel', who: 'person', nodes: ['CH', 'ADAPT', 'CANON'], edges: ['e-in', 'e-norm'], pay: 0,
        sum: 'A WhatsApp webhook becomes a canonical message inside a canonical conversation.',
        pts: ['The adapter takes the provider payload (<span class="mono">wamid.123</span>) and emits <span class="mono">msg_91</span> in <span class="mono">conv_44</span>, marked inbound on WhatsApp.',
          'Each provider has its own IDs, retry rules and delivery semantics. Adapters keep all of that out of the core model.',
          'Signature checks and dedupe on <span class="mono">provider_message_id</span> belong at this boundary. They are design-level detail.'],
        why: '<b>Why normalize first?</b> Customers do not think in channels. If business logic is built per channel, one person becomes three disconnected threads.' },
      { t: 'Identity is resolved carefully', who: 'code', nodes: ['CANON', 'ID'], edges: ['e-resolve'],
        sum: 'The phone number and provider IDs are linked to a known contact only when the evidence is strong enough.',
        pts: ['The channel identity resolves to <span class="mono">contact_204</span> with high match confidence.',
          'Over-matching is the bigger risk: merging two different people is worse than leaving an identity unresolved.',
          'This is what lets an email, a Telegram reply and a WhatsApp message end up in one customer history.'] },
      { t: 'Consent is checked before any action', who: 'code', nodes: ['ID', 'CONSENT'], edges: ['e-consent'], pay: 1,
        sum: 'Consent and preferences are evaluated once, per channel and purpose, before anyone replies or automates.',
        pts: ['In the payload this contact allows WhatsApp but not marketing, so a support reply is fine and a promotion is not.',
          'Stale consent is a legal and customer risk, so both the human and the automated path go through the same gate.'] },
      { t: 'A person or a journey decides the reply', who: 'human', nodes: ['CONSENT', 'INBOX', 'JOURNEY'], edges: ['e-human', 'e-auto'], pay: 2,
        sum: 'This support conversation goes to an agent in 361-Inboxes. Routine lifecycle steps can go to journey automation.',
        pts: ['The decision here is <span class="mono">owner: agent_8</span>, <span class="mono">automation: none</span>, next action a human reply.',
          'Agents see the whole cross-channel thread in one workspace instead of switching tools.',
          'Two agents acting on one thread is a real race, so assignment and status are explicit conversation state.'] },
      { t: 'The reply is sent exactly once', who: 'code', nodes: ['INBOX', 'JOURNEY', 'DISPATCH', 'ADAPT', 'CH'], edges: ['e-reply', 'e-plan', 'e-send', 'e-out'], pay: 3,
        sum: 'Every outbound action carries an idempotency key, so a retry after a timeout cannot send a duplicate.',
        pts: ['<span class="mono">reply_918</span> is both the action ID and the idempotency key. The provider returns <span class="mono">p_701</span> and the state becomes <span class="mono">sent</span>.',
          'A network timeout makes it unclear whether the send happened. The key makes retrying safe.',
          'Sends go back out through the same adapters, so provider details stay in one place.'],
        why: '<b>Why idempotent?</b> Automation without idempotency and consent checks is how a system ends up spamming people.' },
      { t: 'Callbacks reconcile the real outcome', who: 'code', nodes: ['ADAPT', 'STATE', 'CRM'], edges: ['e-cb', 'e-crm'], pay: 4,
        sum: 'Delivery callbacks move an explicit state machine, and the interaction is written to the owned CRM.',
        pts: ['The <span class="mono">delivered</span> callback moves the conversation to <span class="mono">awaiting_customer</span> and creates CRM activity <span class="mono">act_482</span>.',
          'Callbacks can arrive late or out of order, so states are explicit and reconcilable instead of inferred.',
          'Attribution reads these same records to connect engagement to lifecycle and commercial outcomes.'] },
      { t: 'The CRM moves over one writer at a time', who: 'code', nodes: ['CRM', 'HUB'], edges: ['e-hub'],
        sum: 'HubSpot is replaced in phases, and each capability has exactly one writer during its cutover.',
        pts: ['Identity, journeys, lead and opportunity workflows move to the owned CRM one by one.',
          'Long-lived dual-write would create two sources of truth that disagree. One writer per capability avoids that.'],
        why: '<b>The point of the project:</b> one customer, one history, one consent-aware action model, whichever channel they use next.' },
    ],
  },

  event360: {
    title: 'Event360 · one lifecycle change, decided in minutes',
    caption: 'One client moves from active to at risk. The event is made durable, a Temporal workflow decides with deterministic rules, and the model only drafts content after that decision.',
    stats: [
      { n: '<5', u: 'minutes', l: 'lifecycle evaluation, down from an overnight batch' },
      { n: '4', u: 'core systems', l: 'BigQuery, NATS JetStream, Redis and Temporal' },
      { n: '0', u: 'eligibility calls to a model', l: 'who qualifies is decided by deterministic rules' },
      { n: '1', u: 'approval gate', l: 'policy or human approval before any external send' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'BQ', ...at(0, 0), kind: 'store', icon: 'db', name: 'BigQuery lifecycle', cap: 'system-of-record lifecycle facts', pills: ['source'] },
      { id: 'PROD', ...at(1, 0), kind: 'code', icon: 'send', name: 'Event producer', cap: 'turns a changed fact into an event', pills: ['versioned'] },
      { id: 'CONTRACT', ...at(2, 0), kind: 'guard', icon: 'check', name: 'Schema + identity', cap: 'validates the envelope and event ID' },
      { id: 'NATS', ...at(3, 0), kind: 'store', icon: 'layers', name: 'NATS JetStream', cap: 'durable event backbone, redelivers', pills: ['durable'] },
      { id: 'APPROVAL', ...at(0, 1), kind: 'person', icon: 'review', name: 'Policy / human gate', cap: 'approve, reject or revise before sending', pills: ['gate'] },
      { id: 'GEN', ...at(1, 1), kind: 'llm', name: 'Model-assisted content', cap: 'drafts the message from approved facts', pills: ['after decision'] },
      { id: 'ELIG', ...at(2, 1), kind: 'guard', icon: 'shield', name: 'Eligibility rules', cap: 'eligible or not, with reason codes', pills: ['deterministic'] },
      { id: 'TEMP', ...at(3, 1), kind: 'code', icon: 'graph', name: 'Temporal workflow', cap: 'retries, timers, signals, approvals', pills: ['Temporal'] },
      { id: 'ENGAGE', ...at(0, 2), kind: 'code', icon: 'send', name: 'Engagement layer', cap: 'sends the approved action to a channel' },
      { id: 'RECON', ...at(1, 2), kind: 'code', icon: 'check', name: 'Reconciliation', cap: 'attempted send vs real outcome' },
      { id: 'END', ...at(2, 2), kind: 'code', icon: 'file', name: 'Stop + reason', cap: 'explicit, auditable no-op' },
      { id: 'REDIS', ...at(3, 2), kind: 'store', icon: 'db', name: 'Redis online state', cap: 'recent activity, consent, locks', pills: ['fast'] },
    ],
    edges: [
      { id: 'e-fact', from: 'BQ', to: 'PROD', fromSide: 'r', toSide: 'l', label: 'changed fact' },
      { id: 'e-env', from: 'PROD', to: 'CONTRACT', fromSide: 'r', toSide: 'l', label: 'envelope' },
      { id: 'e-pub', from: 'CONTRACT', to: 'NATS', fromSide: 'r', toSide: 'l', label: 'publish / ack' },
      { id: 'e-deliver', from: 'NATS', to: 'TEMP', fromSide: 'b', toSide: 't', label: 'durable delivery' },
      { id: 'e-load', from: 'TEMP', to: 'REDIS', fromSide: 'b', toSide: 't', off: -12, label: 'load state' },
      { id: 'e-state', from: 'REDIS', to: 'TEMP', fromSide: 't', toSide: 'b', off: 12 },
      { id: 'e-eval', from: 'TEMP', to: 'ELIG', fromSide: 'l', toSide: 'r', label: 'facts+policy' },
      { id: 'e-no', from: 'ELIG', to: 'END', fromSide: 'b', toSide: 't', label: 'not eligible' },
      { id: 'e-yes', from: 'ELIG', to: 'GEN', fromSide: 'l', toSide: 'r', label: 'eligible' },
      { id: 'e-draft', from: 'GEN', to: 'APPROVAL', fromSide: 'l', toSide: 'r', label: 'draft' },
      { id: 'e-approved', from: 'APPROVAL', to: 'ENGAGE', fromSide: 'b', toSide: 't', label: 'approved action' },
      { id: 'e-result', from: 'ENGAGE', to: 'RECON', fromSide: 'r', toSide: 'l', label: 'callback' },
      { id: 'e-reason', from: 'END', to: 'RECON', fromSide: 'l', toSide: 'r', label: 'reason code' },
    ],
    steps: [
      { t: 'A lifecycle fact changes', who: 'code', nodes: ['BQ', 'PROD'], edges: ['e-fact'],
        sum: 'A client moves from active to at risk, and the producer turns that change into an event right away.',
        pts: ['The old model was batch-first: a change at 2 PM might not be evaluated until the overnight job ran.',
          'The producer emits <span class="mono">lifecycle.stage_changed</span> for <span class="mono">c_81273</span> with a stable <span class="mono">event_id</span> and a schema version.'],
        why: '<b>Why an event?</b> It separates “a fact changed” from “what should happen now,” so the decision can run when the fact changes instead of overnight.' },
      { t: 'The event becomes durable', who: 'code', nodes: ['PROD', 'CONTRACT', 'NATS'], edges: ['e-env', 'e-pub'], pay: 0,
        sum: 'The envelope is validated and published to NATS JetStream, which acknowledges it as durably accepted.',
        pts: ['<span class="mono">evt_9f1</span> lands on the <span class="mono">lifecycle</span> stream with status <span class="mono">durably_accepted</span>.',
          'Schema validation and the idempotency key are checked at ingress. That boundary is drawn dashed because it is design-level.',
          'JetStream will redeliver, so every consumer downstream has to be idempotent.'] },
      { t: 'Temporal owns the business process', who: 'code', nodes: ['NATS', 'TEMP'], edges: ['e-deliver'],
        sum: 'Delivery starts a durable workflow that survives retries, timers, signals and waits for a person.',
        pts: ['Each step is recorded in workflow history, so a worker crash resumes the process instead of restarting or duplicating it.',
          'Workflow code must be deterministic and activities idempotent, or replays cause problems.'] },
      { t: 'Fast state is assembled', who: 'code', nodes: ['TEMP', 'REDIS'], edges: ['e-load', 'e-state'], pay: 1,
        sum: 'The workflow reads recent activity, consent and any active workflow from Redis.',
        pts: ['The snapshot says 18 days since recent activity, email consent yes, no active workflow, at <span class="mono">state_version</span> 41.',
          'The state version is carried into the decision, so it can be explained later against the exact facts it used.',
          'Stale cache or weak keys would make decisions inconsistent, so keying and versioning matter here.'] },
      { t: 'Eligibility stays deterministic', who: 'code', nodes: ['TEMP', 'ELIG', 'END'], edges: ['e-eval', 'e-no'], pay: 2,
        sum: 'Rules decide who qualifies, with reason codes and a policy version. A no is recorded, not dropped.',
        pts: ['Under <span class="mono">retention-v7</span> the client is eligible with reason codes <span class="mono">at_risk</span> and <span class="mono">contactable</span>.',
          'If not eligible, the workflow records a no-op with a reason, so the behaviour can still be explained.'],
        why: '<b>Why not a model here?</b> Putting an LLM in the eligibility decision would make policy behaviour non-deterministic.' },
      { t: 'The model drafts content, after the decision', who: 'model', nodes: ['ELIG', 'GEN'], edges: ['e-yes'], pay: 3,
        sum: 'Only eligible cases reach the model, which drafts a message from approved facts and a template.',
        pts: ['The input is the approved facts (<span class="mono">at_risk</span>, <span class="mono">email_allowed</span>) and the <span class="mono">retention_reengage</span> template.',
          'The draft records the model and prompt version (<span class="mono">pv_31</span>) and any policy flags.',
          'Unsupported claims, PII leakage and tone are the risks, which is why the draft goes to a gate next.'] },
      { t: 'Approval, then one idempotent send', who: 'human', nodes: ['GEN', 'APPROVAL', 'ENGAGE'], edges: ['e-draft', 'e-approved'], pay: 4,
        sum: 'Policy or a person approves the draft, and the engagement layer dispatches it once.',
        pts: ['The approved action <span class="mono">act_552</span> goes out on email, using its action ID as the idempotency key.',
          'Temporal handles the human wait as a signal, so a slow approval does not lose the workflow.',
          'Skipping the gate would turn probabilistic output into an uncontrolled side effect.'] },
      { t: 'The real outcome closes the loop', who: 'code', nodes: ['ENGAGE', 'END', 'RECON'], edges: ['e-result', 'e-reason'], pay: 5,
        sum: 'Delivery callbacks and recorded no-ops are reconciled, and the workflow completes.',
        pts: ['The provider reports <span class="mono">delivered</span> and the workflow is marked <span class="mono">completed</span>.',
          'Without reconciliation, the system would confuse an attempted send with a real outcome.',
          'The outcome is written back to lifecycle data, so the next evaluation starts from what actually happened.'],
        why: '<b>The point of the project:</b> real-time transport made the loop take minutes instead of a night, and deterministic rules kept it controlled.' },
    ],
  },

  "feature-store": {
    title: 'Feature store · one feature, train to serve',
    caption: 'One feature, customer_30d_spend, from its registered contract to a training row, an online lookup and a lineage edge. The same definition drives every path, and time is part of the contract.',
    stats: [
      { n: '3.1% → 0.4%', u: 'train-serve skew', l: 'resume-backed result of sharing one feature contract across paths' },
      { n: '1', u: 'feature contract', l: 'schema, entity, event time and freshness drive offline and online' },
      { n: '2', u: 'online tiers', l: 'Redis for hot point lookups, ScyllaDB for bulk and high-cardinality' },
      { n: 'minutes', u: 'PII impact analysis', l: 'which models use a feature, answered from lineage metadata' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'DEF', ...at(0, 0), kind: 'code', icon: 'file', name: 'Feature definition SDK', cap: 'schema, entity, event time, freshness', pills: ['registry'] },
      { id: 'ING', ...at(1, 0), kind: 'code', icon: 'layers', name: 'Batch/stream pipeline', cap: 'one transformation, written to every store', pills: ['versioned'] },
      { id: 'ICE', ...at(2, 0), kind: 'store', icon: 'db', name: 'Trino + Iceberg', cap: 'offline history with snapshots', pills: ['time travel'] },
      { id: 'TRAIN', ...at(3, 0), kind: 'code', icon: 'list', name: 'PIT-correct training', cap: 'feature_time <= label time, per row', pills: ['no leakage'] },
      { id: 'GOV', ...at(0, 1), kind: 'guard', icon: 'shield', name: 'Governance', cap: 'schema, PII class, freshness, ownership' },
      { id: 'REDIS', ...at(1, 1), kind: 'store', icon: 'db', name: 'Redis hot tier', cap: 'latency-critical point lookups', pills: ['hot'] },
      { id: 'SCY', ...at(2, 1), kind: 'store', icon: 'db', name: 'ScyllaDB bulk tier', cap: 'large, high-cardinality online values', pills: ['bulk'] },
      { id: 'MLF', ...at(3, 1), kind: 'code', icon: 'review', name: 'MLflow registry', cap: 'model version + exact feature versions', pills: ['MLflow'] },
      { id: 'OBS', ...at(0, 2), kind: 'obs', icon: 'pulse', name: 'Materialization SLIs', cap: 'freshness and missing-value telemetry' },
      { id: 'SERVE', ...at(1, 2), kind: 'code', icon: 'send', name: 'Online model serving', cap: 'feature vector under a latency budget', pills: ['online'] },
      { id: 'LINEAGE', ...at(3, 2), kind: 'store', icon: 'graph', name: 'Feature lineage', cap: 'feature → model → endpoint graph', pills: ['impact'] },
    ],
    edges: [
      { id: 'e-gov', from: 'GOV', to: 'DEF', fromSide: 't', toSide: 'b', dashed: true, label: 'schema · PII' },
      { id: 'e-def', from: 'DEF', to: 'ING', fromSide: 'r', toSide: 'l', label: 'definition' },
      { id: 'e-off', from: 'ING', to: 'ICE', fromSide: 'r', toSide: 'l', label: 'snapshots' },
      { id: 'e-hot', from: 'ING', to: 'REDIS', fromSide: 'b', toSide: 't', label: 'hot features' },
      { id: 'e-bulk', from: 'ING', to: 'SCY', fromSide: 'b', toSide: 't', off: 60, toOff: 0, label: 'bulk features' },
      { id: 'e-pit', from: 'ICE', to: 'TRAIN', fromSide: 'r', toSide: 'l', label: 'PIT join' },
      { id: 'e-mlf', from: 'TRAIN', to: 'MLF', fromSide: 'b', toSide: 't', label: 'model + feature IDs' },
      { id: 'e-lin', from: 'MLF', to: 'LINEAGE', fromSide: 'b', toSide: 't', label: 'dependency edges' },
      { id: 'e-redis', from: 'REDIS', to: 'SERVE', fromSide: 'b', toSide: 't', label: 'point lookup' },
      { id: 'e-scy', from: 'SCY', to: 'SERVE', fromSide: 'b', toSide: 'r', label: 'bulk read' },
      { id: 'e-obs', from: 'SERVE', to: 'OBS', fromSide: 'l', toSide: 'r', dashed: true, label: 'freshness' },
    ],
    steps: [
      { t: 'The feature is registered as a contract', who: 'person', nodes: ['DEF', 'GOV'], edges: ['e-gov'], pay: 0,
        sum: 'A data scientist declares customer_30d_spend once, with its entity, type, event time and freshness.',
        pts: ['The SDK turns the spec into a versioned definition, here <span class="mono">fs:customer_30d_spend:v12</span>.',
          'Event time is part of the contract. Without it, nothing downstream can do a correct historical join.',
          'Schema, PII class and ownership checks sit at this edge. That governance box is drawn dashed because it is design-level.'],
        why: '<b>Why a contract?</b> The old failure was the same feature written three ways: for training, for serving and in a notebook. One definition removes that choice.' },
      { t: 'One pipeline writes every store', who: 'code', nodes: ['DEF', 'ING', 'ICE', 'REDIS', 'SCY'], edges: ['e-def', 'e-off', 'e-hot', 'e-bulk'], pay: 1,
        sum: 'The same transformation materializes the value offline and online, so both sides agree.',
        pts: ['The batch or stream pipeline computes the value once and writes an <b>Iceberg snapshot</b> plus an online version.',
          'Hot, latency-critical features go to <b>Redis</b>. Large or high-cardinality ones go to <b>ScyllaDB</b>.',
          'Divergent write paths are the main skew risk, so there is only one.'],
        why: '<b>Why two online tiers?</b> Keeping everything in Redis is expensive at volume. The tier follows the access pattern, not one store for all.' },
      { t: 'Training rows only see the past', who: 'code', nodes: ['ICE', 'TRAIN'], edges: ['e-pit'], pay: 2,
        sum: 'For a label at time t, the join only uses feature values with feature_time <= t.',
        pts: ['The point-in-time join reads Iceberg history, using snapshots and explicit event time.',
          'Joining the latest value instead would leak future state and make offline metrics look better than production.',
          'Snapshots also make the training set reproducible later.'],
        why: '<b>Why it matters:</b> leakage gives great offline numbers and a model that disappoints once it is live.' },
      { t: 'The model is registered with its features', who: 'person', nodes: ['TRAIN', 'MLF'], edges: ['e-mlf'],
        sum: 'MLflow stores the model next to the exact feature versions and snapshot it was trained on.',
        pts: ['A model version is not reproducible unless its feature versions are known.',
          'The registry entry carries feature refs, not just the artifact and metrics.'] },
      { t: 'Serving reads the same feature online', who: 'code', nodes: ['REDIS', 'SCY', 'SERVE'], edges: ['e-redis', 'e-scy'], pay: 3,
        sum: 'At request time the serving path fetches the feature vector by entity key from the right tier.',
        pts: ['A lookup for <span class="mono">customer_id</span> returns the value plus how fresh it is.',
          'Hot values come from Redis, bulk values from ScyllaDB. The two have different consistency and latency profiles.',
          'The values in the payload are illustrative.'] },
      { t: 'Freshness is watched, not assumed', who: 'code', nodes: ['SERVE', 'OBS'], edges: ['e-obs'],
        sum: 'Stale or missing features cause silent prediction drift, so serving reports freshness, not only latency.',
        pts: ['Materialization and read SLIs track freshness and missing values against the contract.',
          'This monitor is drawn dashed: it is a design-level control, so confirm the details before claiming them.'] },
      { t: 'Lineage answers impact questions', who: 'code', nodes: ['MLF', 'LINEAGE'], edges: ['e-lin'], pay: 4,
        sum: 'Feature, model and endpoint dependencies become a graph you can query.',
        pts: ['Registering <span class="mono">reco:v41</span> adds a <b>feature → model → endpoint</b> edge.',
          '"Which deployed models use this PII feature?" became a metadata query that takes minutes, not a long code search.'],
        why: '<b>The point of the project:</b> a feature store is not just a fast key-value store. Its job is to keep meaning, time and lineage consistent across the ML lifecycle.' },
    ],
  },

  kaas: {
    title: 'KaaS · one remote kernel',
    caption: 'One notebook asks for a 16-CPU kernel on BigRed3 YARN. The notebook stays the same; identity follows the user; a polymorphic ProcessProxy handles each scheduler’s mechanics.',
    stats: [
      { n: '1,500+', u: 'data scientists / month', l: 'used the platform (resume-backed)' },
      { n: '100k+', u: 'workloads', l: 'lifetime Spark and training workloads (resume-backed)' },
      { n: '4', u: 'compute backends', l: 'YARN, Kubernetes, Vertex AI and Ray / GPU behind one kernel contract' },
      { n: '1', u: 'notebook experience', l: 'the user never leaves Jupyter to reach a different scheduler' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'DS', ...at(0, 0), kind: 'person', name: 'JupyterLab', cap: 'data scientist picks a kernel and compute', pills: ['notebook'] },
      { id: 'AUTH', ...at(1, 0), kind: 'guard', icon: 'lock', name: 'Delegated identity', cap: 'short-lived token that acts as the user', pills: ['OAuth2'] },
      { id: 'JEG', ...at(2, 0), kind: 'code', icon: 'layers', name: 'Enterprise Gateway', cap: 'remote-kernel control plane', pills: ['Jupyter EG'] },
      { id: 'PROXY', ...at(3, 0), kind: 'code', icon: 'code', name: 'ProcessProxy', cap: 'launch, monitor, kill: one interface', pills: ['polymorphic'] },
      { id: 'TOKEN', ...at(1, 1), kind: 'guard', icon: 'shield', name: 'TokenRefresher', cap: 'renews short-lived credentials in-session', pills: ['long-lived'] },
      { id: 'OBS', ...at(2, 1), kind: 'obs', icon: 'pulse', name: 'Kernel telemetry', cap: 'launch latency, failures, utilization' },
      { id: 'ROUTER', ...at(3, 1), kind: 'code', icon: 'list', name: 'Compute router + specs', cap: 'choice to resources, quotas at the edge', pills: ['specs'] },
      { id: 'YARN', ...at(0, 2), kind: 'store', icon: 'db', name: 'BigRed3 YARN', cap: 'on-prem Spark, large data processing', pills: ['on-prem'] },
      { id: 'K8S', ...at(1, 2), kind: 'store', icon: 'layers', name: 'TAP Kubernetes', cap: 'containerized platform workloads' },
      { id: 'VERTEX', ...at(2, 2), kind: 'store', icon: 'sparkle', name: 'Vertex AI / GKE', cap: 'cloud GPU and managed ML compute' },
      { id: 'RAY', ...at(3, 2), kind: 'store', icon: 'graph', name: 'Ray / GPU', cap: 'distributed Python, multi-GPU' },
    ],
    edges: [
      { id: 'e-req', from: 'DS', to: 'AUTH', fromSide: 'r', toSide: 'l', label: 'launch kernel' },
      { id: 'e-auth', from: 'AUTH', to: 'JEG', fromSide: 'r', toSide: 'l', label: 'as the user' },
      { id: 'e-launch', from: 'JEG', to: 'PROXY', fromSide: 'r', toSide: 'l', label: 'launch_kernel' },
      { id: 'e-resolve', from: 'PROXY', to: 'ROUTER', fromSide: 'b', toSide: 't', label: 'resolve backend' },
      { id: 'e-yarn', from: 'ROUTER', to: 'YARN', fromSide: 'b', toSide: 't', off: -60, toOff: 40, label: 'YARN app' },
      { id: 'e-k8s', from: 'ROUTER', to: 'K8S', fromSide: 'b', toSide: 't', off: -20, toOff: 0 },
      { id: 'e-vertex', from: 'ROUTER', to: 'VERTEX', fromSide: 'b', toSide: 't', off: 20, toOff: 0 },
      { id: 'e-ray', from: 'ROUTER', to: 'RAY', fromSide: 'b', toSide: 't', off: 60, toOff: 60 },
      { id: 'e-refresh', from: 'AUTH', to: 'TOKEN', fromSide: 'b', toSide: 't', dashed: true, label: 'refresh identity' },
      { id: 'e-renew', from: 'TOKEN', to: 'YARN', fromSide: 'b', toSide: 't', dashed: true, toOff: -40, label: 'renewed token' },
      { id: 'e-life', from: 'JEG', to: 'OBS', fromSide: 'b', toSide: 't', dashed: true, label: 'lifecycle' },
      { id: 'e-launchobs', from: 'ROUTER', to: 'OBS', fromSide: 'l', toSide: 'r', dashed: true, label: 'launches' },
    ],
    steps: [
      { t: 'The user picks compute from the notebook', who: 'person', nodes: ['DS', 'AUTH'], edges: ['e-req'], pay: 0,
        sum: 'A data scientist asks for a Python kernel on BigRed3 with 16 CPUs and 64 GB, without leaving Jupyter.',
        pts: ['The choice is a kernel spec plus a compute selector, not a job script for a specific scheduler.',
          'The request opens over the usual kernel request and websocket path.',
          'Exposing backend complexity here would defeat the point of the platform.'],
        why: '<b>Why the kernel?</b> It is the abstraction boundary. The notebook stays familiar while the compute underneath changes.' },
      { t: 'Identity is delegated, not shared', who: 'code', nodes: ['AUTH', 'JEG'], edges: ['e-auth'], pay: 1,
        sum: 'The launch carries a short-lived token scoped to this user, so the remote kernel acts as them.',
        pts: ['Scopes such as <span class="mono">data.read</span> and <span class="mono">kernel.launch</span> keep user-level data permissions intact on remote compute.',
          'A broad service account or static shared secret would break least privilege.'] },
      { t: 'The gateway hands off to ProcessProxy', who: 'code', nodes: ['JEG', 'PROXY', 'ROUTER'], edges: ['e-launch', 'e-resolve'],
        sum: 'Enterprise Gateway separates the notebook from where the kernel runs, and ProcessProxy resolves the backend.',
        pts: ['<b>ProcessProxy</b> maps generic kernel operations (launch, monitor, kill) to backend-specific mechanics.',
          'The compute router turns the user’s choice into resource config, and standardizes specs and quotas at the platform edge.',
          'Bad quotas or defaults waste expensive compute, so they are checked before launch.'],
        why: '<b>Why polymorphic?</b> Same interface, different schedulers. Each backend gets an adapter instead of each user learning its API.' },
      { t: 'The kernel launches on YARN', who: 'code', nodes: ['ROUTER', 'YARN'], edges: ['e-yarn'], pay: 2,
        sum: 'The router creates a remote kernel on BigRed3 YARN and returns a lifecycle handle.',
        pts: ['The result is a <span class="mono">kernel_id</span> tied to a remote YARN application, starting up.',
          'I owned the BigRed3 ProcessProxy integration, so this is the path I know best.',
          'Typical failures here are scheduler queue delay and Kerberos or token expiry.'] },
      { t: 'Other backends use the same contract', who: 'code', nodes: ['ROUTER', 'K8S', 'VERTEX', 'RAY'], edges: ['e-k8s', 'e-vertex', 'e-ray'],
        sum: 'Kubernetes, Vertex AI and Ray / GPU sit behind the same kernel interface.',
        pts: ['A notebook that starts on Spark can move to GPUs without rewriting submission code.',
          'Each backend brings its own failure modes: namespaces and images, cloud quota and cost, or cluster fragmentation.'] },
      { t: 'Remote execution feels local', who: 'person', nodes: ['DS', 'JEG', 'PROXY', 'YARN'], edges: ['e-req', 'e-auth', 'e-launch', 'e-yarn'], pay: 3,
        sum: 'Jupyter messages flow through the gateway to the remote kernel and back, as if it ran on the laptop.',
        pts: ['An <span class="mono">execute_request</span> such as <span class="mono">df.count()</span> returns an <span class="mono">execute_result</span> and the kernel goes idle.',
          'Interrupt and shutdown are lifecycle RPCs that ProcessProxy turns into backend-specific operations.',
          'A network partition can leave kernel state uncertain, which is why lifecycle has to be tracked.'] },
      { t: 'Long sessions stay authorized', who: 'code', nodes: ['AUTH', 'TOKEN', 'YARN'], edges: ['e-refresh', 'e-renew'], pay: 4,
        sum: 'Before the token expires, TokenRefresher renews it and pushes the new identity to the running kernel.',
        pts: ['Long-lived compute uses short-lived credentials with renewal, never long-lived secrets.',
          'A refresh failure can kill multi-hour or multi-day work, so this path matters as much as launch.',
          'I owned token propagation and long-lived auth refresh.'] },
      { t: 'One place to see every kernel', who: 'code', nodes: ['JEG', 'ROUTER', 'OBS'], edges: ['e-life', 'e-launchobs'],
        sum: 'Lifecycle and launch events from every backend land in one telemetry view.',
        pts: ['Launch latency, backend failures, utilization and orphaned kernels need to be visible across all four backends.',
          'This telemetry box is drawn dashed because it is design-level; confirm the details before claiming them.'],
        why: '<b>The point of the project:</b> it separates the developer experience from the compute substrate, and gives the platform one place for identity, lifecycle and telemetry.' },
    ],
  },

  "llm-router": {
    title: 'LLM router · one routed generation',
    caption: 'One summarize_case call from a product, through a shared SDK, a routing policy and a circuit breaker, to whichever provider fits. Every call comes back in one shape and leaves a trace.',
    stats: [
      { n: '1', u: 'internal SDK', l: 'products integrate one contract instead of each provider directly' },
      { n: '3', u: 'model providers', l: 'Claude, OpenAI GPT and Gemini behind the same interface' },
      { n: '1', u: 'routing policy', l: 'provider choice, prompt version and fallback live in one place' },
      { n: '0', u: 'blocking trace writes', l: 'LangFuse tracing is async and sanitized, off the request path' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'APP', ...at(0, 0), kind: 'person', name: 'AI product / agent', cap: 'asks for a capability, not a provider', pills: ['generate()'] },
      { id: 'SDK', ...at(1, 0), kind: 'code', icon: 'code', name: 'Internal GenAI SDK', cap: 'auth, redaction, tracing, validation', pills: ['one contract'] },
      { id: 'POLICY', ...at(2, 0), kind: 'code', icon: 'list', name: 'Routing policy', cap: 'cost, latency, capability, risk; prompts', pills: ['prompt registry'] },
      { id: 'CLAUDE', ...at(3, 0), kind: 'llm', name: 'Claude', cap: 'provider option behind the abstraction' },
      { id: 'LF', ...at(0, 1), kind: 'obs', icon: 'pulse', name: 'LangFuse tracing', cap: 'tokens, latency, cost, prompt version', pills: ['async'] },
      { id: 'RESP', ...at(1, 1), kind: 'code', icon: 'check', name: 'Normalized response', cap: 'same shape and metadata from any model', pills: ['structured'] },
      { id: 'CB', ...at(2, 1), kind: 'guard', icon: 'shield', name: 'Circuit breaker', cap: 'stops calls to a degraded provider', pills: ['fallback'] },
      { id: 'GPT', ...at(3, 1), kind: 'llm', name: 'OpenAI GPT', cap: 'provider option behind the abstraction' },
      { id: 'DASH', ...at(0, 2), kind: 'obs', icon: 'chart', name: 'Ops dashboard', cap: 'cost and SLOs by product, prompt, model' },
      { id: 'EVAL', ...at(1, 2), kind: 'obs', icon: 'review', name: 'Evaluation loop', cap: 'offline and online quality checks' },
      { id: 'GEMINI', ...at(3, 2), kind: 'llm', name: 'Gemini', cap: 'provider option behind the abstraction' },
    ],
    edges: [
      { id: 'e-gen', from: 'APP', to: 'SDK', fromSide: 'r', toSide: 'l', off: -12, label: 'generate' },
      { id: 'e-result', from: 'SDK', to: 'APP', fromSide: 'l', toSide: 'r', off: 12, label: 'result' },
      { id: 'e-route', from: 'SDK', to: 'POLICY', fromSide: 'r', toSide: 'l', label: 'route(task)' },
      { id: 'e-invoke', from: 'POLICY', to: 'CB', fromSide: 'b', toSide: 't', label: 'invoke gpt' },
      { id: 'e-call', from: 'CB', to: 'GPT', fromSide: 'r', toSide: 'l', off: -12, label: 'request' },
      { id: 'e-reply', from: 'GPT', to: 'CB', fromSide: 'l', toSide: 'r', off: 12, label: 'usage' },
      { id: 'e-fallback', from: 'CB', to: 'CLAUDE', fromSide: 'r', toSide: 'l', off: -40, toOff: 0 },
      { id: 'e-gemini', from: 'CB', to: 'GEMINI', fromSide: 'r', toSide: 'l', off: 40, toOff: 0 },
      { id: 'e-norm', from: 'CB', to: 'RESP', fromSide: 'l', toSide: 'r', label: 'normalize' },
      { id: 'e-back', from: 'RESP', to: 'SDK', fromSide: 't', toSide: 'b', label: 'validated' },
      { id: 'e-trace', from: 'SDK', to: 'LF', fromSide: 'b', toSide: 't', off: -60, toOff: 0, dashed: true, label: 'async trace' },
      { id: 'e-dash', from: 'LF', to: 'DASH', fromSide: 'b', toSide: 't', label: 'cost / latency' },
      { id: 'e-eval', from: 'LF', to: 'EVAL', fromSide: 'b', toSide: 't', off: 60, toOff: 0, label: 'traces' },
    ],
    steps: [
      { t: 'A product asks for a capability', who: 'person', nodes: ['APP', 'SDK'], edges: ['e-gen'], pay: 0,
        sum: 'A product calls generate() with a task, a prompt version and a latency target, not a provider SDK.',
        pts: ['The call names <span class="mono">summarize_case</span>, prompt <span class="mono">case-v14</span>, a quality tier and the tenant.',
          'The SDK gives it a request id and a trace id before anything else happens.',
          'Direct provider coupling would spread retries, security and prompt logic into every app.'],
        why: '<b>Why an SDK?</b> Six teams calling providers directly means six retry policies and six cost blind spots. One contract removes that.' },
      { t: 'The SDK prepares the request', who: 'code', nodes: ['SDK', 'POLICY'], edges: ['e-route'],
        sum: 'Sensitive context is redacted and the prompt version is resolved before routing.',
        pts: ['The SDK standardizes cross-cutting concerns: auth, redaction, tracing and request normalization.',
          'The PII and context filter is design-level, so confirm its details before claiming them.',
          'A leaky abstraction is the risk: provider features that matter should not be hidden.'] },
      { t: 'Policy picks the provider', who: 'code', nodes: ['POLICY', 'CB'], edges: ['e-invoke'], pay: 1,
        sum: 'Routing weighs cost, latency, capability and risk, plus provider health and budget.',
        pts: ['Here it picks a cost-optimized GPT model because the task needs <b>structured output</b> at a <b>standard cost tier</b>.',
          'The decision returns its reasons, so a route can be explained later.',
          'Routing on cost alone can quietly lower quality.'],
        why: '<b>Why policy, not code?</b> Model choice moves out of application if-statements into one place the platform can tune.' },
      { t: 'The circuit breaker calls GPT', who: 'model', nodes: ['CB', 'GPT'], edges: ['e-call', 'e-reply'], pay: 2,
        sum: 'The request goes to the selected provider with a response schema, and comes back with token usage.',
        pts: ['The call carries the messages and the <span class="mono">CaseSummary</span> schema.',
          'The reply includes content plus input and output token counts and latency. The numbers in the payload are illustrative.'] },
      { t: 'One response shape for every model', who: 'code', nodes: ['CB', 'RESP', 'SDK', 'APP'], edges: ['e-norm', 'e-back', 'e-result'],
        sum: 'The provider reply is normalized, checked against schema and policy, and returned as a structured result.',
        pts: ['Callers get the same metadata and structured-output handling, whichever model answered.',
          'Provider schema drift is caught here instead of breaking downstream consumers.'] },
      { t: 'A 429 opens the circuit', who: 'code', nodes: ['CB', 'GPT', 'CLAUDE', 'GEMINI'], edges: ['e-call', 'e-fallback', 'e-gemini'], pay: 4,
        sum: 'When GPT returns 429, the breaker stops calling it and makes one bounded fallback to Claude.',
        pts: ['The fallback uses a compatibility profile, here <span class="mono">case-summary-v2</span>, not just a different model name.',
          'Fallback models can differ in context limits and structured-output behavior, which is why the profile exists.',
          'A provider rate limit becomes a degraded route, not a product outage.'],
        why: '<b>Why bounded?</b> Unbounded retries against a degraded provider waste money and make the outage longer.' },
      { t: 'Every call leaves a trace', who: 'code', nodes: ['SDK', 'LF', 'DASH'], edges: ['e-trace', 'e-dash'], pay: 3,
        sum: 'The SDK writes an async trace with tokens, latency, model and prompt version to LangFuse.',
        pts: ['Cost is attributed to the product, workflow and prompt version, so "which prompt caused this cost spike?" has an answer.',
          'Tracing is non-blocking and sanitized; logging raw sensitive prompts would be a data-governance risk.',
          'Dashboards should show p95 and p99, since averages hide specific prompt regressions.'] },
      { t: 'Evaluation closes the loop', who: 'human', nodes: ['LF', 'EVAL'], edges: ['e-eval'],
        sum: 'Offline and online evals check that routing or prompt changes do not quietly reduce quality.',
        pts: ['Quality is part of the routing policy, not an afterthought.',
          'LLM-as-judge on its own can be unstable, so it is one signal among several.'],
        why: '<b>The point of the project:</b> it turns external LLM APIs into a governed internal capability. Product teams integrate once; cost and resilience are tuned centrally.' },
    ],
  },

  "mlflow-gitops": {
    title: 'MLflow GitOps · one model release',
    caption: 'One challenger model, from a training run to full traffic or an automatic rollback. Governance is a validation gate, deployment is declared in Git, and canary health decides the outcome.',
    stats: [
      { n: '3', u: 'planes', l: 'data science lifecycle, declarative delivery, runtime rollout' },
      { n: '1', u: 'registration gate', l: 'model card and IO schema are checked before a version exists' },
      { n: '1', u: 'deployment contract', l: 'targetml.yml binds model, features, compute and monitoring' },
      { n: '2', u: 'outcomes', l: 'every canary ends promoted or rolled back to last known good' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'TRAIN', ...at(0, 0), kind: 'code', icon: 'chart', name: 'Train + evaluate', cap: 'artifact, metrics and run metadata', pills: ['run_41'] },
      { id: 'GATE', ...at(1, 0), kind: 'guard', icon: 'check', name: 'Model card gate', cap: 'model card, IO schema, evaluation', pills: ['SSO'] },
      { id: 'REG', ...at(2, 0), kind: 'store', icon: 'db', name: 'MLflow registry', cap: 'immutable model versions + metadata', pills: ['MLflow'] },
      { id: 'ALIAS', ...at(3, 0), kind: 'person', icon: 'review', name: 'Alias change', cap: 'data scientist moves Challenger to Champion' },
      { id: 'FIX', ...at(0, 1), kind: 'person', icon: 'file', name: 'Return to owner', cap: 'specific errors: what is missing' },
      { id: 'ROLLBACK', ...at(1, 1), kind: 'guard', icon: 'shield', name: 'Rollback', cap: 'restores the last known-good version', pills: ['automatic'] },
      { id: 'YAML', ...at(2, 1), kind: 'code', icon: 'file', name: 'targetml.yml', cap: 'model, features, compute, monitoring', pills: ['in Git'] },
      { id: 'PIPE', ...at(3, 1), kind: 'code', icon: 'layers', name: 'Vela / GitOps pipeline', cap: 'resolves pinned model + config versions', pills: ['GitOps'] },
      { id: 'PROD', ...at(0, 2), kind: 'code', icon: 'send', name: 'Production', cap: 'live inference on a known version' },
      { id: 'PROMOTE', ...at(1, 2), kind: 'code', icon: 'check', name: 'Promote', cap: '100% traffic, alias set to Champion' },
      { id: 'MET', ...at(2, 2), kind: 'obs', icon: 'pulse', name: 'Health evaluation', cap: 'latency, errors, resource and model health', pills: ['versioned policy'] },
      { id: 'CANARY', ...at(3, 2), kind: 'code', icon: 'graph', name: 'Canary deployment', cap: 'candidate on a small traffic slice' },
    ],
    edges: [
      { id: 'e-eval', from: 'TRAIN', to: 'GATE', fromSide: 'r', toSide: 'l', label: 'run + card' },
      { id: 'e-fail', from: 'GATE', to: 'FIX', fromSide: 'b', toSide: 't', off: -50, toOff: 40, label: 'fail' },
      { id: 'e-pass', from: 'GATE', to: 'REG', fromSide: 'r', toSide: 'l', label: 'pass' },
      { id: 'e-version', from: 'REG', to: 'ALIAS', fromSide: 'r', toSide: 'l', label: 'version 52' },
      { id: 'e-event', from: 'ALIAS', to: 'PIPE', fromSide: 'b', toSide: 't', label: 'lifecycle event' },
      { id: 'e-yaml', from: 'YAML', to: 'PIPE', fromSide: 'r', toSide: 'l', label: 'config ref' },
      { id: 'e-canary', from: 'PIPE', to: 'CANARY', fromSide: 'b', toSide: 't', label: 'deploy canary' },
      { id: 'e-metrics', from: 'CANARY', to: 'MET', fromSide: 'l', toSide: 'r', label: 'p99 · errors' },
      { id: 'e-healthy', from: 'MET', to: 'PROMOTE', fromSide: 'l', toSide: 'r', off: 20, label: 'healthy' },
      { id: 'e-unhealthy', from: 'MET', to: 'ROLLBACK', fromSide: 'l', toSide: 'b', off: -40, toOff: 60, label: 'unhealthy' },
      { id: 'e-promote', from: 'PROMOTE', to: 'PROD', fromSide: 'l', toSide: 'r', label: 'full traffic' },
      { id: 'e-restore', from: 'ROLLBACK', to: 'PROD', fromSide: 'b', toSide: 't', off: -40, label: 'last good' },
    ],
    steps: [
      { t: 'Training produces evidence, not just a model', who: 'code', nodes: ['TRAIN', 'GATE'], edges: ['e-eval'],
        sum: 'A run yields the artifact plus the metrics, run metadata and model card that governance needs.',
        pts: ['Training and evaluation produce the <b>model artifact</b>, its metrics and run metadata from code, data and a feature snapshot.',
          'The data scientist also supplies a <b>model card</b> and an <b>IO schema</b>. Without them the next step will not register the model.',
          'Metrics with no data or model lineage cannot be reproduced, so the lifecycle starts here, before the registry.'] },
      { t: 'The gate decides whether a version exists', who: 'code', nodes: ['GATE', 'REG', 'FIX'], edges: ['e-pass', 'e-fail'], pay: 0,
        sum: 'SSO identity plus model-card and schema validation run before anything is registered.',
        pts: ['The <span class="mono">mlflow-target</span> client checks the caller through <b>SSO</b> and validates the required fields. Pydantic is the design-level choice for that validation.',
          'A pass creates an <b>immutable registry version</b> (52 in the payload). A fail goes back to the owner with specific errors, not a generic rejection.',
          'Vague gate failures encourage people to look for a way around the gate, so the error says exactly what is missing.'],
        why: '<b>Why a gate in code?</b> Governance encoded as validation runs every time. A checklist in someone’s inbox becomes a bottleneck and gets skipped.' },
      { t: 'An alias change becomes a deployment event', who: 'human', nodes: ['REG', 'ALIAS', 'PIPE'], edges: ['e-version', 'e-event'], pay: 1,
        sum: 'The data scientist moves the Challenger to Champion, and that lifecycle change triggers delivery.',
        pts: ['The data scientist works in model terms: they set the <b>Champion / Challenger alias</b> on version 52.',
          'The registry emits a lifecycle event (<span class="mono">mlf_evt_91</span>) that the pipeline picks up. The webhook in between is design-level detail.',
          'An alias change with no policy behind it could become a production release by accident, so the event is only accepted when deployment policy is satisfied.'] },
      { t: 'targetml.yml says how the model should run', who: 'code', nodes: ['YAML', 'PIPE'], edges: ['e-yaml'],
        sum: 'One version-controlled file binds the model to its features, compute and monitoring.',
        pts: ['<b>targetml.yml</b> lives in Git and declares the deployment instead of scripting it. The event carries a pinned ref such as <span class="mono">git:abc123:targetml.yml</span>.',
          'The pipeline resolves an immutable model version and an immutable config version, so every deployment can be traced back to both.',
          'Hidden imperative scripts drift between teams. A declared contract is the same for everyone.'],
        why: '<b>Why declarative?</b> The YAML is the handshake between data science and platform engineering. Nobody has to translate a model into infrastructure by hand.' },
      { t: 'A canary takes a small slice of traffic', who: 'code', nodes: ['PIPE', 'CANARY'], edges: ['e-canary'], pay: 2,
        sum: 'The candidate goes live on a limited share of real traffic, with resources from targetml.yml.',
        pts: ['Vela deploys version 52 as a <b>canary</b> (10% of traffic in the payload) and the deployment enters an <span class="mono">observing</span> state.',
          'This limits the blast radius while the candidate is measured under real load.',
          'Too little traffic makes the metrics noisy, so the canary is treated as a controlled experiment, not just a smaller deployment.'] },
      { t: 'Health thresholds give a verdict', who: 'code', nodes: ['CANARY', 'MET'], edges: ['e-metrics'], pay: 3,
        sum: 'Live latency, errors and health over an observation window become healthy or unhealthy.',
        pts: ['Runtime metrics (p99 latency, error rate, resource and model health) are compared with <b>explicit, version-controlled thresholds</b>.',
          'The verdict records the policy version that produced it (<span class="mono">rollout-v8</span> in the payload). The observation window and Prometheus feed are design-level detail.',
          'Thresholds set too tight block every release; too loose and they miss real regressions. That tuning is the hard part.'] },
      { t: 'Promote, or roll back without waiting for a person', who: 'code', nodes: ['MET', 'PROMOTE', 'ROLLBACK', 'PROD'], edges: ['e-healthy', 'e-unhealthy', 'e-promote', 'e-restore'], pay: 4,
        sum: 'Healthy canaries move to full traffic; unhealthy ones restore the last known-good version automatically.',
        pts: ['A <b>healthy</b> verdict shifts traffic to 100% and sets the alias to Champion. Promotion is a state transition with audit history.',
          'An <b>unhealthy</b> verdict restores the previous stable artifact and alias. The platform keeps an explicit last-known-good target, because a rollback can fail if that artifact is gone.',
          'The deployment outcome is recorded back against the model version, so model, config, deployment and outcome stay linked.'],
        why: '<b>The point of the project:</b> make model deployment boring. Intent lives in Git and the registry, execution is automated, and rollback does not depend on someone noticing.' },
    ],
  },

  postly: {
    title: 'Postly · one governed campaign asset',
    caption: 'One campaign asset, from an approved brief to a reconciled publication. Models make iteration cheap; rendering, policy, approval and publishing stay deterministic.',
    stats: [
      { n: '4', u: 'planes', l: 'trusted inputs, generation, deterministic control, publishing and audit' },
      { n: '0', u: 'policy calls in the prompt', l: 'hard compliance rules run in versioned code outside the model' },
      { n: '1', u: 'redaction step', l: 'Presidio, allowlists and redaction before any external LLM call' },
      { n: '1', u: 'exact artifact', l: 'approval attaches to the rendered bytes that will be published' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'SRC', ...at(0, 0), kind: 'person', name: 'Campaign brief', cap: 'campaign objective, approved facts and copy', pills: ['cmp_801'] },
      { id: 'GROUND', ...at(1, 0), kind: 'code', icon: 'search', name: 'Grounding', cap: 'only relevant approved context', pills: ['bounded'] },
      { id: 'PII', ...at(2, 0), kind: 'guard', icon: 'lock', name: 'PII redaction', cap: 'redacts or tokenizes before external calls', pills: ['Presidio'] },
      { id: 'GEN', ...at(3, 0), kind: 'llm', name: 'Multimodal generation', cap: 'candidate copy and visual directions', pills: ['versioned prompt'] },
      { id: 'RECON', ...at(0, 1), kind: 'obs', icon: 'check', name: 'Reconciliation', cap: 'what actually went live, linked to approval', pills: ['audit'] },
      { id: 'POLICY', ...at(1, 1), kind: 'guard', icon: 'shield', name: 'Versioned policy', cap: 'disclaimers, prohibited claims, PII', pills: ['outside prompt'] },
      { id: 'RENDER', ...at(2, 1), kind: 'code', icon: 'layers', name: 'Deterministic renderer', cap: 'exact typography, layout and required text', pills: ['template'] },
      { id: 'TRACE', ...at(3, 1), kind: 'obs', name: 'LangFuse telemetry', cap: 'latency, cost, quality on safe payloads', pills: ['sanitized'] },
      { id: 'PUB', ...at(0, 2), kind: 'code', icon: 'send', name: 'Publishing connector', cap: 'pushes only approved artifact versions' },
      { id: 'APPROVE', ...at(1, 2), kind: 'guard', icon: 'check', name: 'Exact-artifact gate', cap: 'decision bound to the artifact hash', pills: ['immutable'] },
      { id: 'REVIEW', ...at(2, 2), kind: 'person', icon: 'review', name: 'Human / legal review', cap: 'approve, edit or reject with rule evidence', pills: ['elevated risk'] },
    ],
    edges: [
      { id: 'e-brief', from: 'SRC', to: 'GROUND', fromSide: 'r', toSide: 'l', label: 'brief' },
      { id: 'e-ctx', from: 'GROUND', to: 'PII', fromSide: 'r', toSide: 'l', label: 'context pack' },
      { id: 'e-redact', from: 'PII', to: 'GEN', fromSide: 'r', toSide: 'l', label: 'redacted' },
      { id: 'e-trace', from: 'GEN', to: 'TRACE', fromSide: 'b', toSide: 't', off: 40, toOff: 40, dashed: true, label: 'trace' },
      { id: 'e-cand', from: 'GEN', to: 'RENDER', fromSide: 'b', toSide: 't', off: -60, toOff: 40, label: 'candidate' },
      { id: 'e-art', from: 'RENDER', to: 'POLICY', fromSide: 'l', toSide: 'r', label: 'art + hash' },
      { id: 'e-pass', from: 'POLICY', to: 'APPROVE', fromSide: 'b', toSide: 't', off: -40, label: 'pass' },
      { id: 'e-flag', from: 'POLICY', to: 'REVIEW', fromSide: 'b', toSide: 't', off: 40, label: 'flag' },
      { id: 'e-decide', from: 'REVIEW', to: 'APPROVE', fromSide: 'l', toSide: 'r', label: 'decision' },
      { id: 'e-publish', from: 'APPROVE', to: 'PUB', fromSide: 'l', toSide: 'r', label: 'approved hash' },
      { id: 'e-recon', from: 'PUB', to: 'RECON', fromSide: 't', toSide: 'b', label: 'provider ID' },
    ],
    steps: [
      { t: 'The brief starts from trusted facts', who: 'person', nodes: ['SRC', 'GROUND'], edges: ['e-brief'], pay: 0,
        sum: 'A marketer’s campaign brief is tied to approved product facts and risk copy before any model is involved.',
        pts: ['The brief names an objective, an approved audience segment and <b>trusted sources</b> such as <span class="mono">product_fact_17</span> and <span class="mono">risk_copy_v4</span>.',
          'Grounding keeps those references, so every later claim can be traced to approved material.',
          'Generation is constrained to known campaign facts from the start. The retriever and context-pack builder are design-level detail.'] },
      { t: 'Sensitive context is removed first', who: 'code', nodes: ['GROUND', 'PII', 'GEN'], edges: ['e-ctx', 'e-redact'],
        sum: 'The context pack is redacted or tokenized before it can reach an external model.',
        pts: ['<b>Presidio</b>, allowlists and redaction strip or tokenize sensitive data in the context pack.',
          'Only the bounded, redacted context goes to the external model. Nothing else in the corpus is sent.',
          'Doing this before the call matters: once data has gone to an external provider, it cannot be pulled back.'] },
      { t: 'The model proposes options', who: 'model', nodes: ['GEN', 'TRACE'], edges: ['e-trace'], pay: 1,
        sum: 'Multimodal generation returns several copy and visual directions from a versioned prompt.',
        pts: ['With a versioned prompt (<span class="mono">copy-v9</span> in the payload), the model returns a candidate headline, body and visual prompt.',
          'The team can explore several angles quickly, such as an explainer, a webinar promotion or a partner variant.',
          'Calls are traced to <b>LangFuse</b> with sanitized payloads, so latency, cost and quality are visible without copying sensitive content into telemetry.'],
        why: '<b>Why not let the model publish?</b> AI makes iteration cheap. It does not make the final decision. Everything after this step is deterministic or human.' },
      { t: 'The exact artifact is rendered', who: 'code', nodes: ['GEN', 'RENDER'], edges: ['e-cand'], pay: 2,
        sum: 'A template renders the final text and layout exactly, so the reviewed asset is the published asset.',
        pts: ['The deterministic renderer applies a brand template (<span class="mono">social-1x1-v6</span>) to the candidate and produces <span class="mono">art_551</span>.',
          'Required text and disclaimers are placed by code, not by the image model, so they cannot be garbled.',
          'The artifact gets a content hash and version. That hashing step is design-level detail, but every later step depends on it.'] },
      { t: 'Hard policy runs outside the prompt', who: 'code', nodes: ['RENDER', 'POLICY'], edges: ['e-art'], pay: 3,
        sum: 'Versioned rules check the rendered artifact and return pass or flag with rule IDs.',
        pts: ['Policy <span class="mono">fin-marketing-v12</span> checks the final artifact: mandatory disclaimers, prohibited financial claims and PII.',
          'Each result names its rule, such as <span class="mono">mandatory_disclaimer: pass</span>, so a reviewer sees exactly why something was flagged.',
          'The model’s own judgment is never the compliance decision.'],
        why: '<b>Why outside the model?</b> A prompt can be talked around. Versioned code gives the same answer every time and can be audited by policy version.' },
      { t: 'A person approves the exact bytes', who: 'human', nodes: ['POLICY', 'APPROVE', 'REVIEW'], edges: ['e-pass', 'e-flag', 'e-decide'], pay: 4,
        sum: 'Clean artifacts go to approval; flagged or elevated-risk ones go to human or legal review first.',
        pts: ['A pass goes straight to approval. A flag sends the artifact and its rule findings to <b>human / legal review</b>, which can approve, edit or reject.',
          'Approval attaches to the <b>artifact hash</b> (<span class="mono">apr_81</span>), not to a prompt or a draft, so any edit means a new approval.',
          'Elevated-risk actions always stay human-gated.'] },
      { t: 'Publish, then confirm what went live', who: 'code', nodes: ['APPROVE', 'PUB', 'RECON'], edges: ['e-publish', 'e-recon'], pay: 5,
        sum: 'Only the approved version is published, and the live result is reconciled against the approval.',
        pts: ['The publishing connector pushes the approved version to the destination and gets back a publication ID (<span class="mono">pub_31</span>).',
          'Publishing is an external side effect, so reconciliation checks the live state and hash and marks it published, failed or drifted. The outbox in front of the connector is design-level detail.',
          'Prompt, model, policy and artifact versions stay linked to the approval and the publication.'],
        why: '<b>The point of the project:</b> shorten time-to-relevance without weakening governance. AI speeds up drafting; the controls around it stay deterministic.' },
    ],
  },

  ppc: {
    title: 'PPC attribution · one budget cycle',
    caption: 'One cycle of journey-level attribution. Touchpoints become ordered paths, two models estimate each channel’s contribution, and a planner approves any budget change before new outcomes are measured.',
    stats: [
      { n: '2', u: 'attribution lenses', l: 'Markov removal effect and Shapley marginal contribution' },
      { n: '4', u: 'planes', l: 'event sources, journey data, attribution compute, planning' },
      { n: '1', u: 'approval', l: 'every budget recommendation is marked for planner approval' },
      { n: '0', u: 'causal claims', l: 'attribution is correlational; budget shifts need holdout tests' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'LOGS', ...at(0, 0), kind: 'store', icon: 'db', name: 'Touchpoint logs', cap: 'impressions, clicks, sessions, conversions' },
      { id: 'GOV', ...at(1, 0), kind: 'guard', icon: 'lock', name: 'Identity + window', cap: 'stitch users, apply attribution window' },
      { id: 'PATH', ...at(2, 0), kind: 'code', icon: 'list', name: 'Journey path builder', cap: 'START → channels → conversion or null' },
      { id: 'MTX', ...at(3, 0), kind: 'code', icon: 'graph', name: 'Transition matrix', cap: 'channel-to-channel transition counts' },
      { id: 'CHECK', ...at(0, 1), kind: 'obs', icon: 'pulse', name: 'Reconciliation', cap: 'actual spend and conversions vs plan' },
      { id: 'SHAPLEY', ...at(1, 1), kind: 'code', icon: 'chart', name: 'Shapley contribution', cap: 'marginal value across channel coalitions' },
      { id: 'COAL', ...at(2, 1), kind: 'code', icon: 'layers', name: 'Coalition sampler', cap: 'combinations of channels and outcomes' },
      { id: 'MARKOV', ...at(3, 1), kind: 'code', icon: 'chart', name: 'Markov removal effect', cap: 'conversion drop if a channel is removed' },
      { id: 'ADS', ...at(0, 2), kind: 'person', icon: 'review', name: 'Planners + ad platform', cap: 'approve and apply the budget change', pills: ['approval'] },
      { id: 'BUDGET', ...at(1, 2), kind: 'code', icon: 'tool', name: 'Budget recommendation', cap: 'credit + spend + bounds → reallocation' },
      { id: 'FUSE', ...at(2, 2), kind: 'code', icon: 'check', name: 'Consensus attribution', cap: 'normalized credit from both lenses' },
    ],
    edges: [
      { id: 'e-raw', from: 'LOGS', to: 'GOV', fromSide: 'r', toSide: 'l', label: 'raw events' },
      { id: 'e-stitch', from: 'GOV', to: 'PATH', fromSide: 'r', toSide: 'l', label: 'stitched' },
      { id: 'e-pm', from: 'PATH', to: 'MTX', fromSide: 'r', toSide: 'l', label: 'paths' },
      { id: 'e-trans', from: 'MTX', to: 'MARKOV', fromSide: 'b', toSide: 't', label: 'transitions' },
      { id: 'e-ps', from: 'PATH', to: 'COAL', fromSide: 'b', toSide: 't', label: 'paths' },
      { id: 'e-coal', from: 'COAL', to: 'SHAPLEY', fromSide: 'l', toSide: 'r', label: 'coalitions' },
      { id: 'e-m', from: 'MARKOV', to: 'FUSE', fromSide: 'b', toSide: 'r', label: 'removal effects' },
      { id: 'e-s', from: 'SHAPLEY', to: 'FUSE', fromSide: 'b', toSide: 't', label: 'marginal values' },
      { id: 'e-credit', from: 'FUSE', to: 'BUDGET', fromSide: 'l', toSide: 'r', label: 'credit' },
      { id: 'e-propose', from: 'BUDGET', to: 'ADS', fromSide: 'l', toSide: 'r', label: 'proposal' },
      { id: 'e-out', from: 'ADS', to: 'CHECK', fromSide: 't', toSide: 'b', dashed: true, label: 'spend + outcomes' },
      { id: 'e-next', from: 'CHECK', to: 'LOGS', fromSide: 't', toSide: 'b', dashed: true, label: 'next cycle' },
    ],
    steps: [
      { t: 'Touchpoints become one ordered journey', who: 'code', nodes: ['LOGS', 'GOV', 'PATH'], edges: ['e-raw', 'e-stitch'], pay: 0,
        sum: 'Cross-channel events for one user are stitched, windowed and ordered into a single path.',
        pts: ['In the payload, user <span class="mono">u_1</span> touches <b>Taboola</b>, then <b>Direct</b>, then <b>AdRoll</b>, and converts.',
          'The path builder turns that into <span class="mono">START → Taboola → Direct → AdRoll → CONVERSION</span>. Journeys that never convert end in null.',
          'Identity stitching and the attribution window are drawn dashed because they are design-level. They still matter most: bad stitching or a wrong window changes every number downstream.'],
        why: '<b>Why journeys?</b> Last-click would give AdRoll all the credit here. Modelling the whole path is the only way to see what the discovery channel did.' },
      { t: 'Markov asks what happens without a channel', who: 'code', nodes: ['PATH', 'MTX', 'MARKOV'], edges: ['e-pm', 'e-trans'], pay: 1,
        sum: 'Aggregated paths become a transition model, and removing a channel shows how much conversion depends on it.',
        pts: ['Paths are aggregated into channel-to-channel <b>transition counts</b>. The matrix builder is design-level detail.',
          'The model computes a baseline conversion probability, then the <b>removal effect</b>: how far it drops if one channel disappears.',
          'The per-channel numbers in the payload are illustrative, not results.'] },
      { t: 'Shapley asks what each channel adds', who: 'code', nodes: ['PATH', 'COAL', 'SHAPLEY'], edges: ['e-ps', 'e-coal'], pay: 2,
        sum: 'Contribution is averaged across combinations of channels, so order and overlap are handled fairly.',
        pts: ['The same paths feed a <b>coalition</b> view: which combinations of channels appear together and how they convert. The sampler is design-level detail.',
          '<b>Shapley values</b> give each channel its average marginal contribution across those coalitions.',
          'It answers a different question from Markov, which is why both are run.'] },
      { t: 'Two lenses become one channel credit', who: 'code', nodes: ['MARKOV', 'SHAPLEY', 'FUSE'], edges: ['e-m', 'e-s'],
        sum: 'Removal effects and marginal values are normalized and combined into one credit per channel.',
        pts: ['Both outputs are normalized to comparable credit, combined and sanity-checked. The normalization step is design-level.',
          'Combining two methods gives a more defensible signal than trusting either one alone.',
          'For the same event snapshot the output should be reproducible, so a recommendation can be explained later.'],
        why: '<b>Why two models?</b> Each has blind spots. When they agree, the signal is stronger; when they disagree, that is worth a closer look before moving money.' },
      { t: 'Credit becomes a budget proposal', who: 'code', nodes: ['FUSE', 'BUDGET'], edges: ['e-credit'], pay: 3,
        sum: 'Channel credit, current spend and budget bounds produce a reallocation recommendation.',
        pts: ['The recommender combines normalized credit with <b>current spend</b> and <b>budget bounds</b>, and proposes a change per channel.',
          'The output is marked <span class="mono">requires_approval: true</span>. It is a recommendation, not an automatic spend change.',
          'This is the step that turns attribution from a report into a planning decision.'] },
      { t: 'A planner approves the change', who: 'human', nodes: ['BUDGET', 'ADS'], edges: ['e-propose'],
        sum: 'Budget activation keeps explicit guardrails and a person in the loop.',
        pts: ['Planners review the proposal and apply approved changes on the <b>ad platforms</b>.',
          'Attribution is not automatically causal. Holdout experiments are the way to check that a shift actually helped.'] },
      { t: 'Measure again', who: 'code', nodes: ['ADS', 'CHECK', 'LOGS'], edges: ['e-out', 'e-next'],
        sum: 'New spend and conversions are reconciled against the recommendation and start the next cycle.',
        pts: ['Approved changes create new journeys, which flow back into the touchpoint logs.',
          'Reconciliation compares actual spend and conversions with what was recommended. It is drawn dashed as a design-level control.',
          'That closes the loop: the next recommendation is judged on observed outcomes, not on the model’s own credit.'],
        why: '<b>The point of the project:</b> change the question from who touched the customer last to which channels add value across the journey, and keep checking the answer.' },
    ],
  },

  "quantiphi-retail": {
    title: 'Retail AI · one self-checkout candidate',
    caption: 'One item moving into the bagging area, lined up with the POS session. The system surfaces a reviewable candidate with evidence; a person makes the call, and the decision feeds the next model.',
    stats: [
      { n: '2', u: 'signal sources', l: 'video and POS events are fused; neither is trusted alone' },
      { n: '3', u: 'planes', l: 'store sensing, multimodal decision, review and learning loop' },
      { n: '1', u: 'human gate', l: 'every candidate is reviewed; the system never adjudicates fraud' },
      { n: '11', u: 'days', l: 'of silent drift in the incident that made monitoring non-negotiable' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'CAM', ...at(0, 0), kind: 'code', icon: 'pulse', name: 'Camera / video', cap: 'frames from the checkout camera', pills: ['store'] },
      { id: 'CV', ...at(1, 0), kind: 'llm', name: 'Detection / tracking', cap: 'objects, tracks, action and appearance cues', pills: ['CV'] },
      { id: 'SYNC', ...at(2, 0), kind: 'code', icon: 'layers', name: 'Time / session align', cap: 'joins visual events to the right checkout' },
      { id: 'POS', ...at(3, 0), kind: 'store', name: 'POS events', cap: 'timestamped scan and transaction events', pills: ['POS'] },
      { id: 'DEPLOY', ...at(0, 1), kind: 'code', icon: 'send', name: 'Registry / deployment', cap: 'promotes a validated model version' },
      { id: 'MON', ...at(1, 1), kind: 'obs', name: 'Data / model monitor', cap: 'freshness, schema and drift alerts', pills: ['telemetry'] },
      { id: 'FUSE', ...at(2, 1), kind: 'llm', icon: 'graph', name: 'Visual + POS fusion', cap: 'mismatch score from both evidence sources', pills: ['rules + model'] },
      { id: 'CAND', ...at(3, 1), kind: 'guard', icon: 'check', name: 'Mismatch candidate', cap: 'worth a look, not an accusation', pills: ['threshold'] },
      { id: 'TRAIN', ...at(0, 2), kind: 'code', icon: 'chart', name: 'Training + evaluation', cap: 'scored by store, camera and condition slice' },
      { id: 'FEED', ...at(1, 2), kind: 'store', icon: 'db', name: 'Disposition / feedback', cap: 'labelled outcome for evaluation' },
      { id: 'HUMAN', ...at(2, 2), kind: 'person', icon: 'review', name: 'Human review', cap: 'confirmed, dismissed or uncertain', pills: ['required'] },
      { id: 'EVID', ...at(3, 2), kind: 'code', icon: 'file', name: 'Evidence package', cap: 'clip, confidence and POS context' },
    ],
    edges: [
      { id: 'e-frames', from: 'CAM', to: 'CV', fromSide: 'r', toSide: 'l', label: 'frames' },
      { id: 'e-tracks', from: 'CV', to: 'SYNC', fromSide: 'r', toSide: 'l', label: 'visual event' },
      { id: 'e-pos', from: 'POS', to: 'SYNC', fromSide: 'l', toSide: 'r', label: 'scans' },
      { id: 'e-window', from: 'SYNC', to: 'FUSE', fromSide: 'b', toSide: 't', label: 'aligned window' },
      { id: 'e-score', from: 'FUSE', to: 'CAND', fromSide: 'r', toSide: 'l', label: 'score' },
      { id: 'e-cand', from: 'CAND', to: 'EVID', fromSide: 'b', toSide: 't', label: 'above threshold' },
      { id: 'e-review', from: 'EVID', to: 'HUMAN', fromSide: 'l', toSide: 'r', label: 'evidence' },
      { id: 'e-disp', from: 'HUMAN', to: 'FEED', fromSide: 'l', toSide: 'r', label: 'disposition' },
      { id: 'e-label', from: 'FEED', to: 'TRAIN', fromSide: 'l', toSide: 'r', label: 'labels' },
      { id: 'e-promote', from: 'TRAIN', to: 'DEPLOY', fromSide: 't', toSide: 'b', label: 'validated model' },
      { id: 'e-deploy', from: 'DEPLOY', to: 'CV', fromSide: 't', toSide: 'b', toOff: -40, label: 'new version' },
      { id: 'e-telem', from: 'CV', to: 'MON', fromSide: 'b', toSide: 't', off: 40, dashed: true, label: 'telemetry' },
    ],
    steps: [
      { t: 'The camera sees an item move', who: 'model', nodes: ['CAM', 'CV'], edges: ['e-frames'], pay: 0,
        sum: 'Computer vision turns checkout video into evidence primitives: an item, a track, a zone.',
        pts: ['Frames from <span class="mono">cam_12</span> go through detection and tracking. Track <span class="mono">44</span> is an item that moves into the bagging zone.',
          'The output is a visual event, <span class="mono">item_to_bagging</span>, with a timestamp. It is evidence, not a fraud decision.',
          'Occlusion, lighting, camera angle and identity switches are the usual failure modes at this layer.'],
        why: '<b>Why stop at evidence?</b> A hand moving an item near the bagging area is not fraud. On its own, video is ambiguous.' },
      { t: 'POS events give the movement meaning', who: 'code', nodes: ['CV', 'POS', 'SYNC'], edges: ['e-tracks', 'e-pos'], pay: 1,
        sum: 'The visual event is lined up with the scans from the same checkout session.',
        pts: ['POS events for <span class="mono">checkout_9</span> say what was scanned and when, here SKU <span class="mono">A12</span>.',
          'The alignment step joins the visual event to the right checkout session and time window.',
          'Clock skew or a missing POS event breaks this join, and a bad join creates false positives.'],
        why: '<b>Why so much care here?</b> Synchronization quality matters as much as model quality. The question is whether a valid scan matches the movement.' },
      { t: 'Fusion produces a candidate', who: 'model', nodes: ['SYNC', 'FUSE', 'CAND'], edges: ['e-window', 'e-score'], pay: 2,
        sum: 'Visual features and POS context combine into one mismatch score, then a threshold decides if it is worth review.',
        pts: ['Fusion combines the aligned visual event and transaction window into a mismatch score, for example a <span class="mono">possible_miss_scan</span>.',
          'Multimodal here means evidence fusion, not sending everything to an LLM. Overweighting one signal makes the system brittle.',
          'The threshold policy is design-level detail. Below it, the event is only recorded in normal metrics.'] },
      { t: 'The candidate becomes reviewable evidence', who: 'code', nodes: ['CAND', 'EVID'], edges: ['e-cand'],
        sum: 'A score alone is hard to trust, so the candidate is packaged with the clip and the POS events behind it.',
        pts: ['The package carries the evidence refs, here <span class="mono">clip_91</span> and <span class="mono">pos_evt_17</span>, plus the confidence.',
          'The reviewer can see why the system surfaced the event, which also makes the decision auditable later.'],
        why: '<b>Why it matters:</b> reviewer time is finite. Too many weak candidates and the store team stops using the system.' },
      { t: 'A person makes the call', who: 'human', nodes: ['EVID', 'HUMAN'], edges: ['e-review'], pay: 3,
        sum: 'Ambiguous behaviour stays under human judgment: confirmed, dismissed or uncertain.',
        pts: ['The reviewer sees the clip, the confidence and the transaction context together.',
          'The system is decision support. It does not act on a candidate by itself.',
          'Inconsistent reviewers produce noisy labels, which matters for the next step.'] },
      { t: 'The decision becomes training data', who: 'code', nodes: ['HUMAN', 'FEED', 'TRAIN'], edges: ['e-disp', 'e-label'], pay: 4,
        sum: 'Each disposition is stored as a labelled outcome and bucketed by store and camera slice.',
        pts: ['The feedback event records the outcome and marks it training-eligible in an evaluation bucket such as a <b>store/camera slice</b>.',
          'Evaluation runs per slice rather than one global score, because offline metrics can hide store-specific weakness.',
          'Reviewed samples are not a random sample, so selection bias has to be handled before retraining.'] },
      { t: 'A validated model goes back to the store', who: 'code', nodes: ['TRAIN', 'DEPLOY', 'CV'], edges: ['e-promote', 'e-deploy'],
        sum: 'Only a validated version is promoted, and each store runs a known version.',
        pts: ['Training and evaluation produce a candidate version. The registry promotes it only after validation.',
          'Inference is distributed across stores, so version mismatch is a real risk. Deployed versions have to be visible in telemetry.',
          'Edge versus cloud placement is a design-level choice driven by bandwidth, privacy and resilience.'] },
      { t: 'Monitoring catches silent drift', who: 'code', nodes: ['CV', 'MON'], edges: ['e-telem'],
        sum: 'Input and output telemetry is watched for freshness, schema and distribution changes.',
        pts: ['Healthy infrastructure can still serve degraded predictions, so the monitor watches the data, not just uptime.',
          'An <b>11-day silent-drift incident</b> is what made this non-negotiable.'],
        why: '<b>Why best-effort here?</b> Telemetry is drawn dashed because it must never block inference, but it must always be looked at.' },
    ],
  },

  sitesense: {
    title: 'SiteSense · one keyword-gap question',
    caption: 'One plain-English SEO question answered through MCP. The model picks a typed tool; the tool, not the model, queries the data; the model then explains the evidence.',
    stats: [
      { n: '3', u: 'typed tools', l: 'get_domain_rank, analyze_keyword_gap, crawl_site_structure' },
      { n: '3', u: 'planes', l: 'user and AI client, MCP control plane, SEO data plane' },
      { n: '1', u: 'protocol boundary', l: 'MCP JSON-RPC sits between reasoning and deterministic tools' },
      { n: '0', u: 'raw database access', l: 'the model calls bounded tools; the tools own the facts' },
    ],
    w: 1170, h: 540,
    nodes: [
      { id: 'USER', ...at(0, 0), kind: 'person', name: 'SEO / content user', cap: 'asks a question in plain English', pills: ['no SQL'] },
      { id: 'CLIENT', ...at(1, 0), kind: 'llm', name: 'MCP-capable client', cap: 'picks a tool and fills its arguments', pills: ['LLM'] },
      { id: 'MCP', ...at(2, 0), kind: 'code', icon: 'send', name: 'MCP server', cap: 'JSON-RPC tools/list and tools/call', pills: ['JSON-RPC'] },
      { id: 'REG', ...at(3, 0), kind: 'code', icon: 'list', name: 'Tool registry', cap: 'names and schemas for each tool' },
      { id: 'ANSWER', ...at(0, 1), kind: 'llm', icon: 'file', name: 'Audit / explanation', cap: 'summary, actions and evidence refs' },
      { id: 'TRACE', ...at(1, 1), kind: 'obs', name: 'Tool audit / tracing', cap: 'tool, arguments, duration, data source' },
      { id: 'VALID', ...at(3, 1), kind: 'guard', icon: 'check', name: 'Argument validation', cap: 'rejects malformed or unbounded calls' },
      { id: 'CRAWL', ...at(1, 2), kind: 'store', icon: 'db', name: 'SEO data layer', cap: 'crawl, keyword and rank data', pills: ['freshness'] },
      { id: 'GAP', comp: 'TOOLS', ...at(2, 2), kind: 'code', icon: 'tool', name: 'analyze_keyword_gap', cap: 'deterministic gap analysis, bounded work', pills: ['typed'] },
      { id: 'AUTH', ...at(3, 2), kind: 'guard', icon: 'lock', name: 'Domain authorization', cap: 'which domains this caller may query' },
    ],
    edges: [
      { id: 'e-ask', from: 'USER', to: 'CLIENT', fromSide: 'r', toSide: 'l', label: 'question' },
      { id: 'e-call', from: 'CLIENT', to: 'MCP', fromSide: 'r', toSide: 'l', off: -12, label: 'tools/call' },
      { id: 'e-reply', from: 'MCP', to: 'CLIENT', fromSide: 'l', toSide: 'r', off: 12, label: 'typed result' },
      { id: 'e-lookup', from: 'MCP', to: 'REG', fromSide: 'r', toSide: 'l', off: -12, label: 'lookup' },
      { id: 'e-schemas', from: 'REG', to: 'MCP', fromSide: 'l', toSide: 'r', off: 12, label: 'schemas' },
      { id: 'e-valid', from: 'REG', to: 'VALID', fromSide: 'b', toSide: 't', label: 'check arguments' },
      { id: 'e-scope', from: 'VALID', to: 'AUTH', fromSide: 'b', toSide: 't', label: 'valid call' },
      { id: 'e-invoke', from: 'AUTH', to: 'GAP', fromSide: 'l', toSide: 'r', label: 'in scope' },
      { id: 'e-query', from: 'GAP', to: 'CRAWL', fromSide: 'l', toSide: 'r', off: -12, label: 'bounded query' },
      { id: 'e-rows', from: 'CRAWL', to: 'GAP', fromSide: 'r', toSide: 'l', off: 12, label: 'metrics' },
      { id: 'e-result', from: 'GAP', to: 'MCP', fromSide: 't', toSide: 'b', toOff: 40, label: 'structured result' },
      { id: 'e-trace', from: 'MCP', to: 'TRACE', fromSide: 'b', toSide: 'r', off: -40, dashed: true, label: 'every call' },
      { id: 'e-explain', from: 'CLIENT', to: 'ANSWER', fromSide: 'b', toSide: 't', toOff: 40, label: 'explain evidence' },
      { id: 'e-deliver', from: 'ANSWER', to: 'USER', fromSide: 't', toSide: 'b', off: -40, label: 'audit' },
    ],
    steps: [
      { t: 'A content manager asks a question', who: 'person', nodes: ['USER', 'CLIENT'], edges: ['e-ask'],
        sum: 'Where are we losing keywords against a competitor domain? Asked in plain English, not SQL.',
        pts: ['The data already exists. Without SiteSense, answering this needs someone who knows which tables or endpoints to query and how fresh the crawl is.',
          'The question goes to an MCP-capable LLM client instead of a custom chat backend.'],
        why: '<b>Why MCP?</b> It standardizes how any capable client discovers and calls the same tools, so there is no bespoke backend per use case.' },
      { t: 'The client discovers the tools', who: 'code', nodes: ['CLIENT', 'MCP', 'REG'], edges: ['e-lookup', 'e-schemas'], pay: 0,
        sum: 'A tools/list call returns a finite catalog of typed tools, not access to the database.',
        pts: ['The MCP server answers <span class="mono">tools/list</span> with <span class="mono">get_domain_rank</span>, <span class="mono">analyze_keyword_gap</span> and <span class="mono">crawl_site_structure</span>.',
          'Each tool has a narrow schema and a predictable result shape. The registry is drawn dashed because its internals are design-level.',
          'Tool schemas constrain the action space: the model can only ask for things a tool can do.'] },
      { t: 'The model picks a tool and its arguments', who: 'model', nodes: ['CLIENT', 'MCP'], edges: ['e-call'], pay: 1,
        sum: 'The model chooses analyze_keyword_gap and fills in the domain and competitor.',
        pts: ['The call is a JSON-RPC <span class="mono">tools/call</span> with <span class="mono">example.com</span> and <span class="mono">peer.com</span> as arguments.',
          'The model can still pick the wrong tool or pass bad arguments, which is why the next step exists.'] },
      { t: 'Arguments and scope are checked first', who: 'code', nodes: ['MCP', 'REG', 'VALID', 'AUTH'], edges: ['e-valid', 'e-scope'],
        sum: 'Malformed calls fail at the edge, and the caller may only query domains it is allowed to see.',
        pts: ['Argument validation checks the call against the tool schema before any work starts.',
          'Domain authorization scopes the request before the tool runs. Poor auth or overly broad tools would expose more than intended.',
          'Both controls are design-level detail from the LLD; confirm them before claiming them.'] },
      { t: 'The tool, not the model, runs the analysis', who: 'code', nodes: ['AUTH', 'GAP', 'CRAWL'], edges: ['e-invoke', 'e-query', 'e-rows'], pay: 2,
        sum: 'A deterministic function queries crawl and keyword data and returns typed metrics.',
        pts: ['<span class="mono">analyze_keyword_gap</span> runs a bounded query against the SEO data layer.',
          'It returns missing keywords, an overlap figure and a <b>data_freshness</b> date, so the age of the crawl is explicit.',
          'Slow tools need timeouts, pagination and bounded work. Long crawls need job state rather than blocking.'],
        why: '<b>Why deterministic?</b> The model orchestrates; the tools own the facts. Stale or invented metrics are worse than no answer.' },
      { t: 'A structured result goes back', who: 'code', nodes: ['GAP', 'MCP', 'CLIENT', 'TRACE'], edges: ['e-result', 'e-reply', 'e-trace'],
        sum: 'The result returns as typed JSON-RPC, and the call is recorded for audit.',
        pts: ['The client receives structured metrics tied to a request id, here <span class="mono">rpc_81</span>.',
          'Tool name, arguments, duration and data source are audited so any answer can be reproduced. The tracing is design-level.'] },
      { t: 'The model explains the evidence', who: 'model', nodes: ['CLIENT', 'ANSWER', 'USER'], edges: ['e-explain', 'e-deliver'], pay: 3,
        sum: 'The client turns the metrics into a plain-English audit with recommendations and evidence refs.',
        pts: ['The answer carries a summary, recommendations and <span class="mono">evidence_refs</span> pointing back to <span class="mono">rpc_81</span>.',
          'The model may overstate what the metrics prove, so the evidence stays in the response and conclusions remain inspectable.'] },
    ],
  },
};

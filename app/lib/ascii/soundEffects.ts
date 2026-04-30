let audioCtx: AudioContext | null = null;

const getContext = (): AudioContext | null => {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext?: typeof AudioContext })
				.webkitAudioContext;
		if (!AudioContextClass) return null;
		audioCtx = new AudioContextClass();
	}
	return audioCtx;
};

const ensureContext = async (): Promise<AudioContext | null> => {
	const ctx = getContext();
	if (!ctx) return null;
	if (ctx.state === "suspended") {
		try {
			await ctx.resume();
		} catch (e) {
			console.warn("Audio context resume failed", e);
		}
	}
	return ctx;
};

let ambientNodes: {
	osc: OscillatorNode;
	gain: GainNode;
	lfo: OscillatorNode;
} | null = null;

export const startAmbientHum = async () => {
	if (ambientNodes) return;
	try {
		const ctx = await ensureContext();
		if (!ctx) return;

		const osc = ctx.createOscillator();
		const lfo = ctx.createOscillator();
		const filter = ctx.createBiquadFilter();
		const gain = ctx.createGain();
		const lfoGain = ctx.createGain();

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(ctx.destination);

		lfo.connect(lfoGain);
		lfoGain.connect(filter.detune);

		osc.type = "sawtooth";
		osc.frequency.value = 55;

		filter.type = "lowpass";
		filter.frequency.value = 120;
		filter.Q.value = 6;

		lfo.type = "sine";
		lfo.frequency.value = 0.15;
		lfoGain.gain.value = 300;

		gain.gain.value = 0.03;

		osc.start();
		lfo.start();

		ambientNodes = { osc, gain, lfo };
	} catch (e) {
		console.error("Failed to start ambient hum", e);
	}
};

export const stopAmbientHum = () => {
	if (!ambientNodes) return;
	const { osc, gain, lfo } = ambientNodes;
	const ctx = getContext();
	if (!ctx) {
		ambientNodes = null;
		return;
	}
	const t = ctx.currentTime;
	try {
		gain.gain.setTargetAtTime(0, t, 0.1);
		setTimeout(() => {
			osc.stop();
			lfo.stop();
			osc.disconnect();
			lfo.disconnect();
			gain.disconnect();
		}, 200);
	} catch {
		// context may already be closed
	}
	ambientNodes = null;
};

export const playStartupSound = async () => {
	try {
		const ctx = await ensureContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "sawtooth";
		osc.frequency.setValueAtTime(50, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.0);

		gain.gain.setValueAtTime(0, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.5);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);

		osc.start();
		osc.stop(ctx.currentTime + 1.0);
	} catch (e) {
		console.error(e);
	}
};

export const playScanSound = async () => {
	try {
		const ctx = await ensureContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const filter = ctx.createBiquadFilter();

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "square";
		osc.frequency.setValueAtTime(1200, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

		filter.type = "lowpass";
		filter.frequency.setValueAtTime(8000, ctx.currentTime);

		gain.gain.setValueAtTime(0.05, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

		osc.start();
		osc.stop(ctx.currentTime + 0.15);
	} catch (e) {
		console.error(e);
	}
};

export const playAnalysisStartSound = async () => {
	try {
		const ctx = await ensureContext();
		if (!ctx) return;
		const t = ctx.currentTime;
		for (let i = 0; i < 8; i++) {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.type = "sine";
			const freq = 600 + Math.random() * 1000;
			osc.frequency.setValueAtTime(freq, t + i * 0.06);

			gain.gain.setValueAtTime(0.03, t + i * 0.06);
			gain.gain.linearRampToValueAtTime(0, t + i * 0.06 + 0.04);

			osc.start(t + i * 0.06);
			osc.stop(t + i * 0.06 + 0.04);
		}
	} catch (e) {
		console.error(e);
	}
};

export const playAnalysisCompleteSound = async () => {
	try {
		const ctx = await ensureContext();
		if (!ctx) return;
		const t = ctx.currentTime;
		const freqs = [523.25, 659.25, 783.99, 1046.5];

		freqs.forEach((f, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "triangle";
			osc.frequency.setValueAtTime(f, t + i * 0.06);

			osc.connect(gain);
			gain.connect(ctx.destination);

			gain.gain.setValueAtTime(0, t + i * 0.06);
			gain.gain.linearRampToValueAtTime(0.05, t + i * 0.06 + 0.03);
			gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.5);

			osc.start(t + i * 0.06);
			osc.stop(t + i * 0.06 + 0.5);
		});
	} catch (e) {
		console.error(e);
	}
};

export const playButtonSound = async () => {
	try {
		const ctx = await ensureContext();
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "sine";
		osc.frequency.setValueAtTime(1500, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.05);

		gain.gain.setValueAtTime(0.02, ctx.currentTime);
		gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

		osc.start();
		osc.stop(ctx.currentTime + 0.05);
	} catch {
		// silent failure: audio is a nice-to-have
	}
};

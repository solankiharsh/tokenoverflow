import { GoogleGenAI, Type } from "@google/genai";
import type { Route } from "./+types/api.vk.analyze";
import { loadContextKey } from "../lib/load-context";
import type { AnalysisResult } from "../lib/ascii/types";
import { getPersona } from "../lib/ascii/personas";

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/jpg"]);

// Sliding-window rate limit: per-IP, fixed bucket of RATE_LIMIT requests per RATE_WINDOW_SEC.
// Stored in the existing SUBSCRIBERS KV with key prefix `rate:vk:` so we don't need new infra.
const RATE_LIMIT = 10;
const RATE_WINDOW_SEC = 60;

function errorResponse(
	status: number,
	message: string,
	extraHeaders?: HeadersInit,
) {
	return Response.json({ error: message }, { status, headers: extraHeaders });
}

type RateBucket = { count: number; resetAt: number };

function clientIp(request: Request): string {
	return (
		request.headers.get("cf-connecting-ip") ??
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		"unknown"
	);
}

async function checkRateLimit(
	kv: KVNamespace | undefined,
	ip: string,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
	if (!kv) return { ok: true };
	const key = `rate:vk:${ip}`;
	const now = Math.floor(Date.now() / 1000);
	const raw = await kv.get(key);
	let bucket: RateBucket;
	if (raw) {
		try {
			bucket = JSON.parse(raw) as RateBucket;
		} catch {
			bucket = { count: 0, resetAt: now + RATE_WINDOW_SEC };
		}
		if (bucket.resetAt <= now) {
			bucket = { count: 0, resetAt: now + RATE_WINDOW_SEC };
		}
	} else {
		bucket = { count: 0, resetAt: now + RATE_WINDOW_SEC };
	}
	if (bucket.count >= RATE_LIMIT) {
		return { ok: false, retryAfter: Math.max(1, bucket.resetAt - now) };
	}
	bucket.count += 1;
	await kv.put(key, JSON.stringify(bucket), {
		expirationTtl: bucket.resetAt - now + 5,
	});
	return { ok: true };
}

export async function action({ request, context }: Route.ActionArgs) {
	if (request.method !== "POST") {
		return errorResponse(405, "Method not allowed");
	}

	const contentLength = Number(request.headers.get("content-length") ?? "0");
	if (contentLength && contentLength > MAX_BODY_BYTES) {
		return errorResponse(413, "Payload too large");
	}

	const cfEnv = context.get(loadContextKey).cloudflare.env as
		| { GEMINI_API_KEY?: string; SUBSCRIBERS?: KVNamespace }
		| undefined;

	const ip = clientIp(request);
	const rate = await checkRateLimit(cfEnv?.SUBSCRIBERS, ip);
	if (!rate.ok) {
		return errorResponse(429, "Rate limit exceeded. Please slow down.", {
			"Retry-After": String(rate.retryAfter),
		});
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse(400, "Invalid JSON body");
	}

	const imageRaw =
		typeof body === "object" && body !== null && "image" in body
			? (body as { image?: unknown }).image
			: undefined;
	const personaRaw =
		typeof body === "object" && body !== null && "persona" in body
			? (body as { persona?: unknown }).persona
			: undefined;

	if (typeof imageRaw !== "string" || imageRaw.length === 0) {
		return errorResponse(400, "Missing image data");
	}

	const match = imageRaw.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/);
	if (!match) {
		return errorResponse(
			400,
			"Image must be a base64-encoded PNG or JPEG data URL",
		);
	}
	const mimeType = match[1];
	const cleanBase64 = match[2];
	if (!ALLOWED_MIME.has(mimeType)) {
		return errorResponse(415, "Unsupported image type");
	}
	if (cleanBase64.length > MAX_BODY_BYTES) {
		return errorResponse(413, "Image payload too large");
	}

	const apiKey = cfEnv?.GEMINI_API_KEY;
	if (!apiKey) {
		return errorResponse(503, "V-K analyzer not configured");
	}

	const persona = getPersona(
		typeof personaRaw === "string" ? personaRaw : undefined,
	);

	try {
		const ai = new GoogleGenAI({ apiKey });
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: {
				parts: [
					{ inlineData: { mimeType, data: cleanBase64 } },
					{ text: persona.prompt },
				],
			},
			config: {
				responseMimeType: "application/json",
				responseSchema: {
					type: Type.OBJECT,
					properties: {
						description: {
							type: Type.STRING,
							description:
								"A two-sentence, in-character assessment of the subject.",
						},
						threatLevel: {
							type: Type.STRING,
							description:
								"One of LOW, MODERATE, HIGH, CRITICAL, UNKNOWN.",
						},
						tags: {
							type: Type.ARRAY,
							items: { type: Type.STRING },
							description:
								"3-5 short all-caps keywords flavored by the persona.",
						},
					},
					required: ["description", "threatLevel", "tags"],
				},
			},
		});

		const text = response.text;
		if (!text) {
			return errorResponse(502, "Empty response from model");
		}

		let parsed: AnalysisResult;
		try {
			parsed = JSON.parse(text) as AnalysisResult;
		} catch {
			return errorResponse(502, "Invalid response format from model");
		}

		if (
			typeof parsed.description !== "string" ||
			typeof parsed.threatLevel !== "string" ||
			!Array.isArray(parsed.tags)
		) {
			return errorResponse(502, "Malformed response from model");
		}

		parsed.persona = persona.label;
		return Response.json(parsed);
	} catch (error) {
		console.error("Gemini API error", error);
		return errorResponse(502, "Upstream analyzer failed");
	}
}

export function loader() {
	return errorResponse(405, "Method not allowed");
}

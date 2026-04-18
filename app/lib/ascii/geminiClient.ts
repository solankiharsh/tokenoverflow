import type { AnalysisResult } from "./types";
import type { PersonaId } from "./personas";

/**
 * Client-side helper: POSTs the captured V-K frame (data URL) to our own
 * Worker route, which proxies the request to Gemini with a server-held key.
 * The user's GEMINI_API_KEY never leaves the server.
 */
export const analyzeImage = async (
	base64Image: string,
	persona: PersonaId,
): Promise<AnalysisResult> => {
	try {
		const response = await fetch("/api/vk/analyze", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ image: base64Image, persona }),
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => "");
			console.error("Analyze request failed", response.status, errorText);
			if (response.status === 429) {
				return {
					description:
						"RATE LIMIT EXCEEDED. Cooldown engaged. Retry in a moment.",
					threatLevel: "THROTTLED",
					tags: ["ERROR", "429", "BACKOFF"],
				};
			}
			return {
				description:
					"ANALYSIS FAILED. UNABLE TO PROCESS VISUAL DATA. RETRY INITIATED.",
				threatLevel: "ERROR",
				tags: ["ERROR", "NO_DATA"],
			};
		}

		const data = (await response.json()) as AnalysisResult;
		return data;
	} catch (error) {
		console.error("Analyze network error:", error);
		return {
			description: "SYSTEM ERROR: Neural link connection failed.",
			threatLevel: "UNKNOWN",
			tags: ["ERROR", "OFFLINE"],
		};
	}
};

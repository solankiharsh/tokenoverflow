import type { PersonaId } from "./personas";

export interface AsciiOptions {
	fontSize: number;
	brightness: number;
	contrast: number;
	colorMode: "matrix" | "bw" | "color" | "retro";
	density: "simple" | "complex" | "binary" | "blocks";
	resolution: number;
	invert: boolean;
	cameraFacing: "user" | "environment";
	persona: PersonaId;
}

export interface AnalysisResult {
	description: string;
	tags: string[];
	threatLevel: string;
	persona?: string;
}

export const DENSITY_MAPS = {
	simple: " .:-=+*#%@",
	complex: " .^!*<&%$#@",
	binary: " 01",
	blocks: " ░▒▓█",
};

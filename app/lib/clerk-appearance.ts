/**
 * Shared Clerk appearance for the terminal theme.
 * High-contrast so sign-in, sign-up, UserButton menu and Account modal are clearly visible.
 */
export const terminalAppearance = {
	variables: {
		// Backgrounds
		colorBackground: "#0d1117",
		colorInput: "#161b22",
		colorMuted: "#161b22",
		// Primary text – bright so labels and content are readable
		colorForeground: "#f0f6fc",
		colorText: "#f0f6fc",
		// Secondary text – lighter grey so "Manage account", hints, etc. are visible
		colorMutedForeground: "#c9d1d9",
		colorTextSecondary: "#c9d1d9",
		// Input text
		colorInputForeground: "#e6edf3",
		colorInputText: "#e6edf3",
		colorInputBackground: "#161b22",
		// Accent and borders
		primaryColor: "#58a6ff",
		colorBorder: "#484f58",
		colorRing: "#58a6ff",
		// Modal
		colorModalBackdrop: "rgba(0,0,0,0.85)",
		borderRadius: "6px",
	},
	elements: {
		rootBox: "mx-auto",
		card: "border-2 border-[#484f58] bg-[#0d1117] shadow-xl",
		cardBox: "border-2 border-[#484f58] bg-[#0d1117]",
		headerTitle: "font-mono text-[#58a6ff] text-lg font-semibold",
		headerSubtitle: "font-mono text-[#c9d1d9]",
		formFieldLabel: "font-mono text-[#f0f6fc] font-medium",
		formFieldInput:
			"font-mono bg-[#21262d] border-2 border-[#484f58] text-[#e6edf3] placeholder:text-[#8b949e] focus:border-[#58a6ff]",
		formButtonPrimary:
			"font-mono bg-[#58a6ff] text-[#0d1117] font-semibold hover:opacity-90 border-0",
		footerActionLink: "font-mono text-[#58a6ff] hover:underline",
		// Modal overlay and content
		modalBackdrop: "bg-black/90",
		modalContent: "border-2 border-[#484f58] bg-[#0d1117] font-mono shadow-2xl",
		// UserButton dropdown and UserProfile – ensure text and links are visible
		userButtonPopoverCard: "border-2 border-[#484f58] bg-[#0d1117] shadow-xl",
		userButtonPopoverActionButton: "text-[#f0f6fc] hover:bg-[#21262d]",
		userButtonPopoverActionButtonText: "text-[#f0f6fc]",
		userButtonPopoverFooter: "hidden",
		// Account / UserProfile modal
		navbar: "border-b border-[#484f58] bg-[#161b22]",
		profileSection: "border-[#484f58]",
		profileSectionTitle: "text-[#c9d1d9]",
		profileSectionTitleText: "text-[#f0f6fc]",
		formFieldInputShowPasswordButton: "text-[#58a6ff]",
		accordionTriggerButton: "text-[#f0f6fc] hover:bg-[#21262d]",
		badge: "bg-[#21262d] text-[#c9d1d9] border border-[#484f58]",
		button: "text-[#f0f6fc] hover:bg-[#21262d]",
	},
} as const;

/**
 * Clerk appearance: comic-book theme (light, bold borders, yellow accent).
 */
export const terminalAppearance = {
	variables: {
		colorBackground: "#FFFFFF",
		colorInput: "#FFFFFF",
		colorMuted: "#F5F5F5",
		colorForeground: "#000000",
		colorText: "#000000",
		colorMutedForeground: "#666666",
		colorTextSecondary: "#666666",
		colorInputForeground: "#000000",
		colorInputText: "#000000",
		colorInputBackground: "#FFFFFF",
		primaryColor: "#FFD600",
		colorBorder: "#000000",
		colorRing: "#FFD600",
		colorModalBackdrop: "rgba(0,0,0,0.5)",
		borderRadius: "0",
	},
	elements: {
		rootBox: "mx-auto",
		card: "border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]",
		cardBox: "border-[3px] border-black bg-white",
		headerTitle: "font-display font-bold uppercase text-black text-lg",
		headerSubtitle: "text-comic-gray-medium",
		formFieldLabel: "font-display font-bold uppercase text-black",
		formFieldInput:
			"border-[3px] border-black bg-white text-black placeholder-comic-gray-light focus:outline-none focus:ring-2 focus:ring-comic-yellow",
		formButtonPrimary:
			"font-display font-bold uppercase bg-comic-yellow text-black border-[3px] border-black hover:bg-comic-yellow-hover shadow-[4px_4px_0_0_#000]",
		footerActionLink: "font-display font-bold text-comic-black hover:text-comic-yellow",
		modalBackdrop: "bg-black/50",
		modalContent: "border-[3px] border-black bg-white shadow-[6px_6px_0_0_#000]",
		userButtonPopoverCard: "border-[3px] border-black bg-white shadow-[4px_4px_0_0_#000]",
		userButtonPopoverActionButton: "text-black hover:bg-comic-gray",
		userButtonPopoverActionButtonText: "text-black font-display font-bold uppercase",
		userButtonPopoverFooter: "hidden",
		navbar: "border-b-[3px] border-black bg-comic-gray",
		profileSection: "border-comic-black",
		profileSectionTitle: "text-comic-gray-medium",
		profileSectionTitleText: "text-black font-display font-bold",
		formFieldInputShowPasswordButton: "text-comic-yellow",
		accordionTriggerButton: "text-black hover:bg-comic-gray",
		badge: "bg-comic-gray text-comic-gray-dark border-[2px] border-black",
		button: "text-black hover:bg-comic-gray font-display font-bold uppercase",
	},
} as const;

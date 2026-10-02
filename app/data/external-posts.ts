/**
 * Writing published on external platforms. Each URL points to the specific
 * article so portfolio cards open the intended post rather than an author page.
 */
export type WritingPlatform = "LinkedIn" | "Medium" | "Substack";

export interface ExternalPost {
	title: string;
	url: string;
	platform: WritingPlatform;
	date?: string;
}

export const externalPosts: ExternalPost[] = [
	{
		title: "Order From Chaos: Why I’m Building a Modern Quant Engine While the World Watches the News",
		url: "https://www.linkedin.com/pulse/order-from-chaos-why-im-building-modern-quant-engine-while-solanki-quqnf",
		platform: "LinkedIn",
		date: "Mar 6, 2026",
	},
	{
		title: "A certification like no other",
		url: "https://www.linkedin.com/pulse/certification-like-other-harsh-solanki",
		platform: "LinkedIn",
		date: "Aug 4, 2022",
	},
	{
		title: "Deriv Analytics – We built our own Google Analytics (And it’s better)",
		url: "https://derivai.substack.com/p/deriv-analytics-we-built-our-own",
		platform: "Substack",
		date: "Dec 22, 2025",
	},
	{
		title: "Building Postly: How AI is giving Deriv partners a competitive edge",
		url: "https://derivai.substack.com/p/building-postly-how-ai-is-giving",
		platform: "Substack",
		date: "Jan 13, 2026",
	},
	{
		title: "I Built an AI Detective That Investigates Humans. Here Are the 13 Things That Almost Killed It.",
		url: "https://solharsh.medium.com/i-built-an-ai-detective-that-investigates-humans-here-are-the-13-things-that-almost-killed-it-4dda48aab809",
		platform: "Medium",
		date: "Feb 28, 2026",
	},
	{
		title: "Ingesting Data from Hadoop to Google Cloud Storage: A Step-by-Step Guide",
		url: "https://solharsh.medium.com/ingesting-data-from-hadoop-to-google-cloud-storage-a-step-by-step-guide-b06197f2a36a",
		platform: "Medium",
		date: "Mar 5, 2024",
	},
	{
		title: "Clearing AWS ML Specialty Certification in just 6 days of study with a cheat sheet",
		url: "https://solharsh.medium.com/clearing-aws-ml-specialty-certification-in-just-6-days-of-study-with-a-cheat-sheet-aac2e3c7ee10",
		platform: "Medium",
		date: "Jan 28, 2021",
	},
	{
		title: "Automated video editing to avoid seeing my relatives in a wedding video",
		url: "https://solharsh.medium.com/automated-video-editing-to-avoid-seeing-my-relatives-in-a-wedding-video-8fdb224c65d3",
		platform: "Medium",
		date: "Feb 25, 2021",
	},
	{
		title: "Dummies Guide to Deploying a Custom Pytorch Model on AWS Sagemaker",
		url: "https://solharsh.medium.com/dummies-guide-to-deploying-a-custom-pytorch-model-on-aws-sagemaker-46a0a23f532",
		platform: "Medium",
		date: "Dec 28, 2020",
	},
];

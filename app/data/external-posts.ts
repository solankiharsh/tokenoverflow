/**
 * External blog posts (Medium). Update URLs from your published stories:
 * https://medium.com/me/stories?tab=posts-published
 */
export interface ExternalPost {
	title: string;
	url: string;
	date?: string;
}

export const externalPosts: ExternalPost[] = [
	{
		title: "I Built an AI Detective That Investigates Humans. Here Are the 13 Things That Almost Killed It.",
		url: "https://solharsh.medium.com",
		date: "2025",
	},
	{
		title: "I Built a Colosseum Where AI Agents Trade Real Money — and You Can Watch Every Move",
		url: "https://solharsh.medium.com",
		date: "Feb 19, 2025",
	},
	{
		title: "Ingesting Data from Hadoop to Google Cloud Storage: A Step-by-Step Guide",
		url: "https://solharsh.medium.com",
		date: "Mar 5, 2024",
	},
	{
		title: "Clearing AWS ML Specialty Certification in just 6 days of study with a cheat sheet",
		url: "https://solharsh.medium.com/clearing-aws-ml-specialty-certification-in-just-6-days-of-study-with-a-cheat-sheet-aac2e3c7ee10",
		date: "Jan 28, 2021",
	},
	{
		title: "Automated video editing to avoid seeing my relatives in a wedding video",
		url: "https://solharsh.medium.com/automated-video-editing-to-avoid-seeing-my-relatives-in-a-wedding-video-8fdb224c65d3",
		date: "Feb 25, 2021",
	},
	{
		title: "Dummies Guide to Deploying a Custom Pytorch Model on AWS Sagemaker",
		url: "https://solharsh.medium.com/dummies-guide-to-deploying-a-custom-pytorch-model-on-aws-sagemaker-46a0a23f532",
		date: "Dec 28, 2020",
	},
];

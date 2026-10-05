export type Service = { number: string; title: string; text: string };
export type Client = { name: string; logo: string };
export type Project = { title: string; category: string; year: string; description: string };
export type Article = { title: string; slug: string; category: string; excerpt: string; content: string; date: string; readTime: string };

export const defaultServices: Service[] = [
  { number: "01", title: "Brand Strategy", text: "We define the positioning, direction and story that give your brand a clear place in the market." },
  { number: "02", title: "Brand Identity", text: "Visual identities designed to make your business recognizable, consistent and memorable." },
  { number: "03", title: "Graphic Design", text: "Creative visual systems for social media, campaigns, marketing materials and digital experiences." },
  { number: "04", title: "Content Creation", text: "Human-centered content designed to connect your brand with the people who matter." },
  { number: "05", title: "Social Media", text: "Strategic social media content that keeps your brand active, relevant and recognizable." },
  { number: "06", title: "Digital Marketing", text: "Creative campaigns and digital strategies built to move attention into action." },
];

export const defaultClients: Client[] = [
  { name: "San Thawdar Luxury Jewellery Shop", logo: "/clients/san-thawdar.png" },
  { name: "Vera Luxury Spa", logo: "/clients/vera.png" },
  { name: "Laura & Grace Travel Services", logo: "/clients/laura-grace.png" },
  { name: "Shwe Yadanar Myanmar Construction & Decoration", logo: "/clients/shwe-yadanar.png" },
  { name: "Unique Tailor", logo: "/clients/unique-tailor.png" },
  { name: "New Icon Custom Tailor", logo: "/clients/new-icon.png" },
  { name: "Modern Men Bangkok Custom Tailor", logo: "/clients/modern-men.png" },
];

export const defaultProjects: Project[] = [
  { title: "San Thawdar", category: "Branding · Social", year: "2026", description: "Brand communication and creative direction for a luxury jewellery business." },
  { title: "Vera Luxury Spa", category: "Branding · Content", year: "2026", description: "Human-centered social content and visual direction for a premium spa experience." },
  { title: "Modern Men", category: "Social · Creative", year: "2026", description: "Social media creative direction for a custom tailoring brand." },
];

export const defaultArticles: Article[] = [
  { title: "Why Your Brand Needs More Than Just a Logo", slug: "why-your-brand-needs-more-than-a-logo", category: "Branding", excerpt: "A logo is a starting point. A real brand is the system, story and experience people remember.", content: "A logo can make a business recognizable, but recognition is only one part of branding. Strong brands create a consistent point of view across identity, messaging, content and customer experience.\n\nAt MODO, we believe branding should make a business easier to understand, easier to remember and easier to choose. That starts with strategy before visual execution.", date: "Oct 05, 2026", readTime: "4 min read" },
  { title: "5 Digital Marketing Mistakes Small Businesses Make", slug: "5-digital-marketing-mistakes-small-businesses-make", category: "Digital Marketing", excerpt: "Posting more is not always the answer. Here are five common mistakes that quietly limit growth.", content: "Digital marketing works best when every channel has a job. Many small businesses publish frequently without a clear audience, offer or measurement plan.\n\nThe goal is not to be everywhere. The goal is to be useful, consistent and memorable where your audience already spends attention.", date: "Oct 02, 2026", readTime: "5 min read" },
  { title: "Content That Makes People Stop Scrolling", slug: "content-that-makes-people-stop-scrolling", category: "Copywriting", excerpt: "Good creative earns attention before it asks for action. Here is how to build that first moment.", content: "The first job of social content is to earn a second look. Strong hooks create curiosity, relevance or emotion without making empty promises.\n\nPair a clear idea with a visual that supports it, then finish with a simple next step. That is the difference between content that fills a calendar and content that builds a brand.", date: "Sep 28, 2026", readTime: "3 min read" },
];

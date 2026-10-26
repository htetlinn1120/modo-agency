import { defaultArticles } from "../../content";
import ArticleClient from "./ArticleClient";

export function generateStaticParams() {
  return defaultArticles.map((article) => ({ slug: article.slug }));
}

export const dynamicParams = false;

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleClient slug={slug} />;
}

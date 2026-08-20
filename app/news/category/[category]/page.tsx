import NewsListingPage from "@/components/portal/NewsListingPage";

function titleFromSlug(slug: string): string {
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default async function NewsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const title = titleFromSlug(category);

  return <NewsListingPage key={category} title={title} description={`Published ${title.toLowerCase()} reporting selected in the Bangladesh Betar admin newsroom.`} categorySlug={category} />;
}

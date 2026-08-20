import WatchListingPage from "@/components/portal/WatchListingPage";

function titleFromSlug(slug: string): string {
  if (slug === "culture") return "Culture & music";
  return slug.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default async function WatchCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const title = titleFromSlug(category);

  return <WatchListingPage key={category} title={title} description={`Watch every published ${title.toLowerCase()} programme selected in the Bangladesh Betar admin portal.`} categorySlug={category} />;
}

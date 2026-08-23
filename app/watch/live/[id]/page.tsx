import WatchLiveExperience from "@/components/watch/WatchLiveExperience";

export default async function WatchLiveChannelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WatchLiveExperience preferredChannelId={Number(id)} />;
}

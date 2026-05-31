import FeedMasonryGrid from "@/components/FeedMasonryGrid";
import { profilePostToMasonryCard } from "@/src/feedMasonryHelpers";
import type { ListDetailPost } from "./ListDetailGrid";

interface ListDetailTimelineProps {
  posts: ListDetailPost[];
  resetKey?: string;
}

/** Timeline görünümü de Pinterest mazgal (grid ile aynı) */
export default function ListDetailTimeline({
  posts,
  resetKey = "list-timeline",
}: ListDetailTimelineProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full rounded bg-white p-4">
      <FeedMasonryGrid
        posts={posts.map((post) => profilePostToMasonryCard(post))}
        resetKey={resetKey}
      />
    </section>
  );
}

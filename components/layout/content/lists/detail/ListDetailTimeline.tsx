import { listPostPath } from "@/src/listPaths";
import { pickPostImageUrl } from "@/src/postImageUrl";
import ListDetailItem from "./ListDetailItem";
import type { ListDetailPost } from "./ListDetailGrid";

interface ListDetailTimelineProps {
  posts: ListDetailPost[];
}

export default function ListDetailTimeline({ posts }: ListDetailTimelineProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white p-4 rounded">
      {posts.map((post) => {
        const author = post.userName?.trim() || "";
        const href = listPostPath(author, post.id);
        const time = (post as { addedAt?: string; createDate?: string }).addedAt
          || (post as { createDate?: string }).createDate
          || "";

        return (
          <ListDetailItem
            key={post.id}
            link={href}
            image={
              pickPostImageUrl(post.image, post.imageUrls, "thumb") ||
              "/postExample/F5Z00CEaEAAFPgi.jpg"
            }
            user={author ? `@${author}` : ""}
            time={time}
            title={post.subject}
          />
        );
      })}
    </section>
  );
}

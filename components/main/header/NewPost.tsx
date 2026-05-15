import PostComposer from "@/components/layout/content/contentCenter/PostComposer";
import type { CreatedPostPayload } from "@/components/layout/content/contentCenter/PostComposer";

interface NewPostProps {
  onCreated?: (post?: CreatedPostPayload) => void;
}

export default function NewPost({ onCreated }: NewPostProps) {
  return <PostComposer onCreated={onCreated} variant="modal" />;
}

import PostComposer from "./PostComposer";

interface CreatePostProps {
  /** true = mobil görünümünde de gizlenme, kart tam gösterilsin */
  showOnMobile?: boolean;
}

export default function CreatePost({ showOnMobile = true }: CreatePostProps) {
  return <PostComposer variant="inline" showOnMobile={showOnMobile} />;
}

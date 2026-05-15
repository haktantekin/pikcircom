import PostComments from "./PostComments";

interface PostCollapseProps {
  postId?: string;
  onCommentCountChange?: (count: number) => void;
}

export default function PostCollapse({
  postId,
  onCommentCountChange,
}: PostCollapseProps) {
  return (
    <PostComments postId={postId} onCommentCountChange={onCommentCountChange} />
  );
}

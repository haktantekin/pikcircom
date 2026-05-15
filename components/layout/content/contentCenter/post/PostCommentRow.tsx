import { deletePostComment } from "@/configs/client-services";
import { resolveProfileImageUrl } from "@/src/avatarUrl";
import { formatRelativeTime } from "@/src/formatRelativeTime";
import type { CommentTreeNode } from "@/src/commentTree";
import { IconMessageReply, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

interface PostCommentRowProps {
  node: CommentTreeNode;
  depth: number;
  viewerUserName: string | null;
  postId: string;
  onThreadChanged: () => void;
  onReply: (target: { id: string; userName: string; displayName?: string }) => void;
}

export default function PostCommentRow({
  node,
  depth,
  viewerUserName,
  postId,
  onThreadChanged,
  onReply,
}: PostCommentRowProps) {
  const { t, i18n } = useTranslation();
  const isOwner =
    viewerUserName !== null &&
    node.userName.toLowerCase() === viewerUserName.toLowerCase();
  const pad = Math.min(depth, 8) * 12;

  const handleDelete = async () => {
    if (!window.confirm(t("commentDeleteConfirm"))) return;
    try {
      const res = await deletePostComment(postId, node.id);
      if (typeof res.data?.commentCount === "number") {
        onThreadChanged();
      } else {
        onThreadChanged();
      }
    } catch {
      alert(t("commentDeleteError"));
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className="flex items-start gap-3 p-4"
        style={{ paddingLeft: pad + 16 }}
      >
        <Link href={`/${node.userName}`} className="shrink-0">
          <img
            src={resolveProfileImageUrl(node.profileImage)}
            alt=""
            className="w-9 h-9 rounded-full border border-white object-cover"
            width={36}
            height={36}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-bold text-sm">
              {node.displayName || node.userName}
            </span>
            <Link
              href={`/${node.userName}`}
              className="text-xs text-343a40 hover:text-58b4d1"
            >
              @{node.userName}
            </Link>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(node.createDate, i18n.language)}
            </span>
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap break-words text-202124">
            {stripTags(node.content)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <button
              type="button"
              className="font-bold text-58b4d1 flex items-center gap-1"
              onClick={() =>
                onReply({
                  id: node.id,
                  userName: node.userName,
                  displayName: node.displayName,
                })
              }
            >
              <IconMessageReply size={14} stroke={1.2} />
              {t("commentReply")}
            </button>
            {isOwner && (
              <button
                type="button"
                className="font-bold text-126782 flex items-center gap-1"
                onClick={() => void handleDelete()}
              >
                <IconTrash size={14} stroke={1.2} />
                {t("commentDelete")}
              </button>
            )}
          </div>
        </div>
      </div>
      {node.children.map((child) => (
        <PostCommentRow
          key={child.id}
          node={child}
          depth={depth + 1}
          viewerUserName={viewerUserName}
          postId={postId}
          onThreadChanged={onThreadChanged}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

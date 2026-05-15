import { createPostComment } from "@/configs/client-services";
import { buildCommentTree, type CommentItem } from "@/src/commentTree";
import { IconCornerDownRight, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PostCommentRow from "./PostCommentRow";

interface PostCommentsProps {
  postId?: string;
  onCommentCountChange?: (count: number) => void;
}

interface ReplyTarget {
  id: string;
  userName: string;
  displayName?: string;
}

export default function PostComments({
  postId,
  onCommentCountChange,
}: PostCommentsProps) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewerUserName, setViewerUserName] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const onCountRef = useRef(onCommentCountChange);
  onCountRef.current = onCommentCountChange;

  const loadAll = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(
        `/api/posts/${encodeURIComponent(postId)}/comments?_=${Date.now()}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) {
        throw new Error(String(res.status));
      }
      const data = (await res.json()) as {
        comments?: unknown;
        commentCount?: unknown;
      };
      const list = Array.isArray(data?.comments)
        ? (data.comments as CommentItem[])
        : [];
      setComments(list);
      const count =
        typeof data?.commentCount === "number"
          ? data.commentCount
          : list.length;
      onCountRef.current?.(count);
    } catch {
      setLoadError(t("commentLoadError"));
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId, t]);

  useEffect(() => {
    if (!postId) {
      setComments([]);
      return;
    }
    let cancelled = false;
    (async () => {
      await loadAll();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [postId, loadAll]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/profile", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.userName) return;
        setViewerUserName(String(data.userName));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!postId || submitting) return;
    const trimmed = body.trim();
    if (!trimmed) {
      alert(t("commentEmptyError"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await createPostComment(
        postId,
        trimmed,
        replyTarget?.id,
      );
      const newComment = res.data?.comment as CommentItem | undefined;
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
      } else {
        await loadAll();
      }
      setBody("");
      setReplyTarget(null);
      if (typeof res.data?.commentCount === "number") {
        onCountRef.current?.(res.data.commentCount);
      }
    } catch (error: unknown) {
      const msg =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } })
          .response?.data?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : t("commentSendError");
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!postId) {
    return null;
  }

  const tree = buildCommentTree(comments);

  return (
    <div className="w-full pb-4 pt-2 block">
      {replyTarget && (
        <div className="mb-2 flex items-center justify-between gap-2 rounded border border-58b4d1/40 bg-sky-50 px-3 py-2 text-xs">
          <span>
            {t("commentReplyingTo")}{" "}
            <Link
              href={`/${replyTarget.userName}`}
              className="font-bold text-58b4d1"
            >
              @{replyTarget.userName}
            </Link>
          </span>
          <button
            type="button"
            className="flex items-center gap-1 font-bold text-343a40"
            onClick={() => setReplyTarget(null)}
          >
            <IconX size={14} />
            {t("commentCancelReply")}
          </button>
        </div>
      )}
      <div className="grid grid-cols-12 w-full -mb-2 relative">
        <div className="col-span-12">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("comment")}
            disabled={submitting}
            className="w-full border text-xs p-4 outline-58b4d1 rounded disabled:opacity-60"
            rows={3}
          />
        </div>
        <div className="flex justify-center items-center absolute right-4 top-5">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleSubmit()}
            className="disabled:opacity-50"
            title={t("commentSend")}
          >
            <IconCornerDownRight size={24} stroke={0.5} />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 px-1 pb-2">{t("commentLoginHint")}</p>
      {loadError && (
        <p className="text-xs text-red-600 px-1 pb-2">{loadError}</p>
      )}
      {loading && !loadError && (
        <p className="text-xs text-gray-500 px-1 py-2">{t("commentLoading")}</p>
      )}
      <div className="max-h-[420px] overflow-y-auto border-t border-gray-100">
        {tree.map((node) => (
          <PostCommentRow
            key={node.id}
            node={node}
            depth={0}
            viewerUserName={viewerUserName}
            postId={postId}
            onThreadChanged={() => void loadAll()}
            onReply={setReplyTarget}
          />
        ))}
        {!loading && comments.length === 0 && !loadError && (
          <p className="text-xs text-gray-500 p-4 text-center">
            {t("commentNoneYet")}
          </p>
        )}
      </div>
    </div>
  );
}

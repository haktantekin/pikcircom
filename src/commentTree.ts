export interface CommentItem {
  id: string;
  content: string;
  userName: string;
  displayName?: string;
  profileImage?: string;
  createDate: string;
  parentId?: string;
}

export type CommentTreeNode = CommentItem & { children: CommentTreeNode[] };

export function buildCommentTree(flat: CommentItem[]): CommentTreeNode[] {
  const sorted = [...flat].sort(
    (a, b) =>
      new Date(a.createDate).getTime() - new Date(b.createDate).getTime(),
  );
  const map = new Map<string, CommentTreeNode>();
  sorted.forEach((c) => {
    map.set(c.id, { ...c, children: [] });
  });
  const roots: CommentTreeNode[] = [];
  sorted.forEach((c) => {
    const node = map.get(c.id);
    if (!node) return;
    const pid = (c.parentId ?? "").trim();
    if (pid && map.has(pid)) {
      map.get(pid)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

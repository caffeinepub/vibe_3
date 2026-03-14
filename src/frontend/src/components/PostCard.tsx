import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { ChevronDown, Heart, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Post } from "../backend.d";
import { useAddComment, useLikePost } from "../hooks/useQueries";
import { relativeTime } from "../utils/time";

interface PostCardProps {
  post: Post;
  index: number;
  currentPrincipal?: Principal;
  onAuthorPress?: (principal: Principal) => void;
}

export default function PostCard({
  post,
  index,
  currentPrincipal,
  onAuthorPress,
}: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const likePost = useLikePost();
  const addComment = useAddComment();

  const isLiked = currentPrincipal
    ? post.likes.some((p) => p.toString() === currentPrincipal.toString())
    : false;

  const handleLike = async () => {
    try {
      await likePost.mutateAsync(post.id);
    } catch {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({ postId: post.id, text: commentText });
      setCommentText("");
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      data-ocid={`feed.post.item.${index + 1}`}
      className="bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => onAuthorPress?.(post.author)}
            className={cn(
              "flex items-center gap-3 flex-1 min-w-0 text-left",
              onAuthorPress ? "cursor-pointer" : "cursor-default",
            )}
            disabled={!onAuthorPress}
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="gradient-primary text-white font-bold text-sm">
                {post.authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">
                {post.authorName}
              </p>
              <p className="text-xs text-muted-foreground">
                {relativeTime(post.timestamp)}
              </p>
            </div>
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            data-ocid={`feed.like.button.${index + 1}`}
            onClick={handleLike}
            disabled={likePost.isPending}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              isLiked
                ? "text-primary"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            <Heart
              className={cn(
                "w-4 h-4",
                isLiked &&
                  "fill-current drop-shadow-[0_0_4px_oklch(0.68_0.24_315)]",
              )}
            />
            <span>{post.likes.length}</span>
          </button>

          <button
            type="button"
            data-ocid={`feed.comment.toggle.${index + 1}`}
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                commentsOpen && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-4 space-y-3">
              {post.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No comments yet. Be first!
                </p>
              ) : (
                post.comments.map((c, i) => (
                  <div
                    key={`${c.author.toString()}-${c.timestamp.toString()}-${i}`}
                    className="flex gap-2"
                  >
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-secondary text-foreground">
                        {c.authorName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-secondary rounded-xl px-3 py-2">
                      <p className="text-xs font-semibold text-foreground">
                        {c.authorName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {/* Comment form */}
              <form onSubmit={handleComment} className="flex gap-2 pt-1">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!commentText.trim() || addComment.isPending}
                  className="rounded-full gradient-primary border-0 text-white"
                >
                  Post
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

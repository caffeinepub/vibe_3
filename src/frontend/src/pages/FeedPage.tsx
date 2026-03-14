import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { RefreshCw, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import { useGetPosts } from "../hooks/useQueries";

interface FeedPageProps {
  onAuthorPress?: (principal: Principal) => void;
}

export default function FeedPage({ onAuthorPress }: FeedPageProps) {
  const { data: posts, isLoading, refetch, isFetching } = useGetPosts();
  const { principal } = useAuth();

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">
            vibe
          </h1>
          <p className="text-xs text-muted-foreground">What's happening</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-full"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div data-ocid="feed.loading_state" className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border p-4 space-y-3"
            >
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!posts || posts.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          data-ocid="feed.empty_state"
          className="text-center py-20"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-4 flex items-center justify-center glow-primary">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">
            Be the first to post!
          </h3>
          <p className="text-muted-foreground text-sm">
            The feed is empty. Drop a vibe and own this space. ✨
          </p>
        </motion.div>
      )}

      {/* Posts */}
      {!isLoading && posts && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <PostCard
              key={post.id.toString()}
              post={post}
              index={i}
              currentPrincipal={principal}
              onAuthorPress={onAuthorPress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

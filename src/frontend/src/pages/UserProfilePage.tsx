import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  Grid3X3,
  List,
  Lock,
  MessageSquare,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import { useGetPostsByUser, useGetUserProfile } from "../hooks/useQueries";

interface UserProfilePageProps {
  principal: Principal;
  onBack: () => void;
  onMessage?: (principal: Principal, name: string) => void;
}

// ── Bio renderer — colorises #hashtags ────────────────────────────────────────
function BioText({ text }: { text: string }) {
  const parts = text.split(/(#[\w]+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("#") ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split result
          <span key={`h-${i}`} className="text-primary font-semibold">
            {part}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split result
          <span key={`t-${i}`}>{part}</span>
        ),
      )}
    </span>
  );
}

// ── Stat column ───────────────────────────────────────────────────────────────
function StatCol({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold font-display text-primary">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Grid tile ─────────────────────────────────────────────────────────────────
const TILE_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.45 0.22 285), oklch(0.35 0.18 300))",
  "linear-gradient(135deg, oklch(0.42 0.20 295), oklch(0.38 0.24 270))",
  "linear-gradient(135deg, oklch(0.50 0.18 270), oklch(0.40 0.22 290))",
  "linear-gradient(135deg, oklch(0.38 0.26 305), oklch(0.45 0.20 280))",
  "linear-gradient(135deg, oklch(0.44 0.24 275), oklch(0.36 0.20 310))",
  "linear-gradient(135deg, oklch(0.48 0.22 260), oklch(0.42 0.26 295))",
];

function GridTile({ text, index }: { text: string; index: number }) {
  const gradient = TILE_GRADIENTS[index % TILE_GRADIENTS.length];
  return (
    <div
      className="aspect-square rounded-xl overflow-hidden flex items-center justify-center p-2"
      style={{ background: gradient }}
    >
      <p className="text-white text-xs leading-snug text-center line-clamp-4 font-medium">
        {text}
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserProfilePage({
  principal,
  onBack,
  onMessage,
}: UserProfilePageProps) {
  const { principal: currentPrincipal } = useAuth();
  const { data: profile, isLoading: profileLoading } =
    useGetUserProfile(principal);
  const { data: posts, isLoading: postsLoading } = useGetPostsByUser(principal);

  const [isFollowing, setIsFollowing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const name = profile?.displayName ?? "";
  const bio = profile?.bio ?? "";
  const isPrivate = profile?.isPrivate ?? false;
  const postCount = posts?.length ?? 0;
  const handle = name ? name.toLowerCase().replace(/\s+/g, "") : "user";

  const handleFollow = () => {
    setIsFollowing((prev) => !prev);
    toast.success(
      isFollowing ? `Unfollowed @${handle}` : `Following @${handle}! 🎉`,
    );
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage(principal, name);
    } else {
      toast("Open messages to chat! 💬");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
      {/* ── Back button ── */}
      <header className="flex items-center gap-3 mb-6">
        <button
          type="button"
          data-ocid="user_profile.back.button"
          onClick={onBack}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display text-lg font-bold text-foreground">
          {profileLoading ? "Loading…" : name || "Profile"}
        </h1>
      </header>

      {/* ── Profile block ── */}
      {profileLoading ? (
        <div
          data-ocid="user_profile.loading_state"
          className="flex flex-col items-center gap-4 py-10"
        >
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-52" />
          <div className="flex gap-3 w-full">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 flex-1 rounded-xl" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center"
        >
          {/* Avatar with violet gradient ring */}
          <div
            className="relative mb-4"
            style={{
              padding: 3,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, oklch(0.72 0.28 285), oklch(0.62 0.26 300), oklch(0.58 0.22 260))",
            }}
          >
            <div
              className="rounded-full"
              style={{
                padding: 2,
                background: "var(--background)",
                borderRadius: "50%",
              }}
            >
              <Avatar className="w-24 h-24">
                <AvatarFallback
                  className="text-white font-bold text-3xl"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.68 0.24 285), oklch(0.58 0.26 300))",
                  }}
                >
                  {name ? name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Name + handle */}
          <h2 className="font-display text-xl font-bold text-foreground">
            {name || "Unknown User"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">
            @{handle}
            {isPrivate && (
              <span className="inline-flex items-center gap-0.5 ml-1.5 text-primary">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            )}
          </p>

          {/* ── Stats row ── */}
          <div
            data-ocid="user_profile.stats.row"
            className="w-full flex items-center justify-around bg-card border border-border rounded-2xl px-4 py-4 mb-5"
          >
            <StatCol value={postCount} label="Posts" />
            <div className="w-px h-8 bg-border" />
            <StatCol value={0} label="Followers" />
            <div className="w-px h-8 bg-border" />
            <StatCol value={0} label="Following" />
          </div>

          {/* ── Bio ── */}
          {bio ? (
            <div className="w-full mb-5 text-sm text-foreground/90 text-center leading-relaxed">
              <BioText text={bio} />
            </div>
          ) : null}

          {/* ── Action buttons ── */}
          <div className="w-full flex gap-3 mb-6">
            <Button
              data-ocid="user_profile.follow.button"
              onClick={handleFollow}
              className="flex-1 rounded-xl gap-2 font-semibold border-0 text-white"
              style={{
                background: isFollowing
                  ? "oklch(0.25 0.05 285)"
                  : "linear-gradient(135deg, oklch(0.62 0.26 285), oklch(0.55 0.28 305))",
                boxShadow: isFollowing
                  ? "none"
                  : "0 2px 14px oklch(0.62 0.26 285 / 0.4)",
              }}
            >
              {isFollowing ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button
              data-ocid="user_profile.message.button"
              onClick={handleMessage}
              variant="outline"
              className="flex-1 rounded-xl gap-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Private account gate ── */}
      {!profileLoading && isPrivate && (
        <motion.div
          data-ocid="user_profile.private.section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.25 0.08 285), oklch(0.22 0.06 300))",
            }}
          >
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-display font-bold text-lg text-foreground">
            This account is private
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Follow this account to see their posts and vibes.
          </p>
        </motion.div>
      )}

      {/* ── Posts section (public accounts) ── */}
      {!profileLoading && !isPrivate && (
        <section data-ocid="user_profile.posts.section">
          {/* Grid / List toggle */}
          <div className="flex items-center gap-3 mb-4">
            <Separator className="flex-1" />
            <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
              <button
                type="button"
                data-ocid="user_profile.grid.toggle"
                onClick={() => setViewMode("grid")}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                data-ocid="user_profile.list.toggle"
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Separator className="flex-1" />
          </div>

          {/* Loading skeletons */}
          {postsLoading && (
            <div data-ocid="user_profile.loading_state">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!postsLoading && (!posts || posts.length === 0) && (
            <div
              data-ocid="user_profile.empty_state"
              className="text-center py-14"
            >
              <p className="text-3xl mb-3">✨</p>
              <p className="text-sm font-medium text-foreground">
                No posts yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This user hasn't posted any vibes yet.
              </p>
            </div>
          )}

          {/* Grid view */}
          {!postsLoading &&
            posts &&
            posts.length > 0 &&
            viewMode === "grid" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-3 gap-1.5"
              >
                {posts.map((post, i) => (
                  <GridTile
                    key={post.id.toString()}
                    text={post.content}
                    index={i}
                  />
                ))}
              </motion.div>
            )}

          {/* List view */}
          {!postsLoading &&
            posts &&
            posts.length > 0 &&
            viewMode === "list" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {posts.map((post, i) => (
                  <PostCard
                    key={post.id.toString()}
                    post={post}
                    index={i}
                    currentPrincipal={currentPrincipal}
                  />
                ))}
              </motion.div>
            )}
        </section>
      )}
    </div>
  );
}

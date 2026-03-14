import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Clapperboard, Lock, Share2, UserPen, Video } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import PostCard from "../components/PostCard";
import { useAuth } from "../hooks/useAuth";
import {
  useGetMyProfile,
  useGetPostsByUser,
  useSetProfile,
} from "../hooks/useQueries";

// ── Reel Dialog ────────────────────────────────────────────────────────────────
function ReelDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCaption("");
      setVideoFile(null);
    }, 300);
  };

  const handleSubmit = () => {
    toast.success("Reels coming soon! Stay tuned. 🎬");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="reel.dialog"
        className="max-w-lg rounded-2xl border-border bg-card p-0 overflow-hidden"
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, #f9a825, #fd5949, #d6249f, #285AEB)",
          }}
        />
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-xl">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(45deg, #f9a825, #fd5949, #d6249f, #285AEB)",
                }}
              >
                <Clapperboard className="w-4 h-4 text-white" />
              </div>
              Create a Reel
            </DialogTitle>
          </DialogHeader>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setVideoFile(file);
            }}
            data-ocid="reel.upload_button"
          />

          <button
            type="button"
            data-ocid="reel.dropzone"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Video className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Drop a short video here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, MOV, or WebM · max 60 seconds
              </p>
            </div>
          </button>

          {videoFile && (
            <p className="text-xs text-muted-foreground text-center -mt-2">
              Selected:{" "}
              <span className="font-medium text-foreground">
                {videoFile.name}
              </span>
            </p>
          )}

          <Textarea
            data-ocid="reel.caption.textarea"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption…"
            className="min-h-20 bg-secondary border-border rounded-xl resize-none text-sm"
          />

          <Button
            data-ocid="reel.submit.button"
            onClick={handleSubmit}
            className="w-full border-0 text-white font-bold rounded-2xl py-5"
            style={{
              background:
                "linear-gradient(45deg, #f9a825, #fd5949, #d6249f, #285AEB)",
              boxShadow:
                "0 4px 20px rgba(214, 36, 159, 0.35), 0 2px 8px rgba(253, 89, 73, 0.25)",
            }}
          >
            <span className="flex items-center gap-2">
              <Clapperboard className="w-4 h-4" />
              Post Reel
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Bio renderer — colorises #hashtags ────────────────────────────────────────
function BioText({ text }: { text: string }) {
  const parts = text.split(/(#[\w]+)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("#") ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split result, no reorder
          <span key={`h-${i}`} className="text-primary font-semibold">
            {part}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: static split result, no reorder
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

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { principal, logout, isAuthenticated } = useAuth();
  const { data: profile, isLoading: profileLoading } = useGetMyProfile();
  const { data: myPosts, isLoading: postsLoading } = useGetPostsByUser(
    isAuthenticated ? principal : undefined,
  );
  const setProfile = useSetProfile();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);

  const hasProfile = profile !== null && profile !== undefined;
  const name = hasProfile ? profile!.displayName : "";
  const bio = hasProfile ? ((profile as any).bio ?? "") : "";
  const isPrivate = hasProfile ? ((profile as any).isPrivate ?? false) : false;

  const openEdit = () => {
    setEditName(name);
    setEditBio(bio);
    setEditPrivate(isPrivate);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handleSave = async () => {
    try {
      await setProfile.mutateAsync({
        displayName: editName.trim() || name,
        avatarUrl: "",
        bio: editBio.trim(),
        isPrivate: editPrivate,
      });
      toast.success("Profile updated! ✨");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Profile link copied! 🔗"))
      .catch(() => toast.error("Could not copy link"));
  };

  const postCount = myPosts?.length ?? 0;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* ── Header ── */}
      <header
        data-ocid="profile.header"
        className="flex items-center justify-between mb-8"
      >
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          vibe.
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-muted-foreground hover:text-destructive gap-1 rounded-xl text-xs"
        >
          Sign out
        </Button>
      </header>

      {/* ── Profile block ── */}
      {profileLoading ? (
        <div
          data-ocid="profile.loading_state"
          className="flex flex-col items-center gap-4 py-10"
        >
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* Avatar with violet gradient ring */}
          <div
            data-ocid="profile.avatar"
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
                background: "oklch(0.08 0.008 285)",
                borderRadius: "50%",
              }}
            >
              <Avatar className="w-20 h-20">
                <AvatarFallback
                  className="text-white font-bold text-2xl"
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
            {name || "Your Name"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-5">
            @{name ? name.toLowerCase().replace(/\s+/g, "") : "username"}
            {isPrivate && (
              <span className="inline-flex items-center gap-0.5 ml-1.5 text-primary">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            )}
          </p>

          {/* ── Stats row ── */}
          <div
            data-ocid="profile.stats.row"
            className="w-full flex items-center justify-around bg-card border border-border rounded-2xl px-4 py-4 mb-5"
          >
            <StatCol value={postCount} label="Posts" />
            <div className="w-px h-8 bg-border" />
            <StatCol value={0} label="Followers" />
            <div className="w-px h-8 bg-border" />
            <StatCol value={0} label="Following" />
          </div>

          {/* ── Bio ── */}
          <div
            data-ocid="profile.bio.section"
            className="w-full mb-5 text-sm text-foreground/90 text-center leading-relaxed min-h-5"
          >
            {bio ? (
              <BioText text={bio} />
            ) : (
              <span className="text-muted-foreground italic">No bio yet</span>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="w-full flex gap-3 mb-4">
            <Button
              data-ocid="profile.edit_profile.button"
              variant="outline"
              className="flex-1 rounded-xl gap-2 border-primary/60 text-primary hover:bg-primary/10 hover:border-primary font-semibold"
              onClick={openEdit}
            >
              <UserPen className="w-4 h-4" />
              Edit Profile
            </Button>
            <Button
              data-ocid="profile.share_profile.button"
              variant="outline"
              className="flex-1 rounded-xl gap-2 border-primary/60 text-primary hover:bg-primary/10 hover:border-primary font-semibold"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </Button>
          </div>

          {/* ── Inline Edit Panel ── */}
          <AnimatePresence>
            {editing && (
              <motion.div
                data-ocid="profile.edit.panel"
                key="edit-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28 }}
                className="w-full overflow-hidden"
              >
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Edit Profile
                  </p>

                  {/* Display name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Display name
                    </Label>
                    <Input
                      data-ocid="profile.name.input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-secondary border-border rounded-xl"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Bio</Label>
                    <Textarea
                      data-ocid="profile.bio.textarea"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Write a bio… add #hashtags to style them"
                      className="bg-secondary border-border rounded-xl resize-none min-h-20 text-sm"
                    />
                  </div>

                  {/* Privacy toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Private account
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Only approved followers can see your posts
                      </p>
                    </div>
                    <Switch
                      data-ocid="profile.privacy.switch"
                      checked={editPrivate}
                      onCheckedChange={setEditPrivate}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-3 pt-1">
                    <Button
                      data-ocid="profile.save.button"
                      onClick={handleSave}
                      disabled={setProfile.isPending}
                      className="flex-1 rounded-xl text-white border-0 font-semibold"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.68 0.24 285), oklch(0.62 0.26 300))",
                        boxShadow: "0 2px 12px oklch(0.62 0.26 300 / 0.4)",
                      }}
                    >
                      {setProfile.isPending ? (
                        <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                    <Button
                      data-ocid="profile.cancel.button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="flex-1 rounded-xl border-border text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Create Reel button — keep original gradient ── */}
      <Button
        data-ocid="profile.create_reel.button"
        onClick={() => setReelOpen(true)}
        className="w-full border-0 text-white rounded-2xl gap-2 mb-6 h-11 font-semibold"
        style={{
          background:
            "linear-gradient(45deg, #f9a825, #fd5949, #d6249f, #285AEB)",
          boxShadow:
            "0 4px 20px rgba(214, 36, 159, 0.45), 0 2px 8px rgba(253, 89, 73, 0.3)",
        }}
      >
        <Clapperboard className="w-5 h-5" />
        Create Reel
      </Button>

      <ReelDialog open={reelOpen} onOpenChange={setReelOpen} />

      {/* ── Posts ── */}
      <section data-ocid="profile.posts.section">
        <div className="flex items-center gap-3 mb-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
            Posts
          </span>
          <Separator className="flex-1" />
        </div>

        {postsLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-4"
              >
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {!postsLoading && (!myPosts || myPosts.length === 0) && (
          <div data-ocid="profile.empty_state" className="text-center py-14">
            <p className="text-3xl mb-3">✨</p>
            <p className="text-sm font-medium text-foreground">No posts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Head to Create and drop your first vibe!
            </p>
          </div>
        )}

        {!postsLoading && myPosts && myPosts.length > 0 && (
          <div className="space-y-4">
            {myPosts.map((post, i) => (
              <PostCard
                key={post.id.toString()}
                post={post}
                index={i}
                currentPrincipal={principal}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

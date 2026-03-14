import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  RefreshCw,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PostOption } from "../backend.d";
import { useCreatePost, useGeneratePostOptions } from "../hooks/useQueries";

type Step = "input" | "pick" | "edit";

const styleConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  short: { icon: Zap, label: "Short & Punchy", color: "oklch(0.68 0.24 315)" },
  story: {
    icon: BookOpen,
    label: "Story-Driven",
    color: "oklch(0.74 0.19 205)",
  },
  question: {
    icon: HelpCircle,
    label: "Question-Based",
    color: "oklch(0.72 0.20 145)",
  },
  "Short & Punchy": {
    icon: Zap,
    label: "Short & Punchy",
    color: "oklch(0.68 0.24 315)",
  },
  "Story-Driven": {
    icon: BookOpen,
    label: "Story-Driven",
    color: "oklch(0.74 0.19 205)",
  },
  "Question-Based": {
    icon: HelpCircle,
    label: "Question-Based",
    color: "oklch(0.72 0.20 145)",
  },
};

function getStyleConfig(style: string) {
  return (
    styleConfig[style] ||
    styleConfig[style.toLowerCase()] || {
      icon: Sparkles,
      label: style,
      color: "oklch(0.68 0.24 315)",
    }
  );
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>("input");
  const [rawThought, setRawThought] = useState("");
  const [options, setOptions] = useState<PostOption[]>([]);
  const [editContent, setEditContent] = useState("");

  const generateOptions = useGeneratePostOptions();
  const createPost = useCreatePost();

  const handleGenerate = async () => {
    if (!rawThought.trim()) return;
    try {
      const result = await generateOptions.mutateAsync(rawThought);
      setOptions(result);
      setStep("pick");
    } catch {
      toast.error("Couldn't generate options. Try again!");
    }
  };

  const handlePostDirect = async () => {
    if (!rawThought.trim()) return;
    try {
      await createPost.mutateAsync(rawThought);
      toast.success("Vibe posted! 🔥");
      setStep("input");
      setRawThought("");
      setOptions([]);
      setEditContent("");
    } catch {
      toast.error("Failed to publish. Try again!");
    }
  };

  const handleSelectOption = (content: string) => {
    setEditContent(content);
    setStep("edit");
  };

  const handlePublish = async () => {
    if (!editContent.trim()) return;
    try {
      await createPost.mutateAsync(editContent);
      toast.success("Vibe posted! 🔥");
      setStep("input");
      setRawThought("");
      setOptions([]);
      setEditContent("");
    } catch {
      toast.error("Failed to publish. Try again!");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        {step !== "input" && (
          <button
            type="button"
            onClick={() => setStep(step === "edit" ? "pick" : "input")}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            {step === "input" && "Create a Post"}
            {step === "pick" && "Pick Your Vibe"}
            {step === "edit" && "Edit & Publish"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {step === "input" && "Let AI craft three styled options for you"}
            {step === "pick" && "Choose the style that hits right"}
            {step === "edit" && "Make it yours, then drop it"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="relative">
              <Textarea
                data-ocid="create.input.textarea"
                value={rawThought}
                onChange={(e) => setRawThought(e.target.value)}
                placeholder="What's on your mind? Dump your raw thoughts here — AI will make them sparkle ✨"
                className="min-h-40 bg-card border-border text-foreground placeholder:text-muted-foreground rounded-2xl text-base resize-none focus:ring-1 focus:ring-ring p-4"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/50">
                {rawThought.length} chars
              </div>
            </div>

            <Button
              data-ocid="create.generate.button"
              onClick={handleGenerate}
              disabled={
                !rawThought.trim() ||
                generateOptions.isPending ||
                createPost.isPending
              }
              className="w-full gradient-primary glow-primary border-0 text-white font-semibold py-6 rounded-2xl text-base"
            >
              {generateOptions.isPending ? (
                <span className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Generating your vibes...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Options
                </span>
              )}
            </Button>

            <Button
              data-ocid="create.post.button"
              variant="outline"
              onClick={handlePostDirect}
              disabled={
                !rawThought.trim() ||
                createPost.isPending ||
                generateOptions.isPending
              }
              className="w-full py-5 rounded-2xl text-base font-semibold border-border hover:bg-secondary/60 transition-colors"
            >
              {createPost.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                  Posting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Post
                </span>
              )}
            </Button>

            {/* Tip */}
            <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="text-primary font-semibold">Pro tip:</span> The
                more specific you are, the better the vibes. Describe a moment,
                a feeling, or a photo you want to caption.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Pick */}
        {step === "pick" && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {options.map((option, i) => {
              const config = getStyleConfig(option.style);
              const Icon = config.icon;
              const ocidIndex = (i + 1) as 1 | 2 | 3;
              return (
                <motion.div
                  key={option.style}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`create.option.item.${ocidIndex}`}
                  className="gradient-border bg-card rounded-2xl p-5 space-y-3 hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${config.color}20`,
                        border: `1px solid ${config.color}40`,
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: config.color }}
                      />
                    </div>
                    <Badge
                      className="text-xs font-semibold border"
                      style={{
                        background: `${config.color}15`,
                        color: config.color,
                        borderColor: `${config.color}30`,
                      }}
                    >
                      {config.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">
                    {option.content}
                  </p>

                  <Button
                    data-ocid={`create.use_option.button.${ocidIndex}`}
                    onClick={() => handleSelectOption(option.content)}
                    size="sm"
                    className="w-full rounded-xl border-0 font-semibold"
                    style={{
                      background: `${config.color}20`,
                      color: config.color,
                      border: `1px solid ${config.color}30`,
                    }}
                  >
                    Use This ✓
                  </Button>
                </motion.div>
              );
            })}

            <Button
              variant="ghost"
              onClick={() => setStep("input")}
              className="w-full rounded-xl text-muted-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </motion.div>
        )}

        {/* Step 3: Edit & Publish */}
        {step === "edit" && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="relative gradient-border bg-card rounded-2xl p-1">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-48 bg-transparent border-0 text-foreground text-base resize-none focus:ring-0 focus-visible:ring-0 p-3 shadow-none"
              />
              <div className="px-3 pb-2 text-xs text-muted-foreground/50 text-right">
                {editContent.length} chars
              </div>
            </div>

            <Button
              data-ocid="create.publish.button"
              onClick={handlePublish}
              disabled={!editContent.trim() || createPost.isPending}
              className="w-full gradient-primary glow-primary border-0 text-white font-bold py-6 rounded-2xl text-base"
            >
              {createPost.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Publish to Feed 🔥
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Feel free to edit the content above before publishing
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

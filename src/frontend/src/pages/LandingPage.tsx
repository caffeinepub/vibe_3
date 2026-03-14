import { Button } from "@/components/ui/button";
import { MessageCircle, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export default function LandingPage({
  onLogin,
  isLoggingIn,
}: LandingPageProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Hero background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/vibe-hero-bg.dim_1400x800.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-background/70" />

      {/* Floating gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "oklch(0.68 0.24 315)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "oklch(0.74 0.19 205)" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-8 w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center glow-primary"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="font-display text-7xl font-bold tracking-tight mb-3"
        >
          <span className="gradient-text">vibe</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-xl text-muted-foreground mb-3 font-body"
        >
          Turn raw thoughts into posts that hit different.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-base text-muted-foreground/70 mb-12 max-w-md font-body"
        >
          AI-powered post crafting. Three styles, zero cringe. Real
          conversations with real people.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {[
            { icon: Sparkles, label: "AI Post Generator" },
            { icon: Zap, label: "3 Vibe Styles" },
            { icon: MessageCircle, label: "Direct Messages" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur text-sm text-muted-foreground"
            >
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.4, type: "spring" }}
        >
          <Button
            size="lg"
            onClick={onLogin}
            disabled={isLoggingIn}
            className="gradient-primary glow-primary text-white font-semibold px-10 py-6 text-lg rounded-2xl border-0 hover:opacity-90 transition-opacity"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </span>
            ) : (
              "Get Started — Sign In"
            )}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-xs text-muted-foreground/50"
        >
          Powered by Internet Identity — no passwords, no email
        </motion.p>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-center text-xs text-muted-foreground/40"
      >
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </motion.footer>
    </div>
  );
}

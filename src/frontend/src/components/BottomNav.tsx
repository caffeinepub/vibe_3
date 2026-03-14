import { cn } from "@/lib/utils";
import { Home, MessageCircle, PlusSquare, User } from "lucide-react";
import { motion } from "motion/react";

export type Page = "feed" | "create" | "messages" | "profile";

const tabs: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "feed", label: "Feed", icon: Home },
  { id: "create", label: "Create", icon: PlusSquare },
  { id: "messages", label: "Messages", icon: MessageCircle },
  { id: "profile", label: "Profile", icon: User },
];

const ocidMap: Record<Page, string> = {
  feed: "nav.feed.tab",
  create: "nav.create.tab",
  messages: "nav.messages.tab",
  profile: "nav.profile.tab",
};

interface BottomNavProps {
  current: Page;
  onChange: (page: Page) => void;
}

export default function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = current === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={ocidMap[tab.id]}
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors relative",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full gradient-primary"
                />
              )}
              <Icon
                className={cn(
                  "w-5 h-5",
                  active && "drop-shadow-[0_0_6px_oklch(0.68_0.24_315)]",
                )}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

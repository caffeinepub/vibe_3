import { Toaster } from "@/components/ui/sonner";
import type { Principal } from "@icp-sdk/core/principal";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import BottomNav, { type Page } from "./components/BottomNav";
import { useAuth } from "./hooks/useAuth";
import CreatePage from "./pages/CreatePage";
import FeedPage from "./pages/FeedPage";
import LandingPage from "./pages/LandingPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";

export default function App() {
  const { isAuthenticated, isInitializing, login, isLoggingIn } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("feed");
  const [viewingUser, setViewingUser] = useState<Principal | null>(null);
  const [openMessageWith, setOpenMessageWith] = useState<{
    principal: Principal;
    name: string;
  } | null>(null);

  // Update page title
  useEffect(() => {
    document.title = "vibe — posts that hit different";
  }, []);

  // Clear openMessageWith after MessagesPage has consumed it
  useEffect(() => {
    if (openMessageWith && currentPage === "messages") {
      const t = setTimeout(() => setOpenMessageWith(null), 500);
      return () => clearTimeout(t);
    }
  }, [openMessageWith, currentPage]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  const initialConv = openMessageWith
    ? {
        otherUser: openMessageWith.principal,
        otherUserName:
          openMessageWith.name ||
          `${openMessageWith.principal.toString().slice(0, 8)}...`,
        lastMessage: "",
        lastTimestamp: 0n,
      }
    : undefined;

  // Viewing another user's profile
  if (viewingUser) {
    return (
      <div className="min-h-screen bg-background">
        <AnimatePresence mode="wait">
          <motion.main
            key="user-profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen"
          >
            <UserProfilePage
              principal={viewingUser}
              onBack={() => setViewingUser(null)}
              onMessage={(p, name) => {
                setViewingUser(null);
                setOpenMessageWith({ principal: p, name });
                setCurrentPage("messages");
              }}
            />
          </motion.main>
        </AnimatePresence>
        <Toaster />
      </div>
    );
  }

  const pageComponents: Record<Page, React.ReactNode> = {
    feed: <FeedPage onAuthorPress={(p) => setViewingUser(p)} />,
    create: <CreatePage />,
    messages: <MessagesPage initialConversation={initialConv} />,
    profile: <ProfilePage />,
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen"
        >
          {pageComponents[currentPage]}
        </motion.main>
      </AnimatePresence>

      <BottomNav current={currentPage} onChange={setCurrentPage} />
      <Toaster />
    </div>
  );
}

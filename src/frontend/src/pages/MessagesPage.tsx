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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import {
  ArrowLeft,
  MessageCircle,
  MessageSquarePlus,
  Mic,
  Moon,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Sun,
  UserPlus,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ConversationSummary } from "../backend.d";
import { useAuth } from "../hooks/useAuth";
import {
  useGetConversations,
  useGetMessages,
  useSendMessage,
} from "../hooks/useQueries";
import { relativeTime } from "../utils/time";

type Theme = "dark" | "light";

const themes = {
  dark: {
    chatBg: "#0B1014",
    header: "#1F2C34",
    received: "#1F2C34",
    inputBar: "#1F2C34",
    inputBg: "#1F2C34",
    divider: "#2A3942",
    rowHover: "#1A2530",
    avatarBg: "#2A3942",
    text: "#FFFFFF",
    muted: "#8696A0",
    encryptedPill: "#1F2C34",
    sentBubble: "#25D366",
    sentText: "#FFFFFF",
    receivedText: "#FFFFFF",
    dialogBg: "#1F2C34",
    inputField: "#2A3942",
    skeletonBg: "#2A3942",
    searchIconColor: "#8696A0",
    headerText: "#FFFFFF",
    fabBg: "#25D366",
    onlineColor: "#25D366",
  },
  light: {
    chatBg: "#F0F2F5",
    header: "#008069",
    received: "#FFFFFF",
    inputBar: "#F0F2F5",
    inputBg: "#FFFFFF",
    divider: "#E9EDEF",
    rowHover: "#F5F6F6",
    avatarBg: "#DFE5E7",
    text: "#111B21",
    muted: "#667781",
    encryptedPill: "#D9FDD3",
    sentBubble: "#D9FDD3",
    sentText: "#111B21",
    receivedText: "#111B21",
    dialogBg: "#FFFFFF",
    inputField: "#FFFFFF",
    skeletonBg: "#DFE5E7",
    searchIconColor: "#FFFFFF",
    headerText: "#FFFFFF",
    fabBg: "#25D366",
    onlineColor: "#25D366",
  },
};

function NewContactDialog({
  open,
  onOpenChange,
  onStart,
  theme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStart: (principal: string, name: string) => void;
  theme: Theme;
}) {
  const [newPrincipal, setNewPrincipal] = useState("");
  const [newName, setNewName] = useState("");
  const t = themes[theme];

  const handleStart = () => {
    if (!newPrincipal.trim()) return;
    onStart(newPrincipal.trim(), newName.trim());
    setNewPrincipal("");
    setNewName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-border rounded-2xl mx-4"
        style={{ backgroundColor: t.dialogBg }}
      >
        <DialogHeader>
          <DialogTitle className="font-display" style={{ color: t.text }}>
            New Contact
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm" style={{ color: t.muted }}>
              Principal ID
            </Label>
            <Input
              data-ocid="messages.contact.input"
              value={newPrincipal}
              onChange={(e) => setNewPrincipal(e.target.value)}
              placeholder="aaaaa-aa..."
              className="rounded-xl placeholder:text-gray-500 border-0 focus-visible:ring-1"
              style={{ backgroundColor: t.inputField, color: t.text }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm" style={{ color: t.muted }}>
              Display name (optional)
            </Label>
            <Input
              data-ocid="messages.contact.name_input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Their name"
              className="rounded-xl placeholder:text-gray-500 border-0 focus-visible:ring-1"
              style={{ backgroundColor: t.inputField, color: t.text }}
            />
          </div>
          <Button
            data-ocid="messages.contact.submit_button"
            onClick={handleStart}
            disabled={!newPrincipal.trim()}
            className="w-full border-0 text-white rounded-xl font-semibold"
            style={{ backgroundColor: "#25D366" }}
          >
            Start Conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConversationList({
  onSelect,
  theme,
  onToggleTheme,
}: {
  onSelect: (conv: ConversationSummary) => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const { data: conversations, isLoading } = useGetConversations();
  const [newOpen, setNewOpen] = useState(false);
  const t = themes[theme];

  const handleStart = (principalStr: string, name: string) => {
    try {
      const principal = PrincipalClass.fromText(principalStr);
      onSelect({
        otherUser: principal,
        otherUserName: name || `${principalStr.slice(0, 8)}...`,
        lastMessage: "",
        lastTimestamp: 0n,
      });
      setNewOpen(false);
    } catch {
      toast.error("Invalid principal ID");
    }
  };

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: t.chatBg }}
    >
      {/* WhatsApp-style header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ backgroundColor: t.header }}
      >
        <h2
          className="font-display text-xl font-bold"
          style={{ color: t.headerText }}
        >
          Chats
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Search className="w-5 h-5" style={{ color: t.searchIconColor }} />
          </button>
          {/* Theme toggle */}
          <button
            type="button"
            data-ocid="messages.theme.toggle"
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" style={{ color: t.searchIconColor }} />
            ) : (
              <Moon className="w-5 h-5" style={{ color: t.searchIconColor }} />
            )}
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <MoreVertical
              className="w-5 h-5"
              style={{ color: t.searchIconColor }}
            />
          </button>
        </div>
      </div>

      <NewContactDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onStart={handleStart}
        theme={theme}
      />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div
            data-ocid="messages.loading_state"
            className="px-4 pt-4 space-y-0"
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-3 px-0 py-3 border-b"
                style={{ borderColor: t.divider }}
              >
                <Skeleton
                  className="w-12 h-12 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.skeletonBg }}
                />
                <div className="flex-1 space-y-2 py-1">
                  <div className="flex justify-between">
                    <Skeleton
                      className="h-3 w-28"
                      style={{ backgroundColor: t.skeletonBg }}
                    />
                    <Skeleton
                      className="h-3 w-12"
                      style={{ backgroundColor: t.skeletonBg }}
                    />
                  </div>
                  <Skeleton
                    className="h-3 w-40"
                    style={{ backgroundColor: t.skeletonBg }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!conversations || conversations.length === 0) && (
          <div
            data-ocid="messages.empty_state"
            className="flex flex-col items-center justify-center h-full py-24 px-6 text-center"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: t.header }}
            >
              <MessageCircle className="w-9 h-9" style={{ color: "#25D366" }} />
            </div>
            <h3
              className="font-display font-bold text-xl mb-2"
              style={{ color: t.text }}
            >
              No conversations yet
            </h3>
            <p className="text-sm mb-6" style={{ color: t.muted }}>
              Start chatting by adding a new contact
            </p>
            <Button
              data-ocid="messages.create_contact.button"
              className="border-0 text-white rounded-full gap-2 px-6 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: "#25D366" }}
              onClick={() => setNewOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              New Contact
            </Button>
          </div>
        )}

        {!isLoading && conversations && conversations.length > 0 && (
          <div>
            {conversations.map((conv, i) => (
              <motion.button
                type="button"
                key={conv.otherUser.toString()}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                data-ocid={`messages.conversation.item.${i + 1}`}
                onClick={() => onSelect(conv)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{
                  borderBottom: `1px solid ${t.divider}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    t.rowHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "transparent";
                }}
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarFallback
                    className="font-bold text-base"
                    style={{
                      backgroundColor: t.avatarBg,
                      color: t.text,
                    }}
                  >
                    {conv.otherUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: t.text }}
                    >
                      {conv.otherUserName}
                    </p>
                    {conv.lastTimestamp > 0n && (
                      <p className="text-xs" style={{ color: t.muted }}>
                        {relativeTime(conv.lastTimestamp)}
                      </p>
                    )}
                  </div>
                  <p
                    className="text-sm truncate mt-0.5"
                    style={{ color: t.muted }}
                  >
                    {conv.lastMessage || "Tap to start chatting"}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* FAB - WhatsApp style compose button */}
      <div className="absolute bottom-24 right-4">
        <motion.button
          type="button"
          data-ocid="messages.new.button"
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setNewOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{ backgroundColor: t.fabBg }}
        >
          <MessageSquarePlus className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
}

function ThreadView({
  conversation,
  onBack,
  myPrincipal,
  theme,
}: {
  conversation: ConversationSummary;
  onBack: () => void;
  myPrincipal?: Principal;
  theme: Theme;
}) {
  const [messageText, setMessageText] = useState("");
  const { data: messages } = useGetMessages(conversation.otherUser);
  const sendMessage = useSendMessage();
  const t = themes[theme];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const body = messageText;
    setMessageText("");
    try {
      await sendMessage.mutateAsync({
        recipient: conversation.otherUser,
        body,
      });
    } catch {
      toast.error("Failed to send message");
      setMessageText(body);
    }
  };

  const myId = myPrincipal?.toString();

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: t.chatBg }}
    >
      {/* WhatsApp-style thread header */}
      <div
        className="flex items-center gap-3 px-2 py-2 flex-shrink-0"
        style={{ backgroundColor: t.header }}
      >
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: t.headerText }} />
        </button>
        <Avatar className="w-9 h-9">
          <AvatarFallback
            className="font-bold text-sm"
            style={{
              backgroundColor: t.avatarBg,
              color: t.text,
            }}
          >
            {conversation.otherUserName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-sm leading-tight"
            style={{ color: t.headerText }}
          >
            {conversation.otherUserName}
          </p>
          <p
            className="text-xs font-medium"
            style={{
              color: theme === "dark" ? "#25D366" : "rgba(255,255,255,0.8)",
            }}
          >
            online
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Video className="w-5 h-5" style={{ color: t.searchIconColor }} />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <Phone className="w-5 h-5" style={{ color: t.searchIconColor }} />
          </button>
          <button
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <MoreVertical
              className="w-5 h-5"
              style={{ color: t.searchIconColor }}
            />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-1 pb-2">
          {!messages || messages.length === 0 ? (
            <div className="flex justify-center py-6">
              <span
                className="text-xs px-4 py-1.5 rounded-full"
                style={{
                  backgroundColor: t.encryptedPill,
                  color: t.muted,
                }}
              >
                Messages are end-to-end encrypted
              </span>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender.toString() === myId;
              return (
                <motion.div
                  key={msg.id.toString()}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.015 }}
                  className={cn("flex", isMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] px-3 py-2 text-sm relative",
                      isMe
                        ? "rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-sm"
                        : "rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-xl",
                    )}
                    style={{
                      backgroundColor: isMe ? t.sentBubble : t.received,
                      color: isMe ? t.sentText : t.receivedText,
                    }}
                  >
                    <p className="leading-relaxed">{msg.body}</p>
                    <p
                      className="text-xs mt-1 text-right"
                      style={{
                        color: isMe
                          ? theme === "dark"
                            ? "rgba(255,255,255,0.65)"
                            : "rgba(0,0,0,0.45)"
                          : t.muted,
                      }}
                    >
                      {relativeTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* WhatsApp-style input bar */}
      <div
        className="px-2 py-2 flex-shrink-0"
        style={{ backgroundColor: t.inputBar }}
      >
        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Input field */}
          <div
            className="flex-1 flex items-center gap-1 rounded-full px-3 py-1"
            style={{ backgroundColor: t.inputBg }}
          >
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 hover:bg-black/5 rounded-full transition-colors"
            >
              <Smile className="w-5 h-5" style={{ color: t.muted }} />
            </button>
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 hover:bg-black/5 rounded-full transition-colors"
            >
              <Paperclip className="w-5 h-5" style={{ color: t.muted }} />
            </button>
            <input
              data-ocid="messages.send.input"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Message"
              className="flex-1 bg-transparent text-sm placeholder:opacity-50 focus:outline-none py-2 px-1"
              style={{ color: t.text }}
            />
          </div>

          {/* Send / Mic button */}
          <AnimatePresence mode="wait">
            {messageText.trim() ? (
              <motion.button
                key="send"
                type="submit"
                data-ocid="messages.send.button"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                disabled={sendMessage.isPending}
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ backgroundColor: "#25D366" }}
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                type="button"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#25D366" }}
              >
                <Mic className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

interface MessagesPageProps {
  initialConversation?: ConversationSummary;
}

export default function MessagesPage({
  initialConversation,
}: MessagesPageProps) {
  const { principal } = useAuth();
  const [activeConversation, setActiveConversation] =
    useState<ConversationSummary | null>(null);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (initialConversation) {
      setActiveConversation(initialConversation);
    }
  }, [initialConversation]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {activeConversation ? (
          <motion.div
            key="thread"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.22 }}
          >
            <ThreadView
              conversation={activeConversation}
              onBack={() => setActiveConversation(null)}
              myPrincipal={principal}
              theme={theme}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
          >
            <ConversationList
              onSelect={setActiveConversation}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ConversationSummary,
  Message,
  Post,
  PostOption,
  Profile,
} from "../backend.d";
import { useActor } from "./useActor";

function useBackend() {
  const { actor, isFetching } = useActor();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { backend: actor as any, ready: !!actor && !isFetching };
}

export function useGetPosts() {
  const { backend, ready } = useBackend();
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!backend) return [];
      return backend.getPosts(0n, 20n);
    },
    enabled: ready,
  });
}

export function useGetPostsByUser(user: Principal | undefined) {
  const { backend, ready } = useBackend();
  return useQuery<Post[]>({
    queryKey: ["posts", "user", user?.toString()],
    queryFn: async () => {
      if (!backend || !user) return [];
      return backend.getPostsByUser(user);
    },
    enabled: ready && !!user,
  });
}

export function useGetMyProfile() {
  const { backend, ready } = useBackend();
  return useQuery<Profile | null>({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      if (!backend) return null;
      const result = await backend.getMyProfile();
      if (result && result.__kind__ === "Some") return result.value;
      if (result && result.__kind__ === undefined) return result;
      return null;
    },
    enabled: ready,
  });
}

export function useGetUserProfile(user: Principal | undefined) {
  const { backend, ready } = useBackend();
  return useQuery<Profile | null>({
    queryKey: ["profile", user?.toString()],
    queryFn: async () => {
      if (!backend || !user) return null;
      const result = await backend.getProfile(user);
      if (result && result.__kind__ === "Some") return result.value;
      if (result && result.__kind__ === undefined) return result;
      return null;
    },
    enabled: ready && !!user,
  });
}

export function useGetConversations() {
  const { backend, ready } = useBackend();
  return useQuery<ConversationSummary[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!backend) return [];
      return backend.getConversations();
    },
    enabled: ready,
    refetchInterval: 5000,
  });
}

export function useGetMessages(otherUser: Principal | null) {
  const { backend, ready } = useBackend();
  return useQuery<Message[]>({
    queryKey: ["messages", otherUser?.toString()],
    queryFn: async () => {
      if (!backend || !otherUser) return [];
      return backend.getMessages(otherUser);
    },
    enabled: ready && !!otherUser,
    refetchInterval: 3000,
  });
}

export function useCreatePost() {
  const { backend } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      return backend.createPost(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useLikePost() {
  const { backend } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      return backend.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddComment() {
  const { backend } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, text }: { postId: bigint; text: string }) => {
      return backend.addComment(postId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useSendMessage() {
  const { backend } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recipient,
      body,
    }: { recipient: Principal; body: string }) => {
      return backend.sendMessage(recipient, body);
    },
    onSuccess: (
      _data: unknown,
      variables: { recipient: Principal; body: string },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.recipient.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useSetProfile() {
  const { backend } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      displayName,
      avatarUrl,
      bio,
      isPrivate,
    }: {
      displayName: string;
      avatarUrl: string;
      bio: string;
      isPrivate: boolean;
    }) => {
      return backend.setProfile(displayName, avatarUrl, bio, isPrivate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useGeneratePostOptions() {
  const { backend } = useBackend();
  return useMutation({
    mutationFn: async (rawThought: string): Promise<PostOption[]> => {
      return backend.generatePostOptions(rawThought);
    },
  });
}

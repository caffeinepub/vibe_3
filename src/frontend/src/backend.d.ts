import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Comment {
    text: string;
    authorName: string;
    author: Principal;
    timestamp: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Post {
    id: bigint;
    content: string;
    authorName: string;
    author: Principal;
    likes: Array<Principal>;
    timestamp: bigint;
    comments: Array<Comment>;
}
export interface Message {
    id: bigint;
    body: string;
    recipient: Principal;
    sender: Principal;
    timestamp: bigint;
}
export interface PostOption {
    content: string;
    style: string;
}
export interface Profile {
    bio: string;
    displayName: string;
    isPrivate: boolean;
    avatarUrl: string;
}
export interface ConversationSummary {
    otherUserName: string;
    lastMessage: string;
    otherUser: Principal;
    lastTimestamp: bigint;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    isPrivate: boolean;
    avatarUrl: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, text: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(content: string): Promise<bigint>;
    generatePostOptions(_rawThought: string): Promise<Array<PostOption>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversations(): Promise<Array<ConversationSummary>>;
    getMessages(otherUser: Principal): Promise<Array<Message>>;
    getMyProfile(): Promise<Profile | null>;
    getPosts(offset: bigint, limit: bigint): Promise<Array<Post>>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getProfile(user: Principal): Promise<Profile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, body: string): Promise<bigint>;
    setProfile(displayName: string, avatarUrl: string, bio: string, isPrivate: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}

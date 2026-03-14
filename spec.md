# vibe

## Current State
- UserProfilePage.tsx has a Message button that shows a toast: "Open messages to chat! 💬"
- App.tsx renders UserProfilePage with `principal` and `onBack` props only
- MessagesPage.tsx has no way to receive an initial conversation to open

## Requested Changes (Diff)

### Add
- `onMessage` callback prop to `UserProfilePage` — receives `(principal: Principal, displayName: string) => void`
- `initialConversation` optional prop to `MessagesPage` — a `ConversationSummary` to open immediately on mount
- `openMessageWith` state in `App.tsx` — stores `{ principal, displayName } | null`

### Modify
- `UserProfilePage.tsx`: replace `handleMessage` toast with a call to `onMessage(principal, name)`
- `App.tsx`: pass `onMessage` to `UserProfilePage`; when `openMessageWith` is set, navigate to `messages` page and pass `initialConversation` to `MessagesPage`; clear `openMessageWith` after use
- `MessagesPage.tsx`: accept optional `initialConversation?: ConversationSummary` prop; if provided, set `activeConversation` to it on mount via `useEffect`

### Remove
- The `toast("Open messages to chat! 💬")` placeholder in `UserProfilePage`

## Implementation Plan
1. Add `onMessage?: (principal: Principal, name: string) => void` prop to `UserProfilePage`; call it in the Message button handler
2. Add `initialConversation?: ConversationSummary` prop to `MessagesPage`; use `useEffect` to open it on mount
3. In `App.tsx`, add `openMessageWith` state; pass `onMessage` handler to `UserProfilePage` that sets `openMessageWith` and navigates to `messages`; pass `initialConversation` to `MessagesPage` built from `openMessageWith`; clear after navigation

# NoteVerse Next-Gen Features: Implementation Plan

## 1. Smart-Link Knowledge Graph
**Objective**: Visualize connections between notes based on tags and subjects.

### Architectural Plan
- **Library**: `react-force-graph-2d` or `recharts` (custom network). Recommended: `react-force-graph-2d` for performance.
- **Data Structure**: 
  - `Nodes`: Notes (ID, Title, Subject as color).
  - `Links`: Shared Tags or Manual References.
- **File**: `src/pages/KnowledgeGraph.tsx`
- **Logic**:
  1. Fetch all notes.
  2. Compute adjacency list based on overlapping tags.
  3. Render Graph.
  4. OnClick Node -> Navigate to Note.

## 2. Focus Flow (Ambient Study Mode)
**Objective**: specific UI for distraction-free reading/writing with timer and lofi.

### Architectural Plan
- **File**: `src/pages/FocusMode.tsx`
- **Features**:
  - Fullscreen toggle (`screenfull` lib).
  - Integrated Pomodoro Timer (reuse widget).
  - Audio Player (HTML5 Audio) with preset Lofi tracks (mp3 assets).
  - Markdown Editor with "Typewriter Mode" (auto-scroll).
- **State**: `isFocusActive`, `timer`, `selectedAudio`.

## 3. Live Peer Presence
**Objective**: Show who else is viewing a note.

### Architectural Plan
- **Backend Service**: Supabase Realtime (Presence Channel).
- **Component**: `src/components/features/LivePresence.tsx`
- **Logic**:
  - `channel = supabase.channel('room_1')`
  - `channel.track({ user: 'Me', online_at: new Date() })`
  - `channel.on('presence', syncState)`
  - Display avatars of active users in Header.

## Execution Order
1. Install dependencies (`react-force-graph-2d`).
2. Implement `FocusMode` (easiest standalone).
3. Implement `KnowledgeGraph` (requires data processing algorithm).
4. Implement `LivePresence` (requires Supabase Realtime setup).

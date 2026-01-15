
# Navigation Logic & Routing Schema

## Overview
This document defines the hierarchical routing logic for the NoteVerse application, ensuring a consistent user experience across "Back", "Close", and "Exit" actions.

## 1. Navigation Stack Principles

### Linear vs. Hierarchical Flow
- **Linear Flow**: Moving permanently to a new context (e.g., Login -> Dashboard).
- **Hierarchical/Modal Flow**: "Drilling down" into content (e.g., Notes -> Note Reader).

### The "Stack"
We treat user navigation as a stack. Opening a detailed view (NoteReader) pushes a new context.
- **Push**: User clicks a note card. URL changes to `/notes/:id`.
- **Pop**: User clicks "Back" or "Close". URL returns to previous state.

## 2. Logic Schema

### A. The "Back" Action (<)
*Triggered by: Browser Back Button, Back Arrow UI.*

**Logic:**
1. Check `history.state` or `location.key`.
2. **IF** `history.length > 1` (user arrived from internal page):
   - Execute `navigate(-1)`.
   - *Result*: Restores exact previous state (scroll position, search filters).
3. **ELSE** (user arrived via Deep Link / Refresh):
   - Execute `navigate(ParentScope)` (e.g., `/notes`).
   - *Result*: Redirects to the logical parent page.

### B. The "Close" Action (X)
*Triggered by: Close icons on full-page views or modals.*

**Logic:**
1. **IF** `window.opener` exists (Context: New Tab/Window):
   - Execute `window.close()`.
2. **ELSE**:
   - Treat as "Back" action (see above) with a specific fallback fallback (e.g., `/dashboard` or `/notes`).

## 3. Router Configuration (Implementation)

We utilize a custom hook `useSmartNavigation` to standardize this behavior.

### Hook Definition (`src/hooks/useSmartNavigation.ts`)

```typescript
export function useSmartNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = (fallbackPath = "/") => {
    // "default" key implies initial entry (no stack)
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return { goBack };
}
```

### Usage Pattern

**In Pages (e.g., NoteReader):**
```tsx
const { closeView } = useSmartNavigation();
// ...
<Button onClick={() => closeView("/notes")}>
  <X /> Close
</Button>
```

**In Components (e.g., BackButton):**
```tsx
const { goBack } = useSmartNavigation();
// ...
<Button onClick={() => goBack(props.fallback || "/")}>
  Back
</Button>
```

## 4. State Preservation
By using `navigate(-1)` primarily, we leverage the browser's built-in scroll restoration and state cache. Avoid using `navigate(path)` for "Back" actions unless it is a necessary redirect, as `navigate(path)` pushes a *new* entry and resets component state.

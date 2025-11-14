# Bug Fixes Documentation

This file tracks critical bugs and their fixes to prevent regression in future development.

---

## Duplicate Images Bug (Fixed: November 2025)

### Symptoms
- After creating an artifact with multiple images, the view page would display the same image repeated multiple times (usually the last uploaded image)
- The edit page correctly showed all unique image thumbnails
- Database contained correct, unique URLs with no duplicates
- Console showed "0 duplicates removed" but images still appeared duplicated visually

### Root Cause
**React Hydration Error (#418)** caused by reading `localStorage` during initial component render in `components/artifact-swipe-wrapper.tsx`. This caused:
1. Server-rendered HTML to differ from client-rendered HTML
2. React to discard server HTML and re-render from scratch
3. State inconsistencies during re-render, causing duplicate image display
4. Component mounting twice with potentially stale/incorrect state

### Fix Applied
**File: `components/artifact-swipe-wrapper.tsx`**
- Moved `localStorage` read from initial state to `useEffect` hook
- Ensured server and client render identical HTML on initial load
- Prevented hydration mismatches that caused re-renders

**Before:**
\`\`\`tsx
const [showSwipeUI, setShowSwipeUI] = useState(
  () => localStorage.getItem('preferSwipeUI') === 'true' // ❌ Causes hydration error
)
\`\`\`

**After:**
\`\`\`tsx
const [showSwipeUI, setShowSwipeUI] = useState(false) // ✅ Server-safe default

useEffect(() => {
  setShowSwipeUI(localStorage.getItem('preferSwipeUI') === 'true')
}, [])
\`\`\`

### Prevention Guidelines
**⚠️ CRITICAL: Never access browser APIs during initial render in client components**

- ❌ **DO NOT** read `localStorage`, `sessionStorage`, or `window` in `useState` initializers
- ❌ **DO NOT** use `window.innerWidth`, `navigator.userAgent`, or similar in initial render
- ❌ **DO NOT** place `console.log()` statements inside JSX return statements
- ✅ **DO** use `useEffect` for all browser API access after component mounts
- ✅ **DO** provide server-safe defaults in `useState` (typically `false`, `null`, `''`, or `[]`)
- ✅ **DO** test for hydration errors in console when making changes to artifact view components

### Files to Watch
When modifying these files, ensure no hydration-causing code is introduced:
- `components/artifact-swipe-wrapper.tsx`
- `components/artifact-swipe-content.tsx`
- `components/artifact-image-with-viewer.tsx`
- `app/artifacts/[id]/page.tsx`

### Testing
To verify this bug doesn't return:
1. Create an artifact with 3+ images
2. Navigate to the artifact view page
3. Check browser console for React hydration errors (#418)
4. Verify each image displays correctly (not duplicated)
5. Check that edit mode shows correct thumbnails
</markdown>

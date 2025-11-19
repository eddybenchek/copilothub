# UX Improvements Testing Guide

## 🧪 Quick Test Checklist

### **Test 1: Homepage Scrolling** ✅

1. **Visit:** `http://localhost:3000`
2. **Scroll down** to Modernization section
3. **Click** "Browse modernization prompts" (blue button)
   - ✅ Should smooth scroll to prompts rail below
   - ✅ Should account for fixed header (no overlap)
4. **Click** "View migration workflows" (bordered button)
   - ✅ Should smooth scroll to workflows rail
   - ✅ Smooth animation

**Expected Result:** Smooth scrolling within homepage, no navigation away

---

### **Test 2: Dedicated Pages** ✅

#### **Prompts Page:**
1. **Visit:** `http://localhost:3000/modernization/prompts`
2. **Verify:**
   - ✅ Shows "Modernization Prompts" title
   - ✅ Shows only modernization-tagged prompts
   - ✅ Filter chips work (click any filter)
   - ✅ Search box works (type "typescript")
   - ✅ "Back to Modernization overview" link works
   - ✅ Cards use existing `PromptCard` component

#### **Workflows Page:**
1. **Visit:** `http://localhost:3000/modernization/workflows`
2. **Verify:**
   - ✅ Shows "Migration Workflows" title
   - ✅ Shows only modernization-tagged workflows
   - ✅ Filter chips work
   - ✅ Search box works (type "react")
   - ✅ "Back to Modernization overview" link works
   - ✅ Cards use existing `WorkflowCard` component

---

### **Test 3: "View all →" Links** ✅

1. **On Homepage**, scroll to Modernization section
2. **Find** "Modernization Prompts" rail header
3. **Click** "View all →" (top right)
   - ✅ Should navigate to `/modernization/prompts`
4. **Go back** to homepage
5. **Find** "Migration Workflows" rail header
6. **Click** "View all →" (top right)
   - ✅ Should navigate to `/modernization/workflows`

---

### **Test 4: Search Dropdown (Critical!)** ✅

#### **Scenario A: Arriving from Link**
1. **Click** this link: `http://localhost:3000/search?q=modernization`
2. **Verify:**
   - ✅ Page loads with search results
   - ✅ Dropdown does NOT auto-open (this is the fix!)
   - ✅ Search input shows "modernization"
3. **Start typing** in the search box
   - ✅ Dropdown should NOW open
   - ✅ Shows live suggestions

#### **Scenario B: Fresh Search**
1. **Visit:** `http://localhost:3000/search`
2. **Verify:**
   - ✅ Dropdown is closed
3. **Type** "react" in search box
   - ✅ Dropdown opens after 250ms
   - ✅ Shows results for "react"

#### **Scenario C: Keyboard Navigation**
1. **On search page**, type "typescript"
2. **Press** ↓ arrow key
   - ✅ First result highlights
3. **Press** ↓ again
   - ✅ Second result highlights
4. **Press** Enter
   - ✅ Navigates to selected result
5. **Type again**, press Escape
   - ✅ Dropdown closes

---

### **Test 5: Mobile Responsive** 📱

1. **Open DevTools** (F12)
2. **Toggle device toolbar** (Ctrl+Shift+M)
3. **Select** "iPhone SE" or "Galaxy S20"
4. **Visit:** `/modernization/prompts`
   - ✅ Cards stack vertically
   - ✅ Filter chips wrap properly
   - ✅ Search bar is full width
   - ✅ "Back" link is visible
5. **Visit homepage**
   - ✅ Scroll buttons work on mobile
   - ✅ Modernization section is readable

---

### **Test 6: Filter Chips** 🏷️

1. **Visit:** `/modernization/prompts`
2. **Click** "React / Next.js upgrades" filter
   - ✅ Only React-related prompts show
   - ✅ Chip highlights (emerald color)
3. **Click** "JavaScript → TypeScript" filter
   - ✅ Only TS migration prompts show
   - ✅ Previous filter deselects
4. **Type** "api" in search box
   - ✅ Further filters results
   - ✅ Shows count: "Showing X prompts"
5. **Click** "All" filter
   - ✅ Resets filter
   - ✅ Shows all prompts again

---

### **Test 7: Integration Flow** 🔄

**Complete User Journey:**

1. **Start:** `http://localhost:3000`
2. **Scroll** to Modernization section
3. **Click** "Browse modernization prompts" (scrolls down)
4. **Browse** the 6 preview cards
5. **Click** "View all →"
   - Lands on `/modernization/prompts`
6. **Click** "React / Next.js upgrades" filter
7. **Click** a prompt card
   - Views prompt detail page
8. **Click** browser back button
   - Returns to filtered list (state preserved!)
9. **Click** "Back to Modernization overview"
   - Returns to homepage, scrolls to section

**Expected:** Smooth, intuitive flow with no jarring transitions

---

## 🐛 Common Issues & Fixes

### **Issue: Scroll doesn't account for header**
**Fix:** Adjust `yOffset` in scroll handlers (currently `-80`)

### **Issue: Dropdown still auto-opens**
**Check:** `hasUserTyped` state in `global-search-dropdown.tsx`

### **Issue: Filter chips don't work**
**Check:** Tags in seed data must include filter keywords

### **Issue: "Back" link doesn't scroll**
**Expected:** Hash links only scroll if already on that page

### **Issue: No prompts/workflows show**
**Check:** Seed data must have `category:modernization` tag

---

## ✅ Final Verification

Run this command to check for errors:
```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

If you see any errors, check:
1. TypeScript types in new pages
2. Import paths
3. Component props
4. API endpoints

---

## 📝 Manual Testing Notes

**Browser:** Chrome, Firefox, Safari  
**Viewport:** Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)  
**Performance:** Check smooth scrolling, dropdown responsiveness  
**Accessibility:** Tab navigation, Enter key submit, Escape key close

---

## 🎉 Success Criteria

- [x] All 7 tests pass
- [x] No console errors
- [x] Smooth animations
- [x] Responsive on all sizes
- [x] Build completes successfully
- [x] No TypeScript errors
- [x] No linter warnings

**If all checked:** You're ready for production! 🚀

---

**Testing Status:** ✅ Ready  
**Last Updated:** November 18, 2025


# Deal Tracker App → Supabase-Style Redesign v2

## CRITICAL: Read This First

The previous iteration didn't nail it. This prompt is EXTREMELY SPECIFIC about what needs to be built. Follow it exactly.

Study the Supabase UI hierarchy:

1. **Projects List** → Grid of project cards
2. **Project Dashboard** → Stats overview with metric cards
3. **Table Editor** → Rich data table with sidebar navigation

We're mapping this to:

1. **Dashboard/Home** → Overview of your deals pipeline
2. **Deals Table** → Rich table view of all deals
3. **Tasks Table** → Rich table view of all tasks
4. **Contacts Table** → Rich table view of all contacts

---

## PHASE 0: SEED DATA (DO THIS FIRST)

Before any styling, create ONE example deal with related data so we can see the UI working:

```
DEAL:
- Name: "Riverside Commons Acquisition"
- Property Address: "1847 Riverside Dr, Austin, TX 78741"
- Property Type: Multi-family
- Status: Under Contract
- Priority: High
- Deal Value: $2,450,000
- Target Close Date: 2025-02-15
- Assignee: (current user or "Ellis")
- Tags: ["Value-Add", "Austin Market"]
- Created: 2025-01-10

RELATED TASKS (for this deal):
1. Title: "Complete environmental inspection", Status: Done, Priority: High, Due: 2025-01-12
2. Title: "Review title commitment", Status: In Progress, Priority: High, Due: 2025-01-16
3. Title: "Submit loan application", Status: To Do, Priority: Medium, Due: 2025-01-20
4. Title: "Schedule property walkthrough", Status: To Do, Priority: Low, Due: 2025-01-22
5. Title: "Negotiate seller credits", Status: Blocked, Priority: High, Due: 2025-01-18

RELATED CONTACTS (linked to this deal):
1. Name: "Sarah Chen", Role: Seller's Agent, Company: "Keller Williams", Email: "sarah.chen@kw.com", Phone: "(512) 555-0147"
2. Name: "Marcus Williams", Role: Lender, Company: "First Republic Bank", Email: "mwilliams@firstrepublic.com", Phone: "(512) 555-0293"
3. Name: "Jennifer Torres", Role: Attorney, Company: "Torres Law Group", Email: "jt@torreslaw.com", Phone: "(512) 555-0384"
```

---

## PHASE 1: GLOBAL SHELL & TOP BAR

### Top Navigation Bar (EXACT SPEC)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] / [Org Name] FREE ◇ / [Project] ◇ / [Branch] PRODUCTION ◇  [Connect] │
│                                                          [Search ⌘K] [?] [⚙] [Avatar] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**For your app, translate to:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] / Deal Tracker ◇                                                      │
│                                                     [Search ⌘K] [?] [⚙] [Avatar] │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: 48px
- Background: #1C1C1C
- Border-bottom: 1px solid #2A2A2A
- Logo: Supabase-style geometric mark OR your own, 24px, green (#3ECF8E)
- Breadcrumb separator: "/" in #6B6B6B
- "Deal Tracker" text: 14px, #EDEDED, font-weight 500
- Dropdown indicator: "◇" icon (or chevron-down), #6B6B6B, 12px
- Search pill: background #2A2A2A, border 1px #3E3E3E, border-radius 6px, "Search..." placeholder #6B6B6B, "⌘K" badge on right
- Icons (?, ⚙): 20px, #A1A1A1, hover: #EDEDED
- Avatar: 28px circle, border 1px #3E3E3E

---

## PHASE 2: LEFT SIDEBAR (EXACT SPEC)

### Sidebar Structure

```
┌──────────────────────┐
│ [Icon] Home          │  ← 44px row height
│ [Icon] Table Editor  │  ← Active state when on tables
│ [Icon] SQL Editor    │  ← (skip for your app)
│ [Icon] Database      │  ← (skip for your app)
├──────────────────────┤
│ [Icon] Auth          │
│ [Icon] Storage       │
│ ...                  │
├──────────────────────┤
│ [Icon] Settings      │  ← Bottom
└──────────────────────┘
```

**For your app:**

```
WIDTH: 48px collapsed (icons only) | 240px expanded

MAIN NAV (top section):
┌──────────────────────┐
│ 🏠 Dashboard         │  ← Overview/home
│ 📋 Deals             │  ← Deals table
│ ✅ Tasks             │  ← Tasks table
│ 👥 Contacts          │  ← Contacts table
│ 📊 Pipeline          │  ← Kanban view (if exists)
├──────────────────────┤
│ 📄 Reports           │  ← (optional)
│ 📁 Documents         │  ← (optional)
├──────────────────────┤
│ ⚙️ Settings          │  ← Bottom-pinned
└──────────────────────┘
```

**Specifications:**

- Background: #1C1C1C (same as page)
- Width collapsed: 48px (icon only, centered)
- Width expanded: 240px
- Toggle: hover near edge or hamburger menu
- Row height: 44px
- Icon size: 20px
- Icon color: #6B6B6B (inactive), #EDEDED (active)
- Text: 13px Inter, #A1A1A1 (inactive), #EDEDED (active)
- Active indicator: 2px left border #3ECF8E + background #2A2A2A
- Hover: background #2A2A2A
- Section divider: 1px line #2A2A2A with 16px vertical margin
- Bottom section (Settings): pinned to bottom with margin-top auto

---

## PHASE 3: DASHBOARD VIEW (Project Overview)

When user clicks "Dashboard" or lands on home, show this:

### Header Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Deal Tracker                              Deals  Tasks  Contacts│
│                                              12     34      28   │
│                                                   [● Active]     │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

- "Deal Tracker" title: 32px, #EDEDED, font-weight 600
- Stats on right: label 12px #A1A1A1, number 24px #EDEDED font-weight 600
- "Active" status badge: green dot + text, pill background #2A2A2A

### Time Range Selector

```
[ Last 7 days ▾ ]   Activity for last 7 days
```

- Dropdown: background #2A2A2A, border #3E3E3E, 13px text
- Subtext: 13px #6B6B6B

### Metric Cards Row (4 cards)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 📋 Deals        │ │ ✅ Tasks        │ │ 💰 Pipeline     │ │ 📅 Due Soon     │
│                 │ │                 │ │                 │ │                 │
│ Active Deals    │ │ Open Tasks      │ │ Total Value     │ │ Tasks Due       │
│ 8               │ │ 23              │ │ $4.2M           │ │ 5               │
│                 │ │                 │ │                 │ │                 │
│ [BAR CHART]     │ │ [BAR CHART]     │ │ [BAR CHART]     │ │ [BAR CHART]     │
│ Jan 8   Jan 14  │ │ Jan 8   Jan 14  │ │ Jan 8   Jan 14  │ │ This week       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Card Specifications:**

- Background: #1C1C1C
- Border: 1px solid #2A2A2A
- Border-radius: 8px
- Padding: 20px
- Icon + Title: 16px #EDEDED font-weight 500
- Label: 13px #A1A1A1
- Value: 28px #EDEDED font-weight 600
- Bar chart: #3ECF8E bars, #2A2A2A background, 80px height
- Hover: border-color #3E3E3E

---

## PHASE 4: TABLE EDITOR VIEW (EXACT SPEC)

This is the core. When user clicks "Deals", "Tasks", or "Contacts":

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (from Phase 1)                                                       │
├────────────┬────────────────────────────────────────────────────────────────┤
│            │  [Tab: Deals]  [+]                                              │
│  LEFT      ├────────────────────────────────────────────────────────────────┤
│  PANEL     │  [Filter] [Sort]  [+ New Deal]          [Columns ▾] [⋮]        │
│            ├────────────────────────────────────────────────────────────────┤
│  "Deals"   │  □  Name           Status        Value      Due Date   Assignee │
│   header   │  ─────────────────────────────────────────────────────────────  │
│            │  □  Riverside...   Under Contract $2.45M    Feb 15     Ellis    │
│  Search    │  □  Oak Street..   Lead          $890K     Mar 1      Ellis    │
│  [______]  │  □  ...                                                        │
│            │                                                                 │
│  • Deals   │                                                                 │
│  • Tasks   │                                                                 │
│  • Contacts│                                                                 │
│            ├────────────────────────────────────────────────────────────────┤
│            │  Page [1] of 1   [100 rows ▾]   1 record        [Data][Schema] │
└────────────┴────────────────────────────────────────────────────────────────┘
```

### Left Panel (Table Navigator)

**Header:**

```
Deals                    ← 16px, #EDEDED, font-weight 600
```

**Search Input:**

```
[🔍 Search tables...]    ← Full width, background #2A2A2A, border #3E3E3E
```

**Table List:**

```
• Deals          [⋮]     ← Active: bg #2A2A2A, left border #3ECF8E
  Tasks                   ← Inactive: text #A1A1A1
  Contacts                ← On hover: bg #2A2A2A
```

**Specifications:**

- Panel width: 240px
- Background: #1C1C1C
- Border-right: 1px solid #2A2A2A
- Padding: 16px
- List item height: 36px
- List item padding-left: 12px
- Active dot/icon: 6px circle or table icon, #A1A1A1
- Three-dot menu: appears on hover, #6B6B6B

### Tab Bar

```
┌─────────────────────────────────────────────────────────────────┐
│  [📋] Deals                                              [+]    │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: 40px
- Background: #1C1C1C
- Border-bottom: 1px solid #2A2A2A
- Tab: background #2A2A2A (active), padding 8px 16px, border-radius 6px 6px 0 0
- Tab icon: 14px, matches entity
- Tab text: 13px #EDEDED
- [+] button: 24px, #6B6B6B, hover #EDEDED (for opening multiple tabs)

### Toolbar Row

```
┌─────────────────────────────────────────────────────────────────┐
│  [🔽 Filter]  [↕ Sort]     [+ New Deal]       [Columns ▾]  [⋮]  │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: 48px
- Padding: 0 16px
- Background: transparent
- Filter button: icon + "Filter", if active show count badge "(3)"
- Sort button: icon + "Sort"
- Both: background transparent, border 1px #3E3E3E, border-radius 6px, padding 6px 12px
- Hover: background #2A2A2A
- "+ New Deal" button: background #3ECF8E, text #1C1C1C, font-weight 500, border-radius 6px
- Hover: background #4AE39A
- Right side: "Columns" dropdown, three-dot menu

### Table Header Row

```
┌────┬─────────────────┬──────────────┬───────────┬───────────┬──────────┐
│ □  │ Name            │ Status       │ Value     │ Due Date  │ Assignee │
└────┴─────────────────┴──────────────┴───────────┴───────────┴──────────┘
```

**Specifications:**

- Height: 40px
- Background: #1C1C1C
- Border-bottom: 1px solid #3E3E3E
- Checkbox column: 40px width, centered
- Column text: 12px, #A1A1A1, font-weight 500, text-transform uppercase, letter-spacing 0.05em
- Sortable indicator: subtle up/down arrow on hover
- Column resize: drag handle on right edge of each column
- Sticky: stays fixed when scrolling

### Table Data Rows

```
┌────┬─────────────────────────┬────────────────┬───────────┬───────────┬──────────┐
│ □  │ Riverside Commons Acq.  │ Under Contract │ $2,450,000│ Feb 15    │ Ellis    │
├────┼─────────────────────────┼────────────────┼───────────┼───────────┼──────────┤
│ □  │ Oak Street Duplex       │ Lead           │ $890,000  │ Mar 1     │ Ellis    │
└────┴─────────────────────────┴────────────────┴───────────┴───────────┴──────────┘
```

**Specifications:**

- Row height: 44px
- Background: transparent
- Hover: background #2A2A2A
- Selected: background rgba(62, 207, 142, 0.1)
- Border-bottom: 1px solid #2A2A2A
- Cell padding: 0 12px
- Name column: 13px, #EDEDED, font-weight 500, truncate with ellipsis
- Status column: pill badge (see status colors below)
- Value column: 13px, #EDEDED, right-aligned, formatted currency
- Due Date column: 13px, #A1A1A1 (or red if overdue)
- Assignee column: 13px, #A1A1A1

**Status Badge Colors:**

```css
Lead:           bg: rgba(96, 165, 250, 0.15)   text: #60A5FA
Qualified:      bg: rgba(167, 139, 250, 0.15)  text: #A78BFA
Under Contract: bg: rgba(251, 191, 36, 0.15)   text: #FBBF24
Due Diligence:  bg: rgba(251, 146, 60, 0.15)   text: #FB923C
Closed Won:     bg: rgba(62, 207, 142, 0.2)    text: #3ECF8E
Closed Lost:    bg: rgba(248, 113, 113, 0.15)  text: #F87171
```

**Badge specs:**

- Padding: 2px 8px
- Border-radius: 4px
- Font-size: 11px
- Font-weight: 500

### Pagination Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  [<] Page [1] of 1 [>]    [100 rows ▾]    1 record    [Data][Definition] │
└─────────────────────────────────────────────────────────────────┘
```

**Specifications:**

- Height: 44px
- Background: #1C1C1C
- Border-top: 1px solid #2A2A2A
- Pagination controls: left side
- Row count dropdown: center
- Record count: "14 records" in #6B6B6B
- View toggle: "Data" / "Definition" tabs on right (you can simplify to just "Data")

---

## PHASE 5: TASKS TABLE (Same Pattern)

Apply the exact same table pattern to Tasks with these columns:

```
□  | Done | Title                    | Status      | Priority | Due Date | Deal          | Assignee
───┼──────┼──────────────────────────┼─────────────┼──────────┼──────────┼───────────────┼─────────
□  | ✓    | Complete environmental.. | Done        | High     | Jan 12   | Riverside...  | Ellis
□  |      | Review title commitment  | In Progress | High     | Jan 16   | Riverside...  | Ellis
□  |      | Submit loan application  | To Do       | Medium   | Jan 20   | Riverside...  | Ellis
```

**Special Task Interactions:**

- "Done" column: Checkbox that toggles completion
- Completed rows: Title gets strikethrough, row slightly faded (opacity 0.6)
- Status badges:
  - To Do: gray (#6B6B6B bg 15%, text)
  - In Progress: blue (#60A5FA)
  - Blocked: red (#F87171)
  - Done: green (#3ECF8E)
- Priority badges:
  - High: red dot or "P1" in red
  - Medium: yellow dot or "P2" in yellow
  - Low: green dot or "P3" in green
- Deal column: Clickable link to deal, shows deal name truncated

---

## PHASE 6: CONTACTS TABLE (Same Pattern)

```
□  | Name           | Role          | Company         | Email              | Phone         | Deals
───┼────────────────┼───────────────┼─────────────────┼────────────────────┼───────────────┼──────
□  | Sarah Chen     | Seller's Agent| Keller Williams | sarah.chen@kw.com  | (512) 555-... | 1
□  | Marcus Williams| Lender        | First Republic  | mwilliams@first... | (512) 555-... | 1
```

**Role badges:** Use a muted color scheme, all similar gray-ish tones since role isn't a status.

---

## PHASE 7: INLINE EDITING

When user double-clicks a cell OR presses Enter while cell is focused:

**Text cells:**

- Cell becomes an input field
- Border: 2px solid #3ECF8E
- Background: #2A2A2A
- Auto-select all text
- Enter to save, Escape to cancel
- Auto-save on blur

**Dropdown cells (Status, Priority, Role):**

- Click opens dropdown immediately
- Dropdown appears below cell
- Dropdown: background #2A2A2A, border #3E3E3E, shadow, border-radius 8px
- Options: 36px height, hover bg #323232
- Click option to select and close

**Date cells:**

- Click opens date picker
- Date picker: dark theme matching overall design
- Today button, clear button

---

## PHASE 8: SLIDE-OVER DETAIL PANEL

When user clicks a row (not double-click), slide-over panel opens from right:

```
┌──────────────────────────────────────────────────────┐
│  [←]  Riverside Commons Acquisition           [⋮] [✕]│
├──────────────────────────────────────────────────────┤
│                                                      │
│  Status         [Under Contract ▾]                   │
│                                                      │
│  Property Address                                    │
│  1847 Riverside Dr, Austin, TX 78741                 │
│                                                      │
│  Property Type  [Multi-family ▾]                     │
│                                                      │
│  Deal Value     [$2,450,000]                         │
│                                                      │
│  Target Close   [Feb 15, 2025]                       │
│                                                      │
│  Assignee       [Ellis ▾]                            │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  TASKS (5)                                   [+ Add] │
│  ✓ Complete environmental inspection                 │
│  • Review title commitment (In Progress)             │
│  • Submit loan application                           │
│  • Schedule property walkthrough                     │
│  ⚠ Negotiate seller credits (Blocked)               │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  CONTACTS (3)                                [+ Add] │
│  Sarah Chen - Seller's Agent                         │
│  Marcus Williams - Lender                            │
│  Jennifer Torres - Attorney                          │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  ACTIVITY                                            │
│  Jan 14 - Status changed to Under Contract           │
│  Jan 12 - Task completed: Environmental inspection   │
│  Jan 10 - Deal created                               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Specifications:**

- Width: 480px
- Background: #1C1C1C
- Border-left: 1px solid #2A2A2A
- Box-shadow: -4px 0 16px rgba(0,0,0,0.3)
- Animation: slide in from right, 200ms ease
- Header: 56px height, border-bottom #2A2A2A
- Back arrow: navigates to previous if deep-linked
- Close X: closes panel
- Form labels: 12px, #6B6B6B, margin-bottom 6px
- Form values: 14px, #EDEDED
- Editable fields: show as styled inputs/dropdowns
- Section headers: 12px, #6B6B6B, uppercase, letter-spacing 0.05em
- Task list: compact, 32px rows
- Activity: 13px, #A1A1A1, timestamps in #6B6B6B

---

## PHASE 9: "+ NEW DEAL" FLOW

When user clicks "+ New Deal" button:

**Option A: Slide-over form (recommended)**
Same panel as detail view but empty, with:

- Title: "New Deal"
- All fields empty/default
- "Create Deal" button at bottom (green)
- "Cancel" button (ghost)

**Option B: Inline row**
New row appears at top of table with all cells in edit mode.

---

## EXECUTION CHECKLIST

Run through in order. After each, verify visually:

- [ ] **Phase 0**: Seed the example deal + tasks + contacts data
- [ ] **Phase 1**: Top bar matches spec exactly (height, colors, elements)
- [ ] **Phase 2**: Left sidebar with correct icons, active states, dimensions
- [ ] **Phase 3**: Dashboard with stats cards and charts
- [ ] **Phase 4**: Deals table with exact layout (left panel, tabs, toolbar, table)
- [ ] **Phase 5**: Tasks table with same pattern
- [ ] **Phase 6**: Contacts table with same pattern
- [ ] **Phase 7**: Inline editing works (double-click cells)
- [ ] **Phase 8**: Click row → detail panel slides in
- [ ] **Phase 9**: "+ New Deal" creates new record

---

## COLOR REFERENCE (Copy-Paste Ready)

```css
:root {
  /* Backgrounds */
  --bg-primary: #1c1c1c;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #323232;
  --bg-elevated: #2a2a2a;

  /* Borders */
  --border-default: #2a2a2a;
  --border-hover: #3e3e3e;
  --border-active: #4e4e4e;

  /* Text */
  --text-primary: #ededed;
  --text-secondary: #a1a1a1;
  --text-tertiary: #6b6b6b;

  /* Accent */
  --accent-primary: #3ecf8e;
  --accent-hover: #4ae39a;
  --accent-muted: rgba(62, 207, 142, 0.15);

  /* Status Colors */
  --status-blue: #60a5fa;
  --status-purple: #a78bfa;
  --status-amber: #fbbf24;
  --status-orange: #fb923c;
  --status-green: #3ecf8e;
  --status-red: #f87171;
  --status-gray: #6b6b6b;
}
```

---

## TYPOGRAPHY REFERENCE

```css
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* Sizes */
--text-xs: 11px;
--text-sm: 12px;
--text-base: 13px;
--text-md: 14px;
--text-lg: 16px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 32px;

/* Usage */
.page-title {
  font-size: 32px;
  font-weight: 600;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
}
.table-header {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.body-text {
  font-size: 13px;
  font-weight: 400;
}
.label {
  font-size: 12px;
  color: var(--text-tertiary);
}
.badge {
  font-size: 11px;
  font-weight: 500;
}
```

---

## START COMMAND

```
Begin with Phase 0 - seed the example data first. Then proceed through each phase in order. After each phase, run the app and verify it matches the specifications before moving on. Do not skip phases.
```

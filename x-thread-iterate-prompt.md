# X Thread: The "Rate & Iterate" Prompt for Elite-Level Code

---

**Tweet 1/8**

Just discovered a prompting technique that turned my mid-tier SaaS into production-quality code in ~2 hours.

The "Rate & Iterate" method.

Here's the exact prompt and why it works so well:

---

**Tweet 2/8**

The prompt:

"Break everything into categories and subcategories. Rate each from 1 to 10, with 10 being elite-level SaaS. Begin iterating until you get to 10s across the board."

That's it. Simple but devastatingly effective.

---

**Tweet 3/8**

Why it works:

1. Forces structured analysis - Claude creates a mental model of your entire codebase
2. Creates measurable goals - numbers make progress tangible
3. Establishes a feedback loop - each iteration shows what improved and what's left
4. Prevents "good enough" - 10/10 is the explicit target

---

**Tweet 4/8**

My categories ended up being:

- UI/UX Design (visual, typography, micro-interactions, loading states)
- Functionality (CRUD, search, real-time, keyboard nav)
- Code Quality (TypeScript, architecture, error handling)
- Performance (initial load, data fetching)
- Testing (E2E, unit tests)

---

**Tweet 5/8**

First pass ratings? Brutal honesty:

- Loading States: 3/10
- Error Handling UI: 3/10
- Real-time Updates: 2/10
- Keyboard Navigation: 2/10

Seeing the gaps laid out like this makes prioritization obvious.

---

**Tweet 6/8**

After 2 iterations:

- Added skeleton loaders everywhere (3 → 7)
- Error boundaries + toast notifications (3 → 7)
- Supabase real-time subscriptions (2 → 7)
- Keyboard shortcuts with help modal (2 → 7)

All while maintaining 25 passing tests.

---

**Tweet 7/8**

Pro tips:

- Say "let's continue iterating" to keep the loop going
- The subcategories reveal hidden debt you didn't know existed
- Claude tracks its own progress, creating accountability
- Works for any codebase, not just greenfield

---

**Tweet 8/8**

The magic is in the word "iterate."

It shifts from "fix my code" to "let's systematically improve together until it's excellent."

Different energy. Different results.

Try it on your next project. Your future self will thank you.

---

*[End thread]*

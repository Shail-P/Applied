# Explaining Applied

## A 30-second introduction

“Applied is a job application tracker that turns a pasted job posting into structured details using Gemini. A user reviews and corrects those details before adding them to their tracker. It supports editing, deletion, search, and status filtering. I used Next.js and TypeScript, Clerk for authentication, and runtime validation around the AI response. The current version stores applications in React state; database persistence is the next step.”

Be clear that adding a record tracks an application. Applied does not submit applications to employers.

## Follow one posting through the app

1. `src/app/page.tsx` checks the Clerk session on the server. Signed-out visitors go to sign-in.
2. `ApplicationTracker` coordinates the page. It owns the pasted text and which review/edit screen is open.
3. `JobDescriptionForm` checks the input length and calls the browser helper in `api.ts`.
4. That helper sends a POST request to `/api/applications/extract`.
5. The route independently checks authentication and validates the request. A protected page alone would not protect a directly called API.
6. The server service calls Gemini using a key from the server environment. It asks for a structured response and validates the result with Zod.
7. The browser validates the response too, then opens `ApplicationForm` with those values.
8. The user corrects any details and submits. `useApplications` gives the new record an ID and timestamp and adds it to local state.
9. React renders the new card. Search and filters operate on that same array.

An AI response is a draft, never an automatically saved application.

## Three kinds of state

- **Saved application state:** `useApplications` owns the list and add/update/delete operations.
- **Editor state:** `ApplicationTracker` chooses create, edit, or the paste form. A small TypeScript union prevents conflicting “creating” and “editing” flags.
- **Unsaved form state:** `ApplicationForm` owns the values while you type. Cancel discards the draft without changing the saved record.

Search text and the selected status live in `ApplicationList` because only that component needs them. There is no global state library.

## Why updates use map and filter

React state is treated as immutable. Adding creates a new array, editing uses `.map()` to replace the matching ID, and deletion uses `.filter()` to remove that ID.

The update operation explicitly retains the saved ID, original added date, and original job description. The form only submits editable draft fields. Functional state updates receive the latest array instead of relying on an older render.

Skills are edited as comma-separated text and converted to a trimmed, case-insensitively deduplicated array when saved.

## Frontend and server boundary

`ApplicationTracker` is the client entry point because it needs React state and event handlers. Its imported child components run on the client as well; they do not each need another `"use client"` declaration.

The page and API route run on the server. The Gemini service imports `server-only`, so Next.js rejects accidental imports into browser code. The browser calls our route rather than Google directly.

TypeScript catches mistakes during development, but external JSON has no runtime guarantee. Zod checks input and output at the network boundary. Gemini’s provider schema requests the expected shape; local validation verifies it. Those schemas have different jobs.

The service keeps Gemini’s supported `responseSchema` format. Adding arbitrary JSON Schema options such as `additionalProperties` to that format previously caused HTTP 400 responses.

## Failure handling

- Short or oversized postings are rejected before extraction.
- Pending requests disable duplicate submissions.
- Leaving the paste form cancels its browser request so late responses cannot replace an edit.
- API failures keep the pasted posting and show an actionable error.
- Manual entry remains available when AI cannot be used.
- Empty and filtered-empty lists have distinct messages.
- Saved application edits do not make another Gemini request.

## Tests and tradeoffs

`tests/ApplicationTracker.test.tsx` exercises the actual components and storage hook together, mocking only the network response. It covers review/correction/submit, edit, cancel, search/filter, deletion, and error/loading behavior. These tests do not verify the live Google service or replace visual browser testing.

`tests/extraction.test.ts` tests the Gemini service with mocked HTTP responses, including malformed output, rate limits, and timeouts. `tests/extract-route.test.ts` checks authentication, input validation, and the route's response contract.

The shared CSS contains recurring surface, field, and button styles. Component-specific layout uses Tailwind classes next to the markup. This avoids a UI framework and keeps the visual rules easy to find.

This is a deliberately small version of the product. Known limitations:

- Refreshing clears application state; Clerk authentication does not make that state persistent.
- Gemini can make extraction mistakes, has rate limits, and receives the submitted posting.
- API requests require authentication, but the app does not yet have distributed per-user rate limiting.
- There is no deployment, database, or cross-device sync included in this milestone.

## Where MongoDB connects next

The storage hook is the frontend integration point. Replace its local operations with API calls and load records when the tracker opens.

On the server, add a database connection module and application routes for listing, creating, updating, and deleting records. Associate every record with the Clerk user ID obtained from the session. Scope reads, updates, and deletes by that ID; never trust a user ID supplied by the browser.

Keep MongoDB credentials and queries on the server. Add server-side validation for saved records, loading/error UI, and cross-user access tests. The review form, card layout, and AI extraction service can retain their current responsibilities.

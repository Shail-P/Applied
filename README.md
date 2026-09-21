# Applied

A job application tracker built with Next.js, React, TypeScript, Clerk, and Gemini.
Paste a posting, review the extracted details, and add it to your tracker.

The interface keeps the original Liquid Glass style: translucent surfaces, subtle shadows, rounded controls, and system typography.

## Current version

- Clerk sign-in and sign-up.
- AI extraction of company, title, location, workplace, skills, and summary.
- Editable review before submitting to the tracker, with manual entry available.
- Edit and delete saved applications.
- Search by company, role, location, skills, or summary; filter by status.
- Original posting and added date preserved during edits.

**Storage is temporary React state. Refreshing or leaving the page clears applications.**
Submitting adds a record to this tracker; it does not apply to an employer.
MongoDB is the next milestone.

## Run locally

Use Node.js 24 or newer and npm.

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local`.
3. Set your Clerk publishable/secret keys and `GEMINI_API_KEY`.
4. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

The Clerk routes are `/login` and `/sign-up`. The checked-in environment example contains names and empty placeholders only. Existing `.env` files are also supported; avoid defining conflicting keys in multiple files.

Never commit a populated environment file. Only the Clerk publishable key uses the `NEXT_PUBLIC_` prefix. The Gemini and Clerk secret keys stay on the server.

## Commands

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the development server                   |
| `npm run build`        | Build for production                           |
| `npm start`            | Serve the production build                     |
| `npm run lint`         | Check code quality                             |
| `npm run typecheck`    | Generate Next route types and check TypeScript |
| `npm test`             | Run automated regression tests                 |
| `npm run format`       | Format the project                             |
| `npm run format:check` | Check formatting without changing files        |

The production build explicitly uses Webpack. It avoids a Turbopack CSS-worker port restriction in the development environment and is supported by this installed Next.js version.

Tests use simulated browser interactions and mocked Gemini responses. They do not send postings to Google or consume API quota.

## Where to start reading

| File                                                          | Responsibility                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/app/page.tsx`                                            | Checks Clerk authentication and renders the page                    |
| `src/features/applications/components/ApplicationTracker.tsx` | Coordinates the paste, review, and edit screens                     |
| `src/features/applications/hooks/useApplications.ts`          | Owns local application state and create/update/delete operations    |
| `src/features/applications/components/JobDescriptionForm.tsx` | Handles pasted text, extraction requests, loading, and manual entry |
| `src/features/applications/components/ApplicationForm.tsx`    | Shared review/edit form                                             |
| `src/features/applications/components/ApplicationList.tsx`    | Searches, filters, and displays the list                            |
| `src/features/applications/components/ApplicationCard.tsx`    | Displays one application                                            |
| `src/features/applications/api.ts`                            | Browser request to the authenticated extraction route               |
| `src/app/api/applications/extract/route.ts`                   | Authenticates and validates the request                             |
| `src/features/applications/server/extract-application.ts`     | Calls Gemini and validates the response                             |
| `src/features/applications/types.ts`                          | Application model and display labels                                |
| `src/features/applications/schemas.ts`                        | Runtime validation shared by browser and server                     |
| `src/components/AuthShell.tsx`                                | Shared sign-in/sign-up layout                                       |
| `src/app/globals.css`                                         | Shared glass surfaces, fields, and buttons                          |

Components use PascalCase filenames; hooks start with `use`. Imports within the application feature are relative; cross-feature imports use `@/`.

For a walkthrough and interview preparation, read [the project guide](docs/PROJECT_GUIDE.md).

## Next: MongoDB

Start at `useApplications`. Replace its local operations with calls to authenticated application API routes, then add loading and error states around those calls. The MongoDB connection and queries belong on the server; every query must be scoped to the signed-in Clerk user.

No database SDK, database connection, browser storage, or placeholder persistence layer is included yet.

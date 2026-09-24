# Applied

Applied helps job seekers keep their applications organized. Paste a job posting, let Gemini extract the key details, review and correct the result, and save it to a personal tracker backed by MongoDB.

**[Watch the project demo on YouTube](https://youtu.be/AjfjCYGX8Ww)**

## How it works

1. Sign in or create an account with Clerk.
2. Paste a job description, or enter the details manually.
3. Review the extracted company, role, location, workplace type, skills, and summary.
4. Save the application and track its status: Applied, Interview, Offer, or Rejected.
5. Search, filter, edit, and delete your saved applications. Records persist across page refreshes and sign-ins.

The interface keeps the original Liquid Glass style: translucent surfaces, subtle shadows, rounded controls, and system typography.

## Features

- Clerk sign-in and sign-up.
- AI extraction of company, title, location, workplace, skills, and summary.
- Editable review before submitting to the tracker, with manual entry available.
- Edit and delete saved applications.
- Search by company, role, location, skills, or summary; filter by status.
- Original posting and added date preserved during edits.

Applications are persisted in MongoDB and scoped to the signed-in Clerk user.
Submitting adds a record to this tracker; it does not apply to an employer.

## Tech stack

| Layer          | Technology                                  |
| -------------- | ------------------------------------------- |
| Application    | Next.js 16 App Router, React 19, TypeScript |
| Styling        | Tailwind CSS 4, custom CSS, Lucide icons    |
| Authentication | Clerk                                       |
| AI extraction  | Google Gemini                               |
| Database       | MongoDB with the official Node.js driver    |
| Validation     | Zod                                         |
| Tests          | Vitest and React Testing Library            |

## Run locally

Use Node.js 24 or newer and npm.

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Shail-P/Applied.git
   cd Applied
   npm ci
   ```

2. Create `.env.local` in the project root.
3. Set your Clerk publishable/secret keys, `GEMINI_API_KEY`, `MONGODB_URI`, and `MONGODB_DB=applied`.
4. Configure your Clerk application and allow your server's network address in MongoDB Atlas. Use an Atlas database user's credentials in the connection string, URL-encoding special characters in the password.
5. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

Your `.env.local` should contain these variables with your own values:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=applied
```

The Clerk routes are `/login` and `/sign-up`. Existing `.env` files are also supported; avoid defining conflicting keys in multiple files.

Never commit a populated environment file. Clerk’s publishable key and route settings can use the `NEXT_PUBLIC_` prefix. The Gemini key, Clerk secret key, and MongoDB connection string stay on the server.

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
| `src/features/applications/hooks/useApplications.ts`          | Loads applications and calls authenticated persistence routes       |
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

## MongoDB persistence

`src/lib/mongodb.ts` reuses a server-only MongoDB client. Configure `MONGODB_URI` and `MONGODB_DB` locally and in your deployment environment; allow the server's network address in Atlas.

`/api/applications` lists and creates records; `/api/applications/[id]` updates and deletes them. All routes authenticate with Clerk. The server generates IDs and timestamps and scopes queries to the session user. Updates preserve the original posting and date. Failed saves retain the draft; failed loads offer a retry.

Tests mock database operations and check authentication, ownership filters, validation, and error handling. They do not require Atlas credentials.

## Architecture and API

The client components manage forms, search, and filters. They call Next.js route handlers for AI extraction and database operations. Route handlers authenticate the Clerk session and validate input before calling Gemini or MongoDB; credentials never need to reach the browser.

| Endpoint                         | Purpose                                           |
| -------------------------------- | ------------------------------------------------- |
| `POST /api/applications/extract` | Extract a reviewable draft from a job description |
| `GET /api/applications`          | List the signed-in user's applications            |
| `POST /api/applications`         | Save a reviewed application                       |
| `PATCH /api/applications/[id]`   | Update an owned application                       |
| `DELETE /api/applications/[id]`  | Delete an owned application                       |

## Validation and limitations

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build` to verify changes. The test suite covers review and editing flows, persistence requests, error recovery, authentication, validation, and ownership filters using mocked external services.

AI extraction can make mistakes, so users review the draft before saving. Submitted descriptions are sent to Gemini for processing. Applied tracks applications; it does not submit them to employers. Distributed per-user rate limiting is not implemented. The preview above is a video demonstration, not a hosted app.

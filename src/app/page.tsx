import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Brand } from "@/components/Brand";
import { ApplicationTracker } from "@/features/applications/components/ApplicationTracker";

export default async function Home() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="page-container page-enter page-enter-header flex items-center justify-between gap-5 py-7">
        <Brand />
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-5 text-sm font-medium"
        >
          <a href="#applications" className="nav-link">
            Applications
          </a>
          <div className="surface flex size-10 items-center justify-center rounded-full">
            <UserButton />
          </div>
        </nav>
      </header>

      <main id="main-content" className="page-container page-enter page-enter-main pb-10">
        <div className="hero-enter mx-auto max-w-2xl pt-9 pb-10 text-center sm:pt-14 sm:pb-12">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">
            Paste the job.
            <br />
            We&apos;ll track the rest.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-zinc-500">
            Paste a posting, review the details, and keep your applications in
            one place.
          </p>
        </div>

        <ApplicationTracker key={userId} />

        <footer className="mt-12 border-t border-white/70 pt-5 text-center text-xs leading-5 text-zinc-500">
          Applications are saved for this session only. Refreshing clears your
          tracker.
        </footer>
      </main>
    </>
  );
}

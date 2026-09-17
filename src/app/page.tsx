import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { JobDescriptionForm } from "@/features/applications/components/job-description-form";

export default async function Home() {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  return (
    <main className="applied-shell relative isolate min-h-screen overflow-hidden px-5 pb-16 pt-8 sm:px-8 sm:pt-10">
      <div className="ambient-light ambient-light-left" aria-hidden="true" />
      <div className="ambient-light ambient-light-right" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <div className="intro-item flex justify-end [animation-delay:80ms]">
          <div className="glass-user-control">
            <UserButton />
          </div>
        </div>

        <section
          aria-labelledby="page-title"
          className="pb-8 pt-12 text-center sm:pt-14"
        >
          <p className="intro-item text-sm font-semibold tracking-[-0.01em] text-zinc-500 [animation-delay:140ms]">
            Applied
          </p>

          <h1
            id="page-title"
            className="intro-item mx-auto mt-7 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.05em] text-zinc-950 [animation-delay:210ms] sm:text-6xl"
          >
            Paste the job. We&apos;ll track the rest.
          </h1>

          <p className="intro-item mx-auto mt-5 max-w-lg text-base leading-7 text-zinc-500 [animation-delay:280ms] sm:text-lg">
            Copy and paste a job posting below, and we&apos;ll organize it for
            you.
          </p>

          <JobDescriptionForm />
        </section>
      </div>
    </main>
  );
}

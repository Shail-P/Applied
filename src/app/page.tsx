import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
export default async function Home() {
  const { isAuthenticated, redirectToSignIn } = await auth();

  if (!isAuthenticated) {
    return redirectToSignIn();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
      <div className="mb-10 flex justify-end">
        <UserButton />
      </div>
      <section aria-labelledby="page-title" className="text-center">
        <p className="mb-7 text-sm font-semibold tracking-[-0.01em] text-zinc-500">
          Applied
        </p>

        <h1
          id="page-title"
          className="mx-auto max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-zinc-950 sm:text-6xl"
        >
          Paste the job. We&apos;ll track the rest.
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-zinc-500 sm:text-lg">
          Copy and paste a job posting below, and we&apos;ll organize it for
          you.
        </p>

        <form
          className="mt-10 rounded-[28px] border border-black/5 bg-white p-3 text-left shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:p-4"
          action="#"
        >
          <label htmlFor="job-description" className="sr-only">
            Job description
          </label>
          <textarea
            id="job-description"
            name="jobDescription"
            rows={6}
            placeholder="Paste the full job description here..."
            className="w-full resize-none rounded-2xl border-0 bg-zinc-50 p-5 text-base leading-7 text-zinc-950 outline-none ring-1 ring-inset ring-black/5 transition-shadow placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-400"
          />

          <div className="mt-3 flex items-center justify-between px-1 pb-1">
            <p className="hidden text-xs text-zinc-400 sm:block">
              Your posting stays private.
            </p>
            <button
              type="submit"
              className="ml-auto rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
            >
              Add to tracker
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

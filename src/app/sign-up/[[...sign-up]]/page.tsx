import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="applied-shell relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="ambient-light ambient-light-left" aria-hidden="true" />
      <div className="ambient-light ambient-light-right" aria-hidden="true" />

      <section className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <p className="auth-product-line intro-item [animation-delay:80ms]">
          Paste a job. Track every opportunity.
        </p>

        <div className="auth-card-stage intro-item mt-7 [animation-delay:180ms]">
          <SignUp
            path="/sign-up"
            signInUrl="/login"
            fallbackRedirectUrl="/"
          />
        </div>
      </section>
    </main>
  );
}

import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="applied-shell relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5 py-16">
      <div className="ambient-light ambient-light-left" aria-hidden="true" />
      <div className="ambient-light ambient-light-right" aria-hidden="true" />

      <ClerkLoading>
        <div className="auth-loading-indicator" role="status">
          <span className="sr-only">Loading Applied</span>
          <span className="auth-loading-dot" aria-hidden="true" />
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <section className="auth-content-enter relative z-10 flex w-full max-w-md flex-col items-center text-center">
          <p className="auth-product-line">
            Paste a job. Track every opportunity.
          </p>

          <div className="auth-card-stage mt-7">
            <SignUp
              path="/sign-up"
              signInUrl="/login"
              forceRedirectUrl="/"
            />
          </div>
        </section>
      </ClerkLoaded>
    </main>
  );
}

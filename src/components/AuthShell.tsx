import type { ReactNode } from "react";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Brand } from "@/components/Brand";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Brand />

      <section
        className="surface mt-8 w-full max-w-md px-4 py-8 sm:px-6"
        aria-labelledby="auth-title"
      >
        <div className="mb-6 px-2 text-center">
          <h1
            id="auth-title"
            className="text-2xl font-semibold tracking-tight text-slate-900"
          >
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <ClerkLoading>
          <div
            className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500"
            role="status"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 motion-reduce:animate-none"
              aria-hidden="true"
            />
            Loading secure sign-in…
          </div>
        </ClerkLoading>

        <ClerkLoaded>
          <div className="flex justify-center">{children}</div>
        </ClerkLoaded>
      </section>
    </main>
  );
}

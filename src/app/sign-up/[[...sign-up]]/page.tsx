import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <SignUp
        path="/sign-up"
        signInUrl="/login"
        fallbackRedirectUrl="/"
      />
    </main>
  );
}

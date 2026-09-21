import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your application workspace."
    >
      <SignIn path="/login" signUpUrl="/sign-up" forceRedirectUrl="/" />
    </AuthShell>
  );
}

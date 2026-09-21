import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Keep your job applications in one place."
    >
      <SignUp path="/sign-up" signInUrl="/login" forceRedirectUrl="/" />
    </AuthShell>
  );
}

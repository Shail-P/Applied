import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Applied — Your job search, organized",
  description:
    "Turn job postings into an organized application tracker with AI-assisted review.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <ClerkProvider
          appearance={{
            variables: { colorPrimary: "#1d1d1f", borderRadius: "0.875rem" },
            elements: {
              card: "bg-transparent shadow-none",
              cardBox: "w-full shadow-none",
              rootBox: "w-full",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

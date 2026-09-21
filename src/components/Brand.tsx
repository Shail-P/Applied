import Link from "next/link";
import { Layers2 } from "lucide-react";

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="Applied home"
    >
      <span className="surface flex size-9 items-center justify-center rounded-xl text-zinc-700">
        <Layers2 size={18} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-tight">Applied</span>
    </Link>
  );
}

import Link from "next/link";
import { ChevronRightIcon } from "./Icons";

interface OutlineLinkProps {
  href: string;
  children: React.ReactNode;
}

export function OutlineLink({ href, children }: OutlineLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border-2 border-nobilva-accent text-nobilva-accent font-bold text-base px-6 py-3 rounded-lg hover:bg-nobilva-accent hover:text-white transition-all"
    >
      {children}
      <ChevronRightIcon size="sm" />
    </Link>
  );
}

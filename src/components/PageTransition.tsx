"use client";

import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main key={pathname} className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 page-enter">
      {children}
    </main>
  );
}

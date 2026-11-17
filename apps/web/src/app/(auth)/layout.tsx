import type { ReactNode } from "react";
import { CampusOSLogo } from "@/components/brand/campusos-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <CampusOSLogo className="h-11 max-w-[280px]" priority />
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
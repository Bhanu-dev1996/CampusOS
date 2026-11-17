import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/campusos-logo-full.svg";
const LOGO_WIDTH = 1652;
const LOGO_HEIGHT = 382;

export function CampusOSLogo({
  className,
  priority = false,
  fetchPriority,
}: {
  className?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
}) {
  const eager = priority;
  return (
    <Image
      src={LOGO_SRC}
      alt="CampusOS"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={eager}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={fetchPriority ?? (eager ? "high" : undefined)}
      unoptimized
      className={cn("h-auto w-auto max-w-full object-contain object-left", className)}
    />
  );
}
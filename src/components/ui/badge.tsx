import { cn } from "@/lib/utils";

const tones = {
  live: "bg-accent/20 text-accent",
  ok: "bg-accent/15 text-accent",
  warn: "bg-warn/20 text-warn",
  danger: "bg-danger/20 text-danger",
  muted: "bg-raised text-muted",
} as const;

export function Badge({
  tone = "muted",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white p-6", className)}>
      {children}
    </div>
  );
}

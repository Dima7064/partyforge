import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative bg-forge-surface border border-forge-border rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(201,162,39,0.1)] overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-forge-gold/30 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-forge-gold/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-forge-gold/30 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-forge-gold/30 rounded-br-lg pointer-events-none" />
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 border-b border-forge-border bg-black/10", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-forge-gold-light text-shadow-[0_0_10px_rgba(201,162,39,0.3)]", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-forge-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 border-t border-forge-border flex gap-2 bg-black/10", className)} {...props} />;
}
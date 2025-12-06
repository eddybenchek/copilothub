"use client";

import { cn } from "@/lib/utils";
import React from "react";

type CardBaseProps = React.HTMLAttributes<HTMLDivElement>;

export function CardBase({ className, ...props }: CardBaseProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#1c1f25] bg-[#0f1117] p-4 transition-all hover:border-[#2a2d33] hover:shadow-md/10",
        className
      )}
      {...props}
    />
  );
}


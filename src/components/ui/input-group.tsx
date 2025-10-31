import * as React from "react"

import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("input-group relative flex flex-wrap items-stretch w-full", className)}
    {...props}
  />
))
InputGroup.displayName = "InputGroup"

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex items-center justify-center px-4 text-sm text-muted-foreground whitespace-nowrap rounded-r-md border border-l-0 border-input bg-muted",
      "rtl:rounded-l-md rtl:rounded-r-none rtl:border-l-input rtl:border-r-0",
      className
    )}
    {...props}
  />
))
InputGroupText.displayName = "InputGroupText"

export { InputGroup, InputGroupText }

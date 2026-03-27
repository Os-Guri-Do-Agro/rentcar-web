import React from "react"
import { cn } from "@/lib/utils"

const Dialog = ({ open, onOpenChange, children, maxWidth = "max-w-lg" }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => onOpenChange(false)}
      />
      <div className={cn("relative z-50 w-full p-4", maxWidth)}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "relative w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 duration-200 animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className
    )}
    {...props}
  />
)

const DialogTitle = ({ className, ...props }) => (
  <h3
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
)

const DialogDescription = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
)

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
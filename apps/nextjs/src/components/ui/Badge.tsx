import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-spice-green text-white shadow-sm hover:bg-spice-green-dark",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive: "bg-red-100 text-red-800 hover:bg-red-200",
        success: "bg-green-100 text-green-800 hover:bg-green-200",
        warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        info: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        outline: "border-2 border-spice-green text-spice-green hover:bg-spice-green hover:text-white",
        gradient: "bg-gradient-to-r from-spice-green to-spice-cinnamon text-white shadow-glow-green",
        verified: "bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg animate-glow",
        premium: "bg-gradient-to-r from-purple-400 to-pink-600 text-white shadow-lg",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="text-inherit">{icon}</span>}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
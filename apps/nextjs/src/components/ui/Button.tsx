import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-spice-cinnamon text-white hover:bg-spice-cinnamon/90 shadow-lg hover:shadow-xl hover:glow-orange focus-visible:ring-orange-500",
        primary: "bg-spice-green text-white hover:bg-spice-green-dark shadow-lg hover:shadow-xl hover:glow-green focus-visible:ring-green-500",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 hover:border-gray-300",
        outline: "border-2 border-spice-green text-spice-green hover:bg-spice-green hover:text-white transition-colors duration-200",
        ghost: "text-spice-green hover:bg-spice-green/10 hover:text-spice-green-dark",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl",
        gradient: "bg-gradient-to-r from-spice-green to-spice-cinnamon text-white hover:from-spice-green-dark hover:to-orange-600 shadow-lg hover:shadow-xl",
        glassmorphism: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-lg hover:shadow-xl",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-14 px-8 py-4 text-lg",
        icon: "h-10 w-10 rounded-full",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "cursor-pointer hover:scale-105",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(buttonVariants({ variant, size, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {leftIcon && !loading && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !loading && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// Utility for merging tailwind classes
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

// --- BUTTON COMPONENT ---
const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 shadow-sm",
        accent: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
        outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
        success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm"
    }

    const sizes = {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10"
    }

    return (
        <button
            ref={ref}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
})
Button.displayName = "Button"


// --- CARD COMPONENT ---
const Card = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden transition-all duration-300 hover:shadow-soft-lg",
            className
        )}
        {...props}
    >
        {children}
    </div>
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    >
        {children}
    </div>
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("font-bold text-lg text-gray-900", className)}
        {...props}
    >
        {children}
    </h3>
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-gray-500", className)}
        {...props}
    >
        {children}
    </p>
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
        {children}
    </div>
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    >
        {children}
    </div>
))
CardFooter.displayName = "CardFooter"


// --- BADGE COMPONENT ---
const Badge = React.forwardRef(({ className, variant = "default", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105 active:scale-95"

    const variants = {
        default: "border-transparent bg-gray-900 text-white shadow-sm",
        secondary: "border-transparent bg-gray-100 text-gray-900",
        destructive: "border-transparent bg-red-500 text-white shadow-sm",
        outline: "text-gray-900 border-gray-300",
        success: "border-green-200 bg-green-50 text-green-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        info: "border-blue-200 bg-blue-50 text-blue-700"
    }

    return (
        <div ref={ref} className={cn(baseStyles, variants[variant], className)} {...props}>
            {children}
        </div>
    )
})
Badge.displayName = "Badge"


// --- INPUT COMPONENT ---
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"


export {
    Button,
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
    Badge,
    Input
}
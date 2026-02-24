import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
        const base = 'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl'

        const variants = {
            primary: 'bg-[#1a1a1a] text-white hover:bg-[#2d2d2d]',
            secondary: 'bg-[#f0f0f0] text-[#1a1a1a] hover:bg-[#e5e5e5]',
            ghost: 'text-[#6b7280] hover:bg-[#f0f0f0] hover:text-[#1a1a1a]',
            outline: 'border border-[#e5e5e5] bg-white text-[#1a1a1a] hover:bg-[#fafafa]',
            danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
        }

        const sizes = {
            sm: 'text-xs px-3 py-1.5 gap-1.5',
            md: 'text-sm px-4 py-2 gap-2',
            lg: 'text-sm px-5 py-2.5 gap-2',
        }

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {loading && (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
export default Button

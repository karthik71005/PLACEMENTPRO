import { forwardRef } from "react";
import Spinner from "./Spinner";

const VARIANTS = {
    primary: "bg-black hover:bg-gray-800 text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000]",
    secondary: "bg-white hover:bg-gray-50 text-black border-2 border-black shadow-[4px_4px_0px_0px_#000000]",
    danger: "bg-[#E53955] hover:bg-[#bc223a] text-white border-2 border-black shadow-[4px_4px_0px_0px_#000000]",
    ghost: "bg-transparent hover:bg-gray-100 text-black border-2 border-transparent hover:border-black",
};

const SIZES = {
    sm: "px-4 py-2 text-xs font-bold uppercase tracking-wider",
    md: "px-6 py-3 text-sm font-bold uppercase tracking-wider",
    lg: "px-8 py-4 text-base font-bold uppercase tracking-wider",
};

const Button = forwardRef(function Button(
    {
        children,
        variant = "primary",
        size = "md",
        loading = false,
        disabled = false,
        className = "",
        ...props
    },
    ref
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2 rounded-none
        transition-all duration-150 focus:outline-none focus:ring-0 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] || VARIANTS.primary}
        ${SIZES[size] || SIZES.md}
        ${className}
      `}
            {...props}
        >
            {loading && <Spinner size="sm" className="text-current" />}
            {children}
        </button>
    );
});

export default Button;

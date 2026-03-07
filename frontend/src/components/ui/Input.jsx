import { forwardRef } from "react";

const Input = forwardRef(function Input(
    {
        label,
        error,
        helperText,
        id,
        className = "",
        required,
        ...props
    },
    ref
) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label
                    className="text-sm font-bold tracking-wider uppercase text-black"
                >
                    {label}
                    {required && <span className="text-danger ml-0.5">*</span>}
                </label>
            )}
            <input
                ref={ref}
                id={inputId}
                className={`
          w-full px-4 py-3 text-sm font-medium rounded-none border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_#000000]
          focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none
          transition-all placeholder-gray-500
          ${error ? "border-[#E53955]" : ""}
          disabled:bg-gray-100 disabled:text-gray-500
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="text-xs text-danger mt-0.5">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
            )}
        </div>
    );
});

export default Input;

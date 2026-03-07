import { forwardRef } from "react";

const Select = forwardRef(function Select(
    { label, error, helperText, id, options = [], placeholder, required, className = "", ...props },
    ref
) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={selectId} className="text-sm font-bold tracking-wider uppercase text-black">
                    {label}
                    {required && <span className="text-danger ml-0.5">*</span>}
                </label>
            )}
            <select
                ref={ref}
                id={selectId}
                className={`
          w-full px-4 py-3 text-sm font-medium rounded-none border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_#000000]
          focus:outline-none focus:ring-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none
          transition-all
          ${error ? "border-[#E53955]" : ""}
          disabled:bg-gray-100 disabled:text-gray-500
          ${className}
        `}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => {
                    const value = typeof opt === "string" ? opt : opt.value;
                    const labelText = typeof opt === "string" ? opt : opt.label;
                    return (
                        <option key={value} value={value}>
                            {labelText}
                        </option>
                    );
                })}
            </select>
            {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
            {helperText && !error && <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>}
        </div>
    );
});

export default Select;

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "Escape") onClose?.();
        },
        [onClose]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Panel */}
            <div
                className={`relative w-full ${maxWidth} bg-white rounded-none border-[3px] border-black shadow-[12px_12px_0px_0px_#000000] animate-fade-in`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 id="modal-title" className="text-xl font-black uppercase tracking-wider text-black">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>,
        document.body
    );
}

const STATUS_COLORS = {
    complete: "bg-primary-600",
    current: "bg-primary-600",
    pending: "bg-gray-300",
    rejected: "bg-danger",
};

export default function StepperProgress({ steps = [], currentStep = 0, rejectedAt = null }) {
    return (
        <div className="flex items-center gap-0">
            {steps.map((step, idx) => {
                const isComplete = idx < currentStep;
                const isCurrent = idx === currentStep;
                const isRejected = rejectedAt !== null && idx === rejectedAt;

                const circleColor =
                    isRejected ? STATUS_COLORS.rejected
                        : isComplete ? STATUS_COLORS.complete
                            : isCurrent ? STATUS_COLORS.current
                                : STATUS_COLORS.pending;

                return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                        {/* Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300 transform ${isCurrent ? 'scale-110 shadow-md ring-2 ring-primary-100' : 'scale-100'} ${circleColor}`}
                            >
                                {isRejected ? "✕" : isComplete ? "✓" : idx + 1}
                            </div>
                            <span className="mt-1 text-xs text-gray-500 whitespace-nowrap">{step}</span>
                        </div>
                        {/* Connector */}
                        {idx < steps.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 mx-1 transition-colors duration-300 mb-5 ${isComplete ? "bg-primary-600" : "bg-gray-200"}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

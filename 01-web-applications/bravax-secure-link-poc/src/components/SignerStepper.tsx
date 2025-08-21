interface SignerStep {
  label: string;
  status: "pending" | "approved" | "locked";
}

interface SignerStepperProps {
  currentStep: number;
  steps: SignerStep[];
}

export default function SignerStepper({ currentStep, steps }: SignerStepperProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Approval Workflow</h3>
      <nav aria-label="Progress">
        <ol className="space-y-4">
          {steps.map((step, stepIdx) => (
            <li key={step.label} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    stepIdx <= currentStep
                      ? step.status === "approved"
                        ? "bg-green-600"
                        : step.status === "locked"
                        ? "bg-gray-400"
                        : "bg-indigo-600"
                      : "bg-gray-200"
                  }`}
                >
                  {step.status === "approved" ? (
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : step.status === "locked" ? (
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span
                      className={`text-sm font-medium ${
                        stepIdx <= currentStep ? "text-white" : "text-gray-500"
                      }`}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${
                      stepIdx <= currentStep ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{step.status}</p>
                </div>
              </div>
              {stepIdx < steps.length - 1 && (
                <div className="ml-4 flex-1">
                  <div
                    className={`h-0.5 w-full ${
                      stepIdx < currentStep ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

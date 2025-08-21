export default function NextApproverHint({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  const done = currentStep >= steps.length;
  const text = done ? "All approvals complete." : `Next required approver: ${steps[currentStep]}`;
  return (
    <div className="mt-3 text-sm text-gray-600">
      {text}
    </div>
  );
}

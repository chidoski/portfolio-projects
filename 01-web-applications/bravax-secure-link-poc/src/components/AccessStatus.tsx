import type { Role } from "../types";

export default function AccessStatus({ isGuest, role }: { isGuest: boolean; role?: Role }) {
  if (isGuest) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-800">
        <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
        Guest — Temporary Access
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
      <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
      Enrolled — {role ?? "User"}
    </div>
  );
}

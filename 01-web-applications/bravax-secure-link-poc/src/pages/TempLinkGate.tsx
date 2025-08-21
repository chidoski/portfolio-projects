import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tokens } from "../mocks/tokens";
import { useSession } from "../state/SessionContext";
import GateVerify from "../components/GateVerify";

export default function TempLinkGate() {
  const { token } = useParams<{ token: string }>();
  const nav = useNavigate();
  const { setSession } = useSession();
  const [valid, setValid] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !(token in tokens)) {
      nav("/error?code=token_invalid", { replace: true });
      return;
    }
    setValid(true);
    setMessageId(tokens[token as keyof typeof tokens].messageId);
  }, [token, nav]);

  if (!valid) return null;

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-lg font-semibold mb-2">Verify to open Secure Link</h1>
      <p className="text-sm text-gray-600 mb-4">Enter the 6-digit code sent to your email.</p>
      <GateVerify
        onSuccess={() => {
          setSession({
            userEmail: "guest@vendor.com",
            isEnrolled: false,
            restrictedView: true,
            role: "Viewer",
          });
          nav(`/portal/${messageId}`, { replace: true });
        }}
      />
    </div>
  );
}
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tokens, type TokenKey } from "../mocks/tokens";
import { useSession } from "../state/SessionContext";

export default function MagicLinkGate() {
  const { token } = useParams<{ token: string }>();
  const nav = useNavigate();
  const { setSession } = useSession();

  useEffect(() => {
    const key = (token ?? "") as TokenKey;
    if (!token || !(key in tokens)) {
      nav("/error?code=token_invalid", { replace: true });
      return;
    }

    const info = tokens[key];
    setSession({
      userEmail: "demo@buyer.com",
      isEnrolled: true,
      restrictedView: false,
      role: info.role,
    });
    nav(`/portal/${info.messageId}`, { replace: true });
  }, [token, nav, setSession]);

  return <div>Opening secure link…</div>;
}
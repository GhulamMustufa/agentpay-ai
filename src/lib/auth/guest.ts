import { AuthSession } from "./types";

export function getGuestDemoSession(): AuthSession {
  return {
    user: {
      id: "judge-eval-session-1",
      name: "Hackathon Judge (Guest Mode)",
      email: "judge@hackathon-eval.local",
      role: "judge",
      avatar: "https://avatar.vercel.sh/judge",
    },
    isAuthenticated: true,
    isGuestDemo: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

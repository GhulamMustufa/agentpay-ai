export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "judge" | "user";
  avatar?: string;
}

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  isGuestDemo: boolean;
  expiresAt: string;
}

export type UserRole = "admin" | "warga";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar: string | null;
}

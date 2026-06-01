import { ADMIN_EMAILS } from "../config/app.js";

export const getUserRole = session => {
  const metadataRole = session?.user?.user_metadata?.role;
  if (metadataRole) return metadataRole;

  const email = session?.user?.email?.toLowerCase();
  if (email && ADMIN_EMAILS.includes(email)) return "admin";

  return session?.user ? "member" : "guest";
};

export const isAdminSession = session => getUserRole(session) === "admin";

export const canAccessAdmin = session => isAdminSession(session);

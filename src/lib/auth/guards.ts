import "server-only";

import { redirect } from "next/navigation";
import { getSessionRole } from "./session";

export async function requireUser() {
  const role = await getSessionRole();
  if (!role) redirect("/login");
  return role;
}

export async function requireAdmin() {
  const role = await getSessionRole();
  if (role !== "admin") redirect("/login");
  return role;
}

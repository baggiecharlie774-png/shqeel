"use client";

export function dashboardForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "technician") return "/tech";
  return "/client";
}

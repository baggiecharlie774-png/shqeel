import { requireProfile } from "@/lib/auth";
import { TechProfileForm } from "./tech-profile-form";

export default async function TechProfilePage() {
  const { profile } = await requireProfile(["technician"]);
  return <TechProfileForm profile={profile} />;
}

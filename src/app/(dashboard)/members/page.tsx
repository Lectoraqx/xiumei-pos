import { getMembers } from "./actions";
import MembersClient from "./members-client";
import { auth } from "@/auth";

export default async function MembersPage() {
  await auth(); 

  const members = await getMembers();

  return (
    <MembersClient initialMembers={members} />
  );
}
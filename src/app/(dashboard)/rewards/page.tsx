import { getRewards } from "./actions";
import RewardsClient from "./rewards-client";
import { auth } from "@/auth";

export default async function RewardsPage() {
  await auth();
  const rewards = await getRewards();
  return <RewardsClient initialRewards={rewards} />;
}
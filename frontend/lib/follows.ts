import { supabase } from "@/lib/supabase";

export type FollowCounts = {
  followers: number;
  following: number;
};

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const [{ count: followersCount, error: followersError }, { count: followingCount, error: followingError }] =
    await Promise.all([
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    ]);

  if (followersError) throw followersError;
  if (followingError) throw followingError;

  return {
    followers: followersCount ?? 0,
    following: followingCount ?? 0,
  };
}

export async function listFollowingIds(followerId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", followerId);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.following_id as string));
}

export async function followUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase.from("follows").insert({
    follower_id: followerId,
    following_id: followingId,
  });
  if (error) throw error;
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) throw error;
}


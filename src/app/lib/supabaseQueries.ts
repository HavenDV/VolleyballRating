import { createClient } from '@/app/utils/supabase/client';

const supabase = createClient();

export type User = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

export type DB_RandomVotePair = {
  player_a_id: number;
  player_a_first_name: string;
  player_a_last_name: string | null;
  player_a_photo_url: string | null;
  player_a_username: string | null;
  player_b_id: number;
  player_b_first_name: string;
  player_b_last_name: string | null;
  player_b_photo_url: string | null;
  player_b_username: string | null;
};

export type VotePair = {
  playerA: User;
  playerB: User;
};

export async function getRandomVotePair(voterId: number): Promise<VotePair[]> {
  const { data, error } = await supabase
    .rpc("get_random_vote_pair", { voter_id_param: voterId });

  if (error) {
    console.error("Error fetching vote pair:", error);
    throw error;
  }

  return data?.map((pair: DB_RandomVotePair) => ({
    playerA: {
      id: pair.player_a_id,
      firstName: pair.player_a_first_name,
      lastName: pair.player_a_last_name,
      photoUrl: pair.player_a_photo_url,
      username: pair.player_a_username,
    },
    playerB: {
      id: pair.player_b_id,
      firstName: pair.player_b_first_name,
      lastName: pair.player_b_last_name,
      photoUrl: pair.player_b_photo_url,
      username: pair.player_b_username,
    }
  })) ?? [];
}

export async function submitVote(voterId: number, playerA: number, playerB: number, winnerId: number | null) {
  const { error } = await supabase.from("votes").insert([{ voter_id: voterId, player_a: playerA, player_b: playerB, winner_id: winnerId }]);

  if (error) {
    console.error("Error submitting vote:", error);
    return false;
  }

  return true;
}
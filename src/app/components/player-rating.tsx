"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/app/utils/supabase/client";
import { useTheme } from "../context/theme-context";
import { tv, commonVariants } from "../utils/theme-variants";

// Type for a player's rating info returned by the stored procedure
export type PlayerRating = {
  id: number;
  first_name: string;
  last_name: string | null;
  username: string | null;
  photo_url: string | null; // Optional: you can include this in your stored procedure or join with users
  rating: number;
};

export default function RatingTable() {
  const [ratings, setRatings] = useState<PlayerRating[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { colorScheme } = useTheme();
  
  // Получаем стили на основе текущей темы
  const styles = tv(commonVariants, colorScheme);

  // Create Supabase client instance
  const supabase = createClient();

  // Fetch ratings from Supabase by calling the stored procedure
  useEffect(() => {
    async function fetchRatings() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.rpc("calculate_player_ratings");
      if (error) {
        console.error("Error fetching ratings:", error);
        setError(error.message);
      } else {
        setRatings(data as PlayerRating[]);
      }
      setLoading(false);
    }
    fetchRatings();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px] w-full">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className={`text-center text-base ${styles.text} p-4`}>Error: {error}</p>;
  }

  return (
    <div className={`w-full max-w-md mx-auto mt-8 ${styles.cardBg} rounded-lg shadow-sm overflow-hidden`}>
      <h2 className={`text-xl font-bold p-4 ${styles.headerBg} ${styles.text} text-center border-b ${styles.border}`}>
        Player Ratings
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${styles.tableHeaderBg} text-sm`}>
              <th className={`py-2 px-3 text-left font-medium ${styles.tableHeaderText}`}>Rank</th>
              <th className={`py-2 px-3 text-left font-medium ${styles.tableHeaderText}`}>Avatar</th>
              <th className={`py-2 px-3 text-left font-medium ${styles.tableHeaderText}`}>Name</th>
              <th className={`py-2 px-3 text-left font-medium ${styles.tableHeaderText}`}>Username</th>
              <th className={`py-2 px-3 text-right font-medium ${styles.tableHeaderText}`}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((player, index) => (
              <tr key={player.id} className={`border-t ${styles.tableBorder} ${styles.tableRowHover}`}>
                <td className={`py-3 px-3 text-sm ${styles.text}`}>{index + 1}</td>
                <td className="py-3 px-3">
                  <div className="w-8 h-8 relative">
                    <Image
                      src={player.photo_url || "/default-avatar.svg"}
                      alt={player.first_name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                </td>
                <td className={`py-3 px-3 text-sm ${styles.text}`}>
                  {player.first_name} {player.last_name || ""}
                </td>
                <td className={`py-3 px-3 text-xs ${styles.secondaryText}`}>
                  {player.username ? "@" + player.username : "No username"}
                </td>
                <td className={`py-3 px-3 text-right font-medium ${styles.text}`}>{player.rating.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
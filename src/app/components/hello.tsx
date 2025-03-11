'use client';

import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { isTMA, RetrieveLPResult } from '@telegram-apps/bridge';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';
import Vote from './vote';
import PlayerRating from './player-rating';

const supabase = createClient();

export default function Hello() {
  const [launchParams, setLaunchParams] = useState<RetrieveLPResult | null>(null);

  useEffect(() => {
    if (isTMA()) {
      const launchParams = retrieveLaunchParams();

      setLaunchParams(launchParams);

      if (launchParams?.tgWebAppData?.user) {
        const { id, first_name, last_name, username, photo_url } = launchParams.tgWebAppData.user;

        updateUserInSupabase(id, first_name, last_name, username, photo_url);
      }
    }
  }, []);

  async function updateUserInSupabase(id: number, first_name: string, last_name: string | undefined, username: string | undefined, photo_url: string | undefined) {
    const { error } = await supabase
      .from('users')
      .upsert([{ id, first_name, last_name, username, photo_url }], { onConflict: 'id' });

    if (error) {
      console.error('Error updating user in Supabase:', error);
    }
  }

  return (
    <div className="max-w-full w-full mx-auto px-4 py-2 flex flex-col items-center bg-gray-50 min-h-screen">
      <div className="w-full max-w-md flex items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
        <Image 
          src={launchParams?.tgWebAppData?.user?.photo_url ?? "/default-avatar.svg"} 
          alt="User Photo" 
          width={60} 
          height={60} 
          className="rounded-full border-2 border-gray-200"
        />
        <h1 className="text-xl font-medium">
          Hello, {launchParams?.tgWebAppData?.user?.first_name || 'Player'}!
        </h1>
      </div>
      <Vote voterId={launchParams?.tgWebAppData?.user?.id ?? 482553595} />
      <PlayerRating />
    </div>
  );
}
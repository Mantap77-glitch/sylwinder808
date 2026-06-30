"use client";

import { useState } from "react";

import { GameGrid } from "@/components/site/game-grid";
import { PlayerAuthDialogs } from "@/components/site/player-auth-dialogs";

type Game = {
  id: string;
  name: string;
  slug: string;
  category: string;
  provider: string;
};

type LandingGameProviderSectionProps = {
  games: Game[];
};

export function LandingGameProviderSection({
  games,
}: LandingGameProviderSectionProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <GameGrid
        games={games}
        onProviderSelect={() => {
          setLoginOpen(true);
        }}
      />

      <PlayerAuthDialogs
        loginOpen={loginOpen}
        registerOpen={registerOpen}
        onLoginOpenChange={setLoginOpen}
        onRegisterOpenChange={setRegisterOpen}
      />
    </>
  );
}
"use client";
import UserForm from "@/components/userForm";
import Header from "@/components/Header";
import TraderSelection from "@/components/TraderSelection";
import useSharedGameStatus from "../hook/useGameStatus";
import ChatSession from "@/components/ChatSession";
import GameOver from "@/components/GameOver";

import AudioPlayer from "@/audFiles/AudioPlayer";
import PlayAudioProvider from "@/audFiles/PlayAudioProvider";

export default function Play() {
  const { gameStatus, setGameStatus } = useSharedGameStatus();
  return (
    <PlayAudioProvider playHomeSong={false}>
      <div>
        <Header />
        <AudioPlayer />
        {gameStatus === "start-screen" && <UserForm />}
        {gameStatus === "trader-selection" && <TraderSelection />}
        {gameStatus === "chat-session" && <ChatSession />}
        {gameStatus === "game-over" && <GameOver />}
      </div>
    </PlayAudioProvider>
      
  );
}

"use client";
import UserForm from "@/components/UserForm";
import Header from "@/components/Header";
import TraderSelection from "@/components/TraderSelection";
import useSharedGameStatus from "../hook/useGameStatus";

export default function Play() {
  const { gameStatus, setGameStatus } = useSharedGameStatus();
  return (
    <div>
      <Header />
      {gameStatus === "start-screen" && <UserForm />}
      {gameStatus === "trader-selection" && <TraderSelection />}
    </div>
  );
}

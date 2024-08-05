"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useSharedGameStatus from "@/app/hook/useGameStatus";
import useSharedItemStatus from "@/app/hook/useItemStatus";
import useSharedItemPriceStatus from "@/app/hook/useItemPriceStatus";
import useUserNameStatus from "@/app/hook/useUserName";
import useSharedLevelStatus from "@/app/hook/useLevelStatus";
import { useRouter } from "next/navigation";
import useLeaderboardPosition from "@/app/hook/useLeaderboardPosition";


const GameOver = () => {
    const { setGameStatus } = useSharedGameStatus();
    const { itemStatus , setItemStatus} = useSharedItemStatus();
    const { itemPriceStatus, setItemPriceStatus } = useSharedItemPriceStatus();
    const { userNameStatus } = useUserNameStatus();
    const { levelStatus, setLevelStatus} = useSharedLevelStatus();
    const position = useLeaderboardPosition(userNameStatus);
    const router = useRouter();

    const [userInput, setUserInput] = useState<string>("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (userInput.toLowerCase() === "yes"){
            setGameStatus("start-screen");
        } else if (userInput.toLowerCase() === "no") {
            setGameStatus("start-screen");
            router.push("/");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black">
            <div className="text-center mb-4">
                <h1 className="font-bold text-purple-600" style={{ fontSize: '9rem' }}>
                    YOU FAILED
                </h1>
            </div>
            {position !== null && (
                <div className="text-center mb-4">
                    <p className="text-2x1 text-white">
                        Your leaderboard position: {position}
                    </p>
                </div>
            )}
            <div className="text-center mb-4">
                <p className="text-2x1 text-white">
                    Do you want to try again?
                </p>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e: any) => setUserInput(e.target.value)}
                    placeholder="(yes/no)"
                    required
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default GameOver;
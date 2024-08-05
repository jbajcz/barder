"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "@/components/Header";
import useLeaderboardPosition from "../hook/useLeaderboardPosition";
import useSharedUserNameStatus from "../hook/useUserName";
import useSharedItemPriceStatus from "../hook/useItemPriceStatus";

interface LeaderboardEntry {
    username: string;
    money: number;
}

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [showMore, setShowMore] = useState<boolean>(false);
    const { userNameStatus } = useSharedUserNameStatus();
    const position = useLeaderboardPosition(userNameStatus);
    const { itemPriceStatus } = useSharedItemPriceStatus();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/leaderboard");
                setLeaderboard(response.data.slice(0,10));
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };

        fetchLeaderboard();
    }, []);


    return (
        <div className="flex flex-col min-h-dvh bg-[#1a1a1a] text-white">
            <Header />
            <h1 className="mt-16 text-3xl font-bold mb-20 text-purple-600 text-center">
                Leaderboard
            </h1>
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-0 py-3 pl-20 text-xs font-medium text-gray-300 uppercase tracking-wider text-center">
                            Pos
                        </th>
                        <th className="px-0 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ">
                            Username
                        </th>
                        <th className="px-0 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ">
                            Money Made
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                    {leaderboard.map((entry, index) => (
                        <tr key={index}>
                            <td className="px-0 py-4 pl-20 whitespace-nowrap text-center">
                                {index+1}
                            </td>
                            <td className="px-0 py-4 whitespace-nowrap">
                                {entry.username}
                            </td>
                            <td className="px-0 py-4 whitespace-nowrap">
                                ${entry.money.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {position !== null && position > 10 && (
                        <tr className="bg-gray-700">
                            <td className = "px-0 py-4 pl-20 whitespace-nowrap text-center">
                                {position}
                            </td>
                            <td className="px-0 py-4 whitespace-nowrap">
                                {userNameStatus}
                            </td>
                            <td className="px-0 py-4 whitespace-nowrap">
                                {itemPriceStatus}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            
        </div>
    );
}
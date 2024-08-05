import { useState, useEffect } from "react";
import axios from "axios";

export default function useLeaderboardPosition(username: string) {
    const [position, setPosition] = useState<number | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:5000/leaderboard");
                const leaderboard = response.data;
                const userIndex = leaderboard.findIndex((entry: any) => entry.username === username);
                setPosition(userIndex !== -1 ? userIndex + 1 : null);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };
        fetchLeaderboard();
    }, [username]);

    return position;
}
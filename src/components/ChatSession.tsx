import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { startTradeSession } from "./message";
import useSharedGameStatus from "@/app/hook/useGameStatus";
import useSharedTraderNameStatus from "@/app/hook/useTraderStatus";
import useSharedItemStatus from "@/app/hook/useItemStatus";
import useSharedItemPriceStatus from "@/app/hook/useItemPriceStatus";
import useUserNameStatus from "@/app/hook/useUserName";
import useCurrentMood from "@/app/hook/useCurrentMood";

import "../app/styles/chatStyle.css";
import useSharedLevelStatus from "@/app/hook/useLevelStatus";
import useSharedSuccessStatus from "@/app/hook/useSuccessStatus";

interface TradeResponse {
    role: string;
    content: string
}


const ChatSession = () => {
    const { setGameStatus } = useSharedGameStatus();
    const { traderStatus, setTraderStatus } = useSharedTraderNameStatus();
    const { itemStatus , setItemStatus} = useSharedItemStatus();
    const { itemPriceStatus, setItemPriceStatus } = useSharedItemPriceStatus();
    const { userNameStatus } = useUserNameStatus();
    const { success , setSuccess } = useSharedSuccessStatus();

    const [userInput, setUserInput] = useState<string>("");

    const [responseMessage, setResponseMessage] = useState<TradeResponse[]>([]);

    const { levelStatus, setLevelStatus} = useSharedLevelStatus();
    const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false);
    const [showLevelPopup, setShowLevelPopup] = useState<boolean>(false);
    const [attempts, setAttempts] = useState<number>(36 - levelStatus)
    const {currentMood , setCurrentMood} = useCurrentMood();

    const conversationRef= useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (conversationRef.current) {
            const maxMessages = 2;
            const messages = conversationRef.current.children;
            while (messages.length > maxMessages) {
                conversationRef.current.removeChild(messages[0]);
            }
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [responseMessage]);

    const typeMessage = (msg: string) => {
        let index = 0;
        const interval = 20; // ms
        const displayMessage = (text: string) => {
            if (index < text.length) {
                setResponseMessage((prev) => {
                    if (prev.length > 0){
                        const lastMsg = { ...prev[prev.length - 1] };
                        if (text[index] !== undefined) {
                            lastMsg.content += text[index];
                        }
                        return [...prev.slice(0, -1), lastMsg];
                    } else {
                        return prev;
                    }
                    
                });
                ++index;
                setTimeout(() => displayMessage(text), interval);
            } else {
                if (success === "Trade successful" || success === "Trade failed") {
                    setIsInputDisabled(true);
                } else {
                    setIsInputDisabled(false);
                }
                
            }
        };
        displayMessage(msg);
    };
    

    const handleSubmit = async (e: any) => {
        
        e.preventDefault();
        const newMessage = { role: userNameStatus, content: userInput };
        setResponseMessage([...responseMessage, newMessage])
        setIsInputDisabled(true);
        try {
            if (userInput.toLowerCase() === "exit") {
                setGameStatus("game-over")
            }
            const data = await startTradeSession(traderStatus.name, responseMessage, userInput);
            
            setUserInput('');
            setResponseMessage((prev) => [...prev, { role: traderStatus.name, content: "" }]);
            
            typeMessage(data.trader_message.content);
            setAttempts(data.attempts);
            setCurrentMood(data.mood);
            setSuccess(data.message);
            
            


            if (data.attempts === 0){
                setIsInputDisabled(true);
                setTimeout(() => {
                    setCurrentMood("Indifferent");
                    
                    setGameStatus("game-over");
                }, 13000);
                
            } else if (data.message === "Trade successful") {
                setIsInputDisabled(true);
                setLevelStatus(data.level);
                setItemStatus(data.item.charAt(0).toUpperCase());
                setItemPriceStatus(data.value);
                setShowLevelPopup(true);
                setTimeout(() => {
                    setCurrentMood("Indifferent");
                    setShowLevelPopup(false);
                    setGameStatus("trader-selection");
                }, 13000);
                
            } else if (data.message === "Trade failed") {
                setIsInputDisabled(true);
                setLevelStatus(data.level);
                setTimeout(() => {
                    setCurrentMood("Indifferent");
                    setGameStatus("game-over");
                }, 13000);
                
            }
        } catch (error) {
            setResponseMessage([...responseMessage, { role: 'system', content: "That was not a valid message" }]);
            
        }

    };

    const getMoodStyle = () => {
        switch (currentMood) {
            case "Happy":
                return "text-green-500";
            case "Indifferent":
                return "text-yellow-500";
            case "Angry":
                return "text-red-500";
            default:
                return "text-white";
        }
    };

    const formatMessageContent = (content: string) => {
        const parts = content.split('*');
        return (
            <>
                {parts.map((part, index) => (
                    <div key={index} className={index % 2 === 0 ? 'italic' : ''}>
                        {part}
                    </div>
                ))}
            </>
            
        );
    };


    

    return (
        <div className="mx-auto max-w w-full mt-0 p-4 bg-black">
            <div className="level-display text-center mb-4 mt-6 font-bold text-white">
                <h2>
                    Level: {levelStatus}
                </h2>
            </div>
            <div className="item-info top-left">
                <h2>{userNameStatus}</h2>
                <p>Item: {itemStatus}</p>
                <p>Price: ${itemPriceStatus.toLocaleString()}</p>
            </div>
            <div className="item-info top-right">
                <h2>{traderStatus.name}</h2>
                <p>Item: {traderStatus.inventory_item}</p>
                <p>Price: ${traderStatus.inventory_value.toLocaleString()}</p>
            </div>
            <h2 className={`font-bold text-center mb-2 ${getMoodStyle()}`}>
                    {currentMood}
            </h2>
            <div className="trader-image text-center font-bold">
                
                <img 
                    src={`http://127.0.0.1:5000/static/images/traders/${traderStatus.animal}.jpg`}
                    alt="Trader"
                />
            </div>
            <h1 className="text-3x1 font-bold mb-2 text-center text-purple-600">
                Chat Session
            </h1>
            <div className="mx-auto max-w-md w-full mt-0 p-4 bg-black">
                <div className="conversation mt-4 bg-black" ref={conversationRef}>
                    <h2 className="text-2x1 font-bold mb-4 text-purple-600">
                        Conversation:
                    </h2>
                    {responseMessage.map((msg, index) => (
                        <p key={index} className="chat-message text-x1 text-white">
                            <strong>
                                {msg.role === userNameStatus ? userNameStatus : msg.role}:&nbsp;
                            </strong>
                            { formatMessageContent(msg.content) }
                        </p>
                    ))}
                </div>
                <form onSubmit={handleSubmit} className="chat-form">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e: any) => setUserInput(e.target.value)}
                        placeholder={"Start the conversation"}
                        required
                        className="chat-input"
                        disabled={isInputDisabled}
                    />
                    <button type="submit" className="chat-submit" disabled={isInputDisabled}>
                        Send
                    </button>
                    <h2 className="text-2x1 font-bold text-white">
                        Attempts: {String(attempts)}
                    </h2>
                </form>
            </div>
            
            
            {showLevelPopup && (
                <div className="level-popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="text-center p-8 bg-white rounded">
                        <h2 className="text-3x1 font-bold">
                            New Level: {levelStatus}
                        </h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatSession;
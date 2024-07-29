import axios from 'axios'

const API_URL = 'http://127.0.0.1:5000/start_trade_session';

export const startTradeSession = async (traderName: string, conversation: {role: string, content: string }[], userInput: string) => {
    try {
        const response = await axios.post(API_URL, { trader_name: traderName, conversation: conversation, user_input: userInput });
        return response.data;
    } catch (error) {
        console.error('Error starting trade session:', error);
        throw error;
    }
};
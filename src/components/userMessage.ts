import axios from "axios";


const API_URL = 'http://127.0.0.1:5000/user_create';

export const startUser = async (userName: string, userItem: string, userValue: number) => {
    try {
        axios.post(API_URL, { user_name: userName, user_item: userItem, user_value: userValue });
    } catch (error) {
        console.error('Error starting trade session:', error);
        throw error;
    }
};
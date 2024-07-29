import axios from 'axios';

export const checkUsername = async (name: string) => {

    try {
        const response = await axios.post('http://127.0.0.1:5000/checkUsername', { name: name });
        return response.data;
    } catch (error) {
        console.error('Error starting trade session:', error);
        throw error;
    }
    
}
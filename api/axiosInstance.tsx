import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://si-banjir-be.vercel.app/api',
});

// Define the expected structure of the error response
interface ErrorData {
    [key: string]: string[];
}

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        let errorMsg = 'An error occurred. Please try again.';
        
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;

            if (status === 400) {
                const errorData: ErrorData = error.response?.data; // Type assertion
                const errorMessages: string[] = [];

                for (const [key, messages] of Object.entries(errorData)) {
                    // Ensure messages is an array of strings
                    if (Array.isArray(messages)) {
                        messages.forEach((message) => {
                            errorMessages.push(`${key}: ${message}`);
                        });
                    }
                }
                errorMsg = errorMessages.join('\n');
            } else if (status && status >= 500) {
                errorMsg = 'Internal server error. Please try again later.';
            } else {
                errorMsg = error.response?.data || errorMsg;
            }
        } else {
            errorMsg = 'Network error. Please check your connection and try again.';
        }

        return Promise.reject({ error: true, msg: errorMsg });
    }
);

export default axiosInstance;

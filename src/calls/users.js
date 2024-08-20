const { axiosInstance } = require('./index');


// Register new User
export const RegisterUser = async (value) => {
    try {
        const response = await axiosInstance.post(`http://localhost:3000/register`, value);
        return response.data;
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.response?.data?.message || 'An error occurred',
        };
    }
};

// Login user
export const LoginUser = async (value) => {
    try {
        const response = await axiosInstance.post(`http://localhost:3000/login`, value);
        return response.data;
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.response?.data?.message || 'An error occurred',
        };
    }
};

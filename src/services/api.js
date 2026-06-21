import axios from 'axios';

const BASE_URL = 'https://apis.allsoft.co/api/documentManagement';

const USE_MOCK = true

export const generateOTP = async (mobile_number) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock OTP Sent" } }), 800));
    }
    return axios.post(`${BASE_URL}/generateOTP`, { mobile_number });
};

export const validateOTP = async (mobile_number, otp) => {
    if (USE_MOCK) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Allow any 4-digit code (like 1234) to pass through for testing
                if (otp === '1234') {
                    resolve({ data: { token: 'mock_authenticated_jwt_token_abc123' } });
                } else {
                    reject({ response: { data: { message: 'Invalid OTP. Use 1234 for testing.' } } });
                }
            }, 800);
        });
    }
    return axios.post(`${BASE_URL}/validateOTP`, { mobile_number, otp });
};

export const fetchTages = async (token, terms) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock Tages fetched" } }), 800));
    }
    return axios.post(`${BASE_URL}/fetchTages`, { terms }, {
        headers: { token }
    });
}

export const uploadDocument = async (token, formData) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock Document uploaded" } }), 800));
    }
    return axios.post(`${BASE_URL}/saveDocumentEntry`, formData, {
        headers: {
            token,
            'Content-Type': 'multipart/form-data'
        }
    });
}

export const searchDocuments = async (token, searchPayload) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock Documents searched" } }), 800));
    }
    return axios.post(`${BASE_URL}/searchDocumentEntry`, searchPayload, { headers: { token } });
}
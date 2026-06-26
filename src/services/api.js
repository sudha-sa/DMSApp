import axios from 'axios';

// Base URL for the document management backend API.
const BASE_URL = 'https://apis.allsoft.co/api/documentManagement';

// Toggle this to switch between mock responses and real API calls.
const USE_MOCK = true

// Send a mobile number to request an OTP.
export const generateOTP = async (mobile_number) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock OTP Sent" } }), 800));
    }
    return axios.post(`${BASE_URL}/generateOTP`, { mobile_number });
};

// Verify the OTP and return an auth token when the code is valid.
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

// Fetch tags based on the search terms provided by the app.
export const fetchTages = async (token, terms) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock Tages fetched" } }), 800));
    }
    return axios.post(`${BASE_URL}/fetchTages`, { terms }, {
        headers: { token }
    });
}

// Upload a document file together with its metadata payload.
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

// Search for archived documents using the provided filters and payload.
export const searchDocuments = async (token, searchPayload) => {
    if (USE_MOCK) {
        // Simulate API delay
        return new Promise((resolve) => setTimeout(() => resolve({ data: { message: "Mock Documents searched" } }), 800));
    }
    return axios.post(`${BASE_URL}/searchDocumentEntry`, searchPayload, { headers: { token } });
}
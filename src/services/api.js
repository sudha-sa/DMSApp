import axios from 'axios';

const BASE_URL = 'https://apis.allsoft.co/api/documentManagement';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
});

const authHeaders = (token, contentType = 'application/json') => {
    const headers = {};
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers.token = token;
    return headers;
};

export const generateOTP = async (mobile_number) => {
    return axiosInstance.post('/generateOTP', { mobile_number });
};

// Verify the OTP and return an auth token when the code is valid.
export const validateOTP = async (mobile_number, otp) => {
    return axiosInstance.post('/validateOTP', { mobile_number, otp });
};

// Fetch tags based on the search terms provided by the app.
export const fetchTages = async (token, terms) => {
    return axiosInstance.post('/fetchTages', { terms }, {
        headers: authHeaders(token),
    });
};

// Upload a document file together with its metadata payload.
export const uploadDocument = async (token, formData) => {
    return axiosInstance.post('/saveDocumentEntry', formData, {
        headers: authHeaders(token, null),
    });
};

// Search for archived documents using the provided filters and payload.
export const searchDocuments = async (token, searchPayload) => {
    return axiosInstance.post('/searchDocumentEntry', searchPayload, {
        headers: authHeaders(token),
    });
};
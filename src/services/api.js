import axios from 'axios';

const BASE_URL = 'https://apis.allsoft.co/api/documentManagement';

export const generateOTP = (mobile_number) => axios.post(`${BASE_URL}/generateOTP`, { mobile_number })

export const validateOTP = (mobile_number, otp) =>
    axios.post(`${BASE_URL}/validateOTP`, { mobile_number, otp });

export const fetchTages = (token, terms) =>
    axios.post(`${BASE_URL}/fetchTages`, { terms },
        {
            headers: { token }
        }
    )

export const uploadDocument = (token, formData) =>
    axios.post(`${BASE_URL}/saveDocumentEntry`, formData, {
        headers: {
            token,
            'Content-Type': 'multipart/form-data'
        }
    });

export const searchDocuments = (token, searchPayload) =>
    axios.post(`${BASE_URL}/searchDocumentEntry`, searchPayload, { headers: { token } });
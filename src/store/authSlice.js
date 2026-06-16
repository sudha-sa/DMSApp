import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        mobileNumber: '',
        isLoggedIn: false,
    },
    reducers: {
        setMobileNumber: (state, action) => {
            state.mobileNumber = action.payload;
        },
        loginSuccess: (state, action) => {
            state.token = action.payload;
            state.isLoggedIn = true;
        },
        logout: (state) => {
            state.token = null;
            state.mobileNumber = '';
            state.isLoggedIn = false;
        },
    },
});


export const { setMobileNumber, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
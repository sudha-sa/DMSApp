import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { generateOTP, validateOTP } from '../services/api';
import { setMobileNumber, loginSuccess } from '../store/authSlice';

const PhoneStep = memo(({ mobile, loading, onChangeMobile, onSendOTP }) => (
    <View style={styles.card}>
        <Text style={styles.label}>Enter Mobile Number</Text>
        <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={onChangeMobile}
        />
        <TouchableOpacity style={styles.button} onPress={onSendOTP} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
        </TouchableOpacity>
    </View>
));

const OtpStep = memo(({ otp, loading, onChangeOtp, onVerifyOTP, onBack }) => (
    <View style={styles.card}>
        <Text style={styles.label}>Enter OTP</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            keyboardType="number-pad"
            value={otp}
            onChangeText={onChangeOtp}
        />
        <TouchableOpacity style={styles.button} onPress={onVerifyOTP} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Change Mobile Number</Text>
        </TouchableOpacity>
    </View>
));

export default function LoginScreen() {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSendOTP = useCallback(async () => {
        if (!mobile || mobile.length < 10) {
            Alert.alert('Error', 'Please enter a valid mobile number');
            return;
        }

        setLoading(true);
        try {
            const response = await generateOTP(mobile);
            dispatch(setMobileNumber(mobile));
            setStep(2);
            const successMessage = response?.data?.message || 'OTP sent successfully!';
            Alert.alert('Success', successMessage);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    }, [dispatch, mobile]);

    const handleVerifyOTP = useCallback(async () => {
        if (!otp || otp.length < 4) {
            Alert.alert('Error', 'Please enter a valid OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await validateOTP(mobile, otp);
            const token = response.data?.token || response.data?.data?.token;
            if (!token) {
                throw new Error('Token not returned from server');
            }
            dispatch(loginSuccess(token));
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    }, [dispatch, mobile, otp]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Document Management System</Text>

            {step === 1 ? (
                <PhoneStep
                    mobile={mobile}
                    loading={loading}
                    onChangeMobile={setMobile}
                    onSendOTP={handleSendOTP}
                />
            ) : (
                <OtpStep
                    otp={otp}
                    loading={loading}
                    onChangeOtp={setOtp}
                    onVerifyOTP={handleVerifyOTP}
                    onBack={() => setStep(1)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    label: { fontSize: 16, marginBottom: 8, color: '#555', fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 6, fontSize: 16, marginBottom: 20, backgroundColor: '#fafafa' },
    button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 6, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    backButton: { marginTop: 15, alignItems: 'center' },
    backText: { color: '#007AFF', fontSize: 14 }
});
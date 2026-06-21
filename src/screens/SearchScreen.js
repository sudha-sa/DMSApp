import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { searchDocuments } from '../services/api';

const MAJOR_HEADS = [
    { label: 'Company', value: 'Company' },
    { label: 'Personal', value: 'Personal' }
];

const MINOR_HEADS = {
    Company: [{ label: 'Work Order', value: 'Work Order' }, { label: 'Invoice', value: 'Invoice' }],
    Personal: [{ label: 'ID Proof', value: 'ID Proof' }, { label: 'Medical', value: 'Medical' }]
};

export default function SearchScreen() {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    // Form Filter State
    const [majorHead, setMajorHead] = useState('');
    const [minorHead, setMinorHead] = useState('');
    const [searchTag, setSearchTag] = useState('');

    // Date Picker States
    const [fromDate, setFromDate] = useState(new Date(2026, 0, 1));
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const handleSearch = async () => {
        setLoading(true);

        // Structure mirroring the explicit template in allsoft Document Management.postman_collection (1) (1) (1).json
        const searchPayload = {
            major_head: majorHead,
            minor_head: minorHead,
            from_date: fromDate.toLocaleDateString('en-GB').replace(/\//g, '-'),
            to_date: toDate.toLocaleDateString('en-GB').replace(/\//g, '-'),
            tags: searchTag ? [{ tag_name: searchTag }] : [],
            uploaded_by: "nitin",
            start: 0,
            length: 10,
            filterId: "",
            search: { value: "" }
        };

        try {
            // Toggle to true for testing UI responses locally
            const USE_MOCK = true;

            if (USE_MOCK) {
                // Fallback Mock data array matching requirements
                setTimeout(() => {
                    setResults([
                        { id: '1', fileName: 'work_order_2026.pdf', major_head: 'Company', minor_head: 'Work Order', date: '15-05-2026', remarks: 'Q2 operational agreement file' },
                        { id: '2', fileName: 'passport_scan.png', major_head: 'Personal', minor_head: 'ID Proof', date: '20-05-2026', remarks: 'Verified copy' }
                    ]);
                    setLoading(false);
                }, 600);
                return;
            }

            const response = await searchDocuments(token, searchPayload);
            setResults(response.data?.data || []);
        } catch (error) {
            Alert.alert('Search Error', 'Failed to retrieve files from structural catalog.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (type, filename) => {
        Alert.alert(type, `${type} action triggered successfully for document: ${filename}`);
    };

    return (
        <View style={styles.container}>
            {/* Dropdown Filters Block */}
            <View style={styles.filterSection}>
                <View style={styles.row}>
                    <Dropdown
                        style={[styles.dropdown, { flex: 1, marginRight: 6 }]}
                        data={MAJOR_HEADS}
                        labelField="label"
                        valueField="value"
                        placeholder="Major Category"
                        value={majorHead}
                        onChange={item => {
                            setMajorHead(item.value);
                            setMinorHead('');
                        }}
                    />
                    <Dropdown
                        style={[styles.dropdown, { flex: 1, marginLeft: 6 }]}
                        data={majorHead ? MINOR_HEADS[majorHead] : []}
                        labelField="label"
                        valueField="value"
                        placeholder="Minor Head"
                        value={minorHead}
                        disable={!majorHead}
                        onChange={item => setMinorHead(item.value)}
                    />
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="🔍 Search tag token (e.g. RMC)"
                    value={searchTag}
                    onChangeText={setSearchTag}
                />

                {/* Date Filters Row */}
                <View style={styles.row}>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
                        <Text style={styles.dateButtonText}>From: {fromDate.toLocaleDateString('en-GB')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateButton} onPress={() => setShowToPicker(true)}>
                        <Text style={styles.dateButtonText}>To: {toDate.toLocaleDateString('en-GB')}</Text>
                    </TouchableOpacity>
                </View>

                {showFromPicker && (
                    <DateTimePicker
                        value={fromDate}
                        mode="date"
                        onChange={(event, date) => {
                            setShowFromPicker(false);
                            if (date) setFromDate(date);
                        }}
                    />
                )}

                {showToPicker && (
                    <DateTimePicker
                        value={toDate}
                        mode="date"
                        onChange={(event, date) => {
                            setShowToPicker(false);
                            if (date) setToDate(date);
                        }}
                    />
                )}

                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Execute Search Query</Text>
                </TouchableOpacity>
            </View>

            {/* Query Results FlatList Area */}
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No archived records matches your parameters yet.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.resultCard}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.fileName}>{item.fileName}</Text>
                                <Text style={styles.metaText}>{item.major_head} ➔ {item.minor_head}</Text>
                                <Text style={styles.dateText}>Archived on: {item.date}</Text>
                                {item.remarks ? <Text style={styles.remarksText}>"{item.remarks}"</Text> : null}
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity style={[styles.actionBtn, styles.previewBtn]} onPress={() => handleAction('Preview', item.fileName)}>
                                    <Text style={styles.actionBtnText}>Preview</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionBtn, styles.downloadBtn]} onPress={() => handleAction('Download', item.fileName)}>
                                    <Text style={styles.actionBtnText}>Download</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9', padding: 14 },
    filterSection: { backgroundColor: '#fff', padding: 14, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    dropdown: { height: 46, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#fff' },
    input: { borderWidth: 1, borderColor: '#dcdde1', borderRadius: 6, padding: 10, backgroundColor: '#fff', fontSize: 14, marginBottom: 12 },
    dateButton: { flex: 1, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dcdde1', padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 4 },
    dateButtonText: { color: '#2f3640', fontSize: 13, fontWeight: '500' },
    searchButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 4 },
    searchButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    resultCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardInfo: { flex: 1, marginRight: 8 },
    fileName: { fontSize: 15, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
    metaText: { fontSize: 13, color: '#718093', fontWeight: '500' },
    dateText: { fontSize: 12, color: '#a4b0be', marginTop: 2 },
    remarksText: { fontSize: 12, color: '#7f8c8d', fontStyle: 'italic', marginTop: 4 },
    cardActions: { flexDirection: 'column' },
    actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, marginVertical: 3, alignItems: 'center', width: 85 },
    previewBtn: { backgroundColor: '#f5f6fa', borderWidth: 1, borderColor: '#007AFF' },
    downloadBtn: { backgroundColor: '#28a745' },
    actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
    emptyText: { textAlign: 'center', color: '#718093', marginTop: 40, fontSize: 14 }
});
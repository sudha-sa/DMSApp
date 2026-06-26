import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { searchDocuments } from '../services/api';

// These are the top-level document categories shown in the filter dropdown.
const MAJOR_HEADS = [
    { label: 'Company', value: 'Company' },
    { label: 'Personal', value: 'Personal' }
];

// Minor heads depend on the selected major head, so we keep them grouped by category.
const MINOR_HEADS = {
    Company: [{ label: 'Work Order', value: 'Work Order' }, { label: 'Invoice', value: 'Invoice' }],
    Personal: [{ label: 'ID Proof', value: 'ID Proof' }, { label: 'Medical', value: 'Medical' }]
};

// Each list row is extracted into its own component so the FlatList stays readable.
const SearchResultItem = memo(({ item, onAction }) => (
    <View style={styles.resultCard}>
        <View style={styles.cardInfo}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.metaText}>{item.major_head} ➔ {item.minor_head}</Text>
            <Text style={styles.dateText}>Archived on: {item.date}</Text>
            {item.remarks ? <Text style={styles.remarksText}>"{item.remarks}"</Text> : null}
        </View>

        <View style={styles.cardActions}>
            <TouchableOpacity
                style={[styles.actionBtn, styles.previewBtn]}
                onPress={() => onAction('Preview', item.fileName)}
            >
                <Text style={styles.actionBtnText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.actionBtn, styles.downloadBtn]}
                onPress={() => onAction('Download', item.fileName)}
            >
                <Text style={styles.actionBtnText}>Download</Text>
            </TouchableOpacity>
        </View>
    </View>
));

// The filters section is separated from the main screen logic for cleaner component structure.
const SearchFilters = memo(({
    majorHead,
    minorHead,
    searchTag,
    fromDate,
    toDate,
    showFromPicker,
    showToPicker,
    onMajorHeadChange,
    onMinorHeadChange,
    onSearchTagChange,
    onOpenFromDate,
    onOpenToDate,
    onDateChange,
    onSearch
}) => {
    const minorHeadOptions = useMemo(() => (majorHead ? MINOR_HEADS[majorHead] : []), [majorHead]);

    return (
        <View style={styles.filterSection}>
            <View style={styles.row}>
                <Dropdown
                    style={styles.dropdownLeft}
                    data={MAJOR_HEADS}
                    labelField="label"
                    valueField="value"
                    placeholder="Major Category"
                    value={majorHead}
                    onChange={(item) => onMajorHeadChange(item.value)}
                />
                <Dropdown
                    style={styles.dropdownRight}
                    data={minorHeadOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Minor Head"
                    value={minorHead}
                    disable={!majorHead}
                    onChange={(item) => onMinorHeadChange(item.value)}
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="🔍 Search tag token (e.g. RMC)"
                value={searchTag}
                onChangeText={onSearchTagChange}
            />

            <View style={styles.row}>
                <TouchableOpacity style={styles.dateButton} onPress={onOpenFromDate}>
                    <Text style={styles.dateButtonText}>From: {fromDate.toLocaleDateString('en-GB')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateButton} onPress={onOpenToDate}>
                    <Text style={styles.dateButtonText}>To: {toDate.toLocaleDateString('en-GB')}</Text>
                </TouchableOpacity>
            </View>

            {showFromPicker && (
                <DateTimePicker
                    value={fromDate}
                    mode="date"
                    onChange={(event, date) => onDateChange('from', date)}
                />
            )}

            {showToPicker && (
                <DateTimePicker
                    value={toDate}
                    mode="date"
                    onChange={(event, date) => onDateChange('to', date)}
                />
            )}

            <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
                <Text style={styles.searchButtonText}>Execute Search Query</Text>
            </TouchableOpacity>
        </View>
    );
});

export default function SearchScreen() {
    // We read the auth token from Redux so the search request can be authenticated.
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    // These states control the filter form values entered by the user.

    const [majorHead, setMajorHead] = useState('');
    const [minorHead, setMinorHead] = useState('');
    const [searchTag, setSearchTag] = useState('');

    const [fromDate, setFromDate] = useState(new Date(2026, 0, 1));
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    // Reset the minor head when the major head changes to avoid invalid combinations.
    const handleMajorHeadChange = useCallback((value) => {
        setMajorHead(value);
        setMinorHead('');
    }, []);

    const handleMinorHeadChange = useCallback((value) => {
        setMinorHead(value);
    }, []);

    // Date picker updates are kept in a single callback to avoid repeating similar logic.
    const handleDateChange = useCallback((type, date) => {
        if (type === 'from') {
            setShowFromPicker(false);
            if (date) setFromDate(date);
        } else {
            setShowToPicker(false);
            if (date) setToDate(date);
        }
    }, []);

    // Search is wrapped in useCallback so the handler is stable across renders.
    const handleSearch = useCallback(async () => {
        if (!token) {
            Alert.alert('Authentication Error', 'Please login before searching documents.');
            return;
        }

        setLoading(true);

        const searchPayload = {
            major_head: majorHead,
            minor_head: minorHead,
            from_date: fromDate.toLocaleDateString('en-GB').replace(/\//g, '-'),
            to_date: toDate.toLocaleDateString('en-GB').replace(/\//g, '-'),
            tags: searchTag ? [{ tag_name: searchTag }] : [],
            uploaded_by: 'nitin',
            start: 0,
            length: 10,
            filterId: '',
            search: { value: '' }
        };

        try {
            const response = await searchDocuments(token, searchPayload);
            setResults(response.data?.data || []);
        } catch (error) {
            Alert.alert(
                'Search Error',
                error.response?.data?.message || error.message || 'Failed to retrieve files from structural catalog.'
            );
        } finally {
            setLoading(false);
        }
    }, [fromDate, majorHead, minorHead, searchTag, toDate, token]);

    // This placeholder action handler is used for preview/download buttons.
    const handleAction = useCallback((type, filename) => {
        Alert.alert(type, `${type} action triggered successfully for document: ${filename}`);
    }, []);

    // renderItem is memoized so FlatList does not recreate the row component unnecessarily.
    const renderResultItem = useCallback(
        ({ item }) => <SearchResultItem item={item} onAction={handleAction} />,
        [handleAction]
    );

    return (
        <View style={styles.container}>
            {/* The filter UI is separated into a child component to keep the main screen focused. */}
            <SearchFilters
                majorHead={majorHead}
                minorHead={minorHead}
                searchTag={searchTag}
                fromDate={fromDate}
                toDate={toDate}
                showFromPicker={showFromPicker}
                showToPicker={showToPicker}
                onMajorHeadChange={handleMajorHeadChange}
                onMinorHeadChange={handleMinorHeadChange}
                onSearchTagChange={setSearchTag}
                onOpenFromDate={() => setShowFromPicker(true)}
                onOpenToDate={() => setShowToPicker(true)}
                onDateChange={handleDateChange}
                onSearch={handleSearch}
            />

            {/* Loading state is shown while the search request is in progress. */}
            {loading ? (
                <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>No archived records matches your parameters yet.</Text>}
                    renderItem={renderResultItem}
                />
            )}
        </View>
    );
}

// Styles remain in one place so the screen layout is easier to manage.
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9', padding: 14 },
    filterSection: { backgroundColor: '#fff', padding: 14, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    dropdown: { height: 46, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#fff' },
    dropdownLeft: { height: 46, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#fff', flex: 1, marginRight: 6 },
    dropdownRight: { height: 46, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#fff', flex: 1, marginLeft: 6 },
    input: { borderWidth: 1, borderColor: '#dcdde1', borderRadius: 6, padding: 10, backgroundColor: '#fff', fontSize: 14, marginBottom: 12 },
    dateButton: { flex: 1, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dcdde1', padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 4 },
    dateButtonText: { color: '#2f3640', fontSize: 13, fontWeight: '500' },
    searchButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 4 },
    searchButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    loader: { marginTop: 20 },
    listContent: { paddingBottom: 20 },
    resultCard: { backgroundColor: '#fff', padding: 14, borderRadius: 8, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#007AFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardInfo: { flex: 1, marginRight: 8 },
    fileName: { fontSize: 15, fontWeight: 'bold', color: '#2f3640', marginBottom: 4 },
    metaText: { fontSize: 13, color: '#718093', fontWeight: '500' },
    dateText: { fontSize: 12, color: '#a4b0be', marginTop: 2 },
    remarksText: { fontSize: 12, color: '#7f8c8d', fontStyle: 'italic', marginTop: 4 },
    cardActions: { flexDirection: 'column' },
    actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, marginVertical: 3, alignItems: 'center', width: 85 },
    previewBtn: { backgroundColor: '#c0c1c7', borderWidth: 1, borderColor: '#007AFF' },
    downloadBtn: { backgroundColor: '#28a745' },
    actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
    emptyText: { textAlign: 'center', color: '#718093', marginTop: 40, fontSize: 14 }
});
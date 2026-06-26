import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { searchDocuments } from '../services/api';

// Importing clean modular components from components directory
import SearchFilters from '../components/SearchFilters';
import SearchResultItem from '../components/SearchResultItem';

// SearchScreen coordinates filter state, performs search requests, and renders results.
export default function SearchScreen() {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const [majorHead, setMajorHead] = useState('');
    const [minorHead, setMinorHead] = useState('');
    const [searchTag, setSearchTag] = useState('');

    const [fromDate, setFromDate] = useState(new Date(2026, 0, 1));
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const handleMajorHeadChange = useCallback((value) => {
        setMajorHead(value);
        setMinorHead('');
    }, []);

    const handleMinorHeadChange = useCallback((value) => {
        setMinorHead(value);
    }, []);

    const handleDateChange = useCallback((type, date) => {
        if (type === 'from') {
            setShowFromPicker(false);
            if (date) setFromDate(date);
        } else {
            setShowToPicker(false);
            if (date) setToDate(date);
        }
    }, []);

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

    const handleAction = useCallback((type, filename) => {
        Alert.alert(type, `${type} action triggered successfully for document: ${filename}`);
    }, []);

    const renderResultItem = useCallback(
        ({ item }) => <SearchResultItem item={item} onAction={handleAction} />,
        [handleAction]
    );

    return (
        <View style={styles.container}>
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9', padding: 14 },
    loader: { marginTop: 20 },
    listContent: { paddingBottom: 20 },
    emptyText: { textAlign: 'center', color: '#718093', marginTop: 40, fontSize: 14 }
});
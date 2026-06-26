import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

// Primary filter categories shown in the search form.
const MAJOR_HEADS = [
    { label: 'Company', value: 'Company' },
    { label: 'Personal', value: 'Personal' }
];

const MINOR_HEADS = {
    Company: [{ label: 'Work Order', value: 'Work Order' }, { label: 'Invoice', value: 'Invoice' }],
    Personal: [{ label: 'ID Proof', value: 'ID Proof' }, { label: 'Medical', value: 'Medical' }]
};

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
    // Select options for the minor head dropdown are derived from the selected major head.
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

// The SearchFilters component renders the search form and fires onSearch when the user submits filters.

const styles = StyleSheet.create({
    filterSection: { backgroundColor: '#fff', padding: 14, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    dropdownLeft: { height: 46, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#fff', flex: 1, marginRight: 6 },
    dropdownRight: { height: 46, borderColor: '#dcdde1', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, backgroundColor: '#fff', flex: 1, marginLeft: 6 },
    input: { borderWidth: 1, borderColor: '#dcdde1', borderRadius: 6, padding: 10, backgroundColor: '#fff', fontSize: 14, marginBottom: 12 },
    dateButton: { flex: 1, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dcdde1', padding: 12, borderRadius: 6, alignItems: 'center', marginHorizontal: 4 },
    dateButtonText: { color: '#2f3640', fontSize: 13, fontWeight: '500' },
    searchButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 4 },
    searchButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});

export default SearchFilters;
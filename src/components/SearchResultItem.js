import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// A single search result row showing metadata and actions for each archived document.
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

// Each action button calls back to the parent with the document filename for preview or download.
const styles = StyleSheet.create({
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
    actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#fff' }
});

export default SearchResultItem;
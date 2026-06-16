import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import * as DocumentPicker from '@react-native-documents/picker';
import { Dropdown } from 'react-native-element-dropdown';
import { uploadDocument } from '../services/api';

const MAJOR_HEADS = [
    { label: 'Company', value: 'Company' },
    { label: 'Personal', value: 'Personal' }
];

const MINOR_HEADS = {
    Company: [{ label: 'Work Order', value: 'Work Order' }, { label: 'Invoice', value: 'Invoice' }],
    Personal: [{ label: 'ID Proof', value: 'ID Proof' }, { label: 'Medical', value: 'Medical' }]
};

export default function UploadScreen() {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);

    // Form State
    const [majorHead, setMajorHead] = useState(null);
    const [minorHead, setMinorHead] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]); // Array of objects matching postman format: [{tag_name: "X"}]
    const [selectedFile, setSelectedFile] = useState(null);

    const handleAddTag = () => {
        if (tagInput.trim() !== '') {
            setTags([...tags, { tag_name: tagInput.trim() }]);
            setTagInput('');
        }
    };

    const handlePickFile = async () => {
        try {
            const [res] = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles],
            });

            // The new library returns an array containing the picked file object
            if (res) {
                setSelectedFile({
                    uri: res.uri,
                    type: res.type,
                    name: res.name,
                });
            }
        } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
                Alert.alert('Error', 'An error occurred while picking the document.');
            }
        }
    };

    const handleUpload = async () => {
        if (!majorHead || !minorHead || !selectedFile) {
            Alert.alert('Validation Error', 'Major Head, Minor Head, and File are strictly required.');
            return;
        }

        setLoading(true);

        // Formatting metadata string to strictly match your Postman Collection Example payload
        const dataPayload = {
            major_head: majorHead,
            minor_head: minorHead,
            document_date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // 12-02-2024 style
            document_remarks: remarks,
            tags: tags,
            user_id: "nitin" // Hardcoded placeholder value matching postman sample data
        };

        const formData = new FormData();
        formData.append('file', {
            uri: selectedFile.uri,
            type: selectedFile.type || 'application/octet-stream',
            name: selectedFile.name || 'upload.png',
        });
        formData.append('data', JSON.stringify(dataPayload));

        try {
            await uploadDocument(token, formData);
            Alert.alert('Success', 'Document cataloged and uploaded successfully!');
            // Reset Form State
            setMajorHead(null); setMinorHead(null); setRemarks(''); setTags([]); setSelectedFile(null);
        } catch (error) {
            Alert.alert('Upload Failed', error.response?.data?.message || 'Network submission failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Major Head *</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={MAJOR_HEADS}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Category"
                    value={majorHead}
                    onChange={item => {
                        setMajorHead(item.value);
                        setMinorHead(null); // Reset subcategory when main changes
                    }}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Minor Head *</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={majorHead ? MINOR_HEADS[majorHead] : []}
                    labelField="label"
                    valueField="value"
                    placeholder={majorHead ? "Select Subcategory" : "Select Major Head First"}
                    value={minorHead}
                    disable={!majorHead}
                    onChange={item => setMinorHead(item.value)}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter descriptive metadata notes..."
                    multiline
                    numberOfLines={3}
                    value={remarks}
                    onChangeText={setRemarks}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Tags (Press Space/Add to insert)</Text>
                <View style={styles.tagInputContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="e.g. RMC, 2026"
                        value={tagInput}
                        onChangeText={setTagInput}
                    />
                    <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                        <Text style={styles.addTagButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chipContainer}>
                    {tags.map((t, idx) => (
                        <View key={idx} style={styles.chip}>
                            <Text style={styles.chipText}>#{t.tag_name}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.formGroup}>
                <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
                    <Text style={styles.filePickerText}>
                        {selectedFile ? `✓ Selected: ${selectedFile.name}` : '📎 Attach Document File'}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleUpload} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit to Archive</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f9f9f9' },
    formGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
    dropdown: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff', fontSize: 15, marginBottom: 5 },
    textArea: { height: 70, textAlignVertical: 'top' },
    tagInputContainer: { flexDirection: 'row', alignItems: 'center' },
    addTagButton: { backgroundColor: '#007AFF', padding: 12, marginLeft: 8, borderRadius: 8 },
    addTagButtonText: { color: '#fff', fontWeight: 'bold' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
    chip: { backgroundColor: '#E1F5FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 6, marginBottom: 6 },
    chipText: { color: '#0288D1', fontWeight: '500', fontSize: 13 },
    filePicker: { borderStyle: 'dashed', borderWidth: 2, borderColor: '#007AFF', borderRadius: 8, padding: 20, alignItems: 'center', backgroundColor: '#F0F8FF' },
    filePickerText: { color: '#007AFF', fontWeight: '600' },
    submitButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
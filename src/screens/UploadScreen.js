import React, { memo, useCallback, useMemo, useState } from 'react';
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

const DropdownField = memo(({ label, value, data, placeholder, disabled, onSelect }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <Dropdown
            style={styles.dropdown}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={placeholder}
            value={value}
            disable={disabled}
            onChange={onSelect}
        />
    </View>
));

const TagInputField = memo(({ label, tagInput, tags, onTagInputChange, onAddTag }) => (
    <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.tagInputContainer}>
            <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="e.g. RMC, 2026"
                value={tagInput}
                onChangeText={onTagInputChange}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={onAddTag}>
                <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.chipContainer}>
            {tags.map((tag, index) => (
                <View key={`${tag.tag_name}-${index}`} style={styles.chip}>
                    <Text style={styles.chipText}>#{tag.tag_name}</Text>
                </View>
            ))}
        </View>
    </View>
));

const FilePickerField = memo(({ selectedFile, onPickFile }) => (
    <View style={styles.formGroup}>
        <TouchableOpacity style={styles.filePicker} onPress={onPickFile}>
            <Text style={styles.filePickerText}>
                {selectedFile ? `✓ Selected: ${selectedFile.name}` : '📎 Attach Document File'}
            </Text>
        </TouchableOpacity>
    </View>
));

const UploadForm = memo(({
    majorHead,
    minorHead,
    remarks,
    tagInput,
    tags,
    selectedFile,
    minorHeadOptions,
    onMajorHeadChange,
    onMinorHeadChange,
    onRemarksChange,
    onTagInputChange,
    onAddTag,
    onPickFile,
    onUpload,
    loading
}) => (
    <>
        <DropdownField
            label="Major Head *"
            value={majorHead}
            data={MAJOR_HEADS}
            placeholder="Select Category"
            onSelect={(item) => onMajorHeadChange(item.value)}
        />

        <DropdownField
            label="Minor Head *"
            value={minorHead}
            data={minorHeadOptions}
            placeholder={majorHead ? 'Select Subcategory' : 'Select Major Head First'}
            disabled={!majorHead}
            onSelect={(item) => onMinorHeadChange(item.value)}
        />

        <View style={styles.formGroup}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter descriptive metadata notes..."
                multiline
                numberOfLines={3}
                value={remarks}
                onChangeText={onRemarksChange}
            />
        </View>

        <TagInputField
            label="Tags (Press Space/Add to insert)"
            tagInput={tagInput}
            tags={tags}
            onTagInputChange={onTagInputChange}
            onAddTag={onAddTag}
        />

        <FilePickerField selectedFile={selectedFile} onPickFile={onPickFile} />

        <TouchableOpacity style={styles.submitButton} onPress={onUpload} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit to Archive</Text>}
        </TouchableOpacity>
    </>
));

export default function UploadScreen() {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [majorHead, setMajorHead] = useState(null);
    const [minorHead, setMinorHead] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const minorHeadOptions = useMemo(() => (majorHead ? MINOR_HEADS[majorHead] : []), [majorHead]);

    const handleAddTag = useCallback(() => {
        if (tagInput.trim() !== '') {
            setTags((prev) => [...prev, { tag_name: tagInput.trim() }]);
            setTagInput('');
        }
    }, [tagInput]);

    const handlePickFile = useCallback(async () => {
        try {
            const [res] = await DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] });
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
    }, []);

    const handleUpload = useCallback(async () => {
        if (!majorHead || !minorHead || !selectedFile) {
            Alert.alert('Validation Error', 'Major Head, Minor Head, and File are strictly required.');
            return;
        }

        setLoading(true);

        const dataPayload = {
            major_head: majorHead,
            minor_head: minorHead,
            document_date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            document_remarks: remarks,
            tags,
            user_id: 'nitin'
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
            setMajorHead(null);
            setMinorHead(null);
            setRemarks('');
            setTags([]);
            setSelectedFile(null);
        } catch (error) {
            Alert.alert('Upload Failed', error.response?.data?.message || 'Network submission failed.');
        } finally {
            setLoading(false);
        }
    }, [majorHead, minorHead, remarks, selectedFile, tags, token]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <UploadForm
                majorHead={majorHead}
                minorHead={minorHead}
                remarks={remarks}
                tagInput={tagInput}
                tags={tags}
                selectedFile={selectedFile}
                minorHeadOptions={minorHeadOptions}
                onMajorHeadChange={(value) => {
                    setMajorHead(value);
                    setMinorHead(null);
                }}
                onMinorHeadChange={setMinorHead}
                onRemarksChange={setRemarks}
                onTagInputChange={setTagInput}
                onAddTag={handleAddTag}
                onPickFile={handlePickFile}
                onUpload={handleUpload}
                loading={loading}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f9f9f9' },
    formGroup: { marginBottom: 18 },
    label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 6 },
    dropdown: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fff', fontSize: 15, marginBottom: 5 },
    tagInput: { flex: 1, marginBottom: 0 },
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
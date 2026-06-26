import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

// Strict assignment parameter values matching section 3.1 criteria
export const MAJOR_HEADS = [
    { label: 'Professional', value: 'Professional' },
    { label: 'Personal', value: 'Personal' }
];

export const MINOR_HEADS = {
    Professional: [
        { label: 'Accounts', value: 'Accounts' },
        { label: 'HR', value: 'HR' },
        { label: 'IT', value: 'IT' },
        { label: 'Finance', value: 'Finance' }
    ],
    Personal: [
        { label: 'John', value: 'John' },
        { label: 'Tom', value: 'Tom' },
        { label: 'Emily', value: 'Emily' }
    ]
};

export const DropdownField = memo(({ label, value, data, placeholder, disabled, onSelect }) => (
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

export const TagInputField = memo(({ label, tagInput, tags, onTagInputChange, onAddTag }) => (
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

export const FilePickerField = memo(({ selectedFile, onPickFile }) => (
    <View style={styles.formGroup}>
        <TouchableOpacity style={styles.filePicker} onPress={onPickFile}>
            <Text style={styles.filePickerText}>
                {selectedFile ? `✓ Selected: ${selectedFile.name}` : '📎 Attach Document File'}
            </Text>
        </TouchableOpacity>
    </View>
));

export const UploadForm = memo(({
    majorHead,
    minorHead,
    remarks,
    tagInput,
    tags,
    selectedFile,
    onMajorHeadChange,
    onMinorHeadChange,
    onRemarksChange,
    onTagInputChange,
    onAddTag,
    onPickFile,
    onUpload,
    loading
}) => {
    const minorHeadOptions = useMemo(() => (majorHead ? MINOR_HEADS[majorHead] : []), [majorHead]);

    return (
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
    );
});

const styles = StyleSheet.create({
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
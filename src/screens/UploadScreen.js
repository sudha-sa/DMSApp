import React, { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import * as DocumentPicker from '@react-native-documents/picker';
import { uploadDocument } from '../services/api';

// Importing clean modular layout from the components layer
import { UploadForm } from '../components/UploadFormComponents';

// UploadScreen manages upload form state and submits document metadata + file to the backend.

export default function UploadScreen() {
    const { token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [majorHead, setMajorHead] = useState(null);
    const [minorHead, setMinorHead] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleAddTag = useCallback(() => {
        if (tagInput.trim() !== '') {
            setTags((prev) => [...prev, { tag_name: tagInput.trim() }]);
            setTagInput('');
        }
    }, [tagInput]);

    // Add a new tag label to the current set of tags.

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

    // Pick a document file and save its URI/type/name for FormData upload.

    const handleUpload = useCallback(async () => {
        if (!majorHead || !minorHead || !selectedFile) {
            Alert.alert('Validation Error', 'Major Head, Minor Head, and File are strictly required.');
            return;
        }

        setLoading(true);

        // Build the payload for the upload endpoint, including metadata and tags.
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

    // handleUpload validates fields, creates FormData, and posts the document to the backend.

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <UploadForm
                majorHead={majorHead}
                minorHead={minorHead}
                remarks={remarks}
                tagInput={tagInput}
                tags={tags}
                selectedFile={selectedFile}
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
    container: { padding: 20, backgroundColor: '#f9f9f9' }
});
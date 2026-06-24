import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { COLORS } from '../../constants';

const DOCS = [
  { key: 'citizenship_front', label: 'Citizenship / NID — Front', required: true  },
  { key: 'citizenship_back',  label: 'Citizenship / NID — Back',  required: true  },
  { key: 'license_front',     label: "Driver's License — Front",  required: false },
  { key: 'license_back',      label: "Driver's License — Back",   required: false },
  { key: 'selfie',            label: 'Selfie with Document',      required: true  },
];

function DocSlot({ doc, uri, onPick }) {
  return (
    <View style={styles.slot}>
      <Text style={styles.docLabel}>{doc.label}{doc.required ? ' *' : ' (optional)'}</Text>
      {uri ? (
        <TouchableOpacity onPress={onPick} activeOpacity={0.85}>
          <Image source={{ uri }} style={styles.preview} />
          <Text style={styles.retake}>Tap to retake</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onPick} style={styles.pickBtn}>
          <Text style={styles.pickIcon}>📷</Text>
          <Text style={styles.pickTxt}>Camera or Gallery</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function KYCScreen() {
  const [images,  setImages]  = useState({});
  const [loading, setLoading] = useState(false);

  async function pickImage(key) {
    Alert.alert('Upload Photo', 'Choose source', [
      { text: 'Camera', onPress: () => launchCamera(key) },
      { text: 'Gallery', onPress: () => launchGallery(key) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function launchCamera(key) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Camera permission required'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 3] });
    if (!result.canceled) setImages(prev => ({ ...prev, [key]: result.assets[0].uri }));
  }

  async function launchGallery(key) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Gallery permission required'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [4, 3], mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setImages(prev => ({ ...prev, [key]: result.assets[0].uri }));
  }

  async function submit() {
    const missing = DOCS.filter(d => d.required && !images[d.key]);
    if (missing.length > 0) {
      Alert.alert('Missing Documents', `Please upload: ${missing.map(d => d.label).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      for (const [key, uri] of Object.entries(images)) {
        const filename = uri.split('/').pop();
        const ext      = filename?.split('.').pop() ?? 'jpg';
        form.append(key, { uri, name: filename, type: `image/${ext}` });
      }
      await client.post('/api/kyc/submit', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Submitted!', 'Your documents are under review. This usually takes 24–48 hours.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Upload failed. Check your connection and try again.');
    } finally { setLoading(false); }
  }

  const requiredDone = DOCS.filter(d => d.required).every(d => images[d.key]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>KYC Verification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📋 Upload clear, well-lit photos. Documents must be valid and not expired. Review takes 24–48 hours.</Text>
        </View>

        {DOCS.map(doc => (
          <DocSlot key={doc.key} doc={doc} uri={images[doc.key]} onPick={() => pickImage(doc.key)} />
        ))}

        <TouchableOpacity
          onPress={submit}
          style={[styles.btn, (!requiredDone || loading) && styles.btnDim]}
          disabled={!requiredDone || loading}
        >
          <Text style={styles.btnText}>{loading ? 'Uploading…' : 'Submit for Review'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: COLORS.gray50 },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  back:       { fontSize: 16, color: COLORS.primary },
  title:      { fontSize: 20, fontWeight: '800', color: COLORS.gray900 },
  scroll:     { padding: 16, gap: 12 },
  infoBox:    { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, marginBottom: 4 },
  infoText:   { fontSize: 13, color: '#1d4ed8', lineHeight: 20 },
  slot:       { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, gap: 10 },
  docLabel:   { fontSize: 14, fontWeight: '700', color: COLORS.gray900 },
  preview:    { width: '100%', height: 160, borderRadius: 10, resizeMode: 'cover' },
  retake:     { textAlign: 'center', color: COLORS.primary, fontSize: 12, marginTop: 6 },
  pickBtn:    { borderWidth: 1.5, borderColor: COLORS.gray200, borderRadius: 10, borderStyle: 'dashed', padding: 24, alignItems: 'center', gap: 6 },
  pickIcon:   { fontSize: 28 },
  pickTxt:    { fontSize: 13, color: COLORS.gray500 },
  btn:        { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDim:     { opacity: 0.5 },
  btnText:    { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});

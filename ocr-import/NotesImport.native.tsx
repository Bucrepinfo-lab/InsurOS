/**
 * Portable "import written notes" panel (React Native / Expo). Drop into any app.
 * Requires: expo-image-picker, expo-document-picker. Depends on ./intake.
 * onApply(parsed) receives the structured guess. Restyle via the `styles` inline.
 */
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { parseImportedNotes, type ParsedNotes } from './intake';

export function NotesImport({ onApply }: { onApply: (p: ParsedNotes) => void }) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string>();
  const [msg, setMsg] = useState<string>();

  async function pickPhoto() {
    try {
      const r = await ImagePicker.launchCameraAsync({ quality: 0.6 }).catch(() => ImagePicker.launchImageLibraryAsync({ quality: 0.6 }));
      const a = (r as any)?.assets?.[0];
      if (a) { setFileName(a.fileName ?? 'photo.jpg'); setMsg('Photo attached. Type the key points below (server OCR in production).'); }
    } catch { setMsg('Could not open the camera.'); }
  }
  async function pickFile() {
    try {
      const r: any = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'text/plain', 'image/*'] });
      const a = r?.assets?.[0];
      if (a) {
        setFileName(a.name);
        if (a.mimeType === 'text/plain' && a.uri) { try { const res = await fetch(a.uri); setText(await res.text()); return; } catch { /* ignore */ } }
        setMsg('File attached. Type the key points below.');
      }
    } catch { setMsg('Could not open the file picker.'); }
  }

  return (
    <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity onPress={pickPhoto} style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#111' }}><Text style={{ color: '#fff', textAlign: 'center' }}>Photo</Text></TouchableOpacity>
        <TouchableOpacity onPress={pickFile} style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#999' }}><Text style={{ textAlign: 'center' }}>File</Text></TouchableOpacity>
      </View>
      {!!fileName && <Text style={{ marginTop: 8, color: '#666' }}>{fileName}</Text>}
      {!!msg && <Text style={{ marginTop: 6, color: '#666' }}>{msg}</Text>}
      <TextInput multiline value={text} onChangeText={setText} style={{ minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 10 }}
        placeholder={'Present: Amina, Grace\nAgenda 1: Buy chairs\nResolved that we buy 20 chairs'} />
      <TouchableOpacity onPress={() => onApply(parseImportedNotes(text))} style={{ marginTop: 10, padding: 12, borderRadius: 8, backgroundColor: '#111' }}><Text style={{ color: '#fff', textAlign: 'center' }}>Use these notes</Text></TouchableOpacity>
    </View>
  );
}

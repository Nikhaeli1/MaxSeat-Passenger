import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { submitComplaint } from '../api/apiService';

const COMPLAINT_TYPES = [
  {
    key:   'overload',
    label: 'Passenger Overloading',
    icon:  '👥',
    desc:  'PUV is carrying more passengers than its allowed capacity.',
  },
  {
    key:   'thermal',
    label: 'Elevated Cabin Temperature',
    icon:  '🌡',
    desc:  'Cabin temperature is uncomfortably high or exceeds 37.5°C.',
  },
  {
    key:   'other',
    label: 'Other Violation',
    icon:  '⚠',
    desc:  'Describe the violation in the remarks section below.',
  },
];

export default function ComplaintScreen({ route, navigation }) {
  const { plate, puv }            = route.params;
  const [type,       setType]     = useState('');
  const [description,setDesc]     = useState('');
  const [submitting, setSubmitting]= useState(false);

  const handleSubmit = async () => {
    if (!type) {
      Alert.alert('Required', 'Please select a complaint type.');
      return;
    }
    const selected = COMPLAINT_TYPES.find(c => c.key === type);
    Alert.alert(
      'Confirm Report',
      `Submit a "${selected.label}" report for PUV ${plate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              const result = await submitComplaint(plate, type, description);
              Alert.alert(
                '✅ Report Submitted',
                `${result.message}\n\nReference: ${result.serial}`,
                [{ text: 'Done', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              const msg = err?.response?.data?.error || err.message || 'Submission failed.';
              Alert.alert('Error', msg);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Report Violation</Text>
          <Text style={styles.headerSub}>{plate}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* PUV SUMMARY (if available) */}
        {puv && (
          <View style={styles.puvSummary}>
            <Text style={styles.summaryLabel}>Reporting violation for:</Text>
            <Text style={styles.summaryPlate}>{puv.plate}</Text>
            <Text style={styles.summarySub}>{puv.route} · {puv.driver}</Text>
            <View style={styles.summaryMeta}>
              <Text style={styles.summaryChip}>👥 {puv.passengers}/{puv.capacity} pax</Text>
              <Text style={[styles.summaryChip, puv.hot && { backgroundColor: '#fef3c7', color: '#d97706' }]}>
                🌡 {puv.temp}°C
              </Text>
              {puv.overloaded && (
                <Text style={[styles.summaryChip, { backgroundColor: '#fee2e2', color: '#dc2626' }]}>OVERLOADED</Text>
              )}
            </View>
          </View>
        )}

        {/* COMPLAINT TYPE */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>📋 Type of Complaint</Text>
          <Text style={styles.sectionHint}>Select the type of violation you are reporting.</Text>
          {COMPLAINT_TYPES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.option, type === c.key && styles.optionSelected]}
              onPress={() => setType(c.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>{c.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, type === c.key && styles.optionLabelSelected]}>
                  {c.label}
                </Text>
                <Text style={styles.optionDesc}>{c.desc}</Text>
              </View>
              <View style={[styles.radio, type === c.key && styles.radioSelected]}>
                {type === c.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* DESCRIPTION */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>📝 Additional Details</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what you observed — number of standing passengers, driver behavior, exact location, etc. (optional)"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDesc}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* DISCLAIMER */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ℹ Your report will be submitted anonymously to the LTFRB enforcement system.
            False reports may be subject to penalties under LTFRB regulations.
          </Text>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitBtn, (!type || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!type || submitting}
          activeOpacity={0.85}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={styles.submitIcon}>📢 </Text>
                <Text style={styles.submitText}>Submit Report</Text>
              </>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { padding: 16 },

  header:      { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon:    { fontSize: 20, color: '#f1f5f9' },
  headerText:  { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  headerSub:   { fontSize: 12, color: '#93c5fd', fontWeight: '600', marginTop: 2 },

  puvSummary:   { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e0f2fe' },
  summaryLabel: { fontSize: 11, fontWeight: '600', color: '#2563eb', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryPlate: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  summarySub:   { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2, marginBottom: 10 },
  summaryMeta:  { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  summaryChip:  { fontSize: 12, fontWeight: '700', backgroundColor: '#f1f5f9', color: '#2563eb', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },

  card:         { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e0f2fe', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: '#2563eb', marginBottom: 12 },
  sectionHint:  { fontSize: 12, color: '#94a3b8', marginBottom: 12, marginTop: -6 },

  option:             { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#e2e8f0', marginBottom: 10, backgroundColor: '#fafafa' },
  optionSelected:     { borderColor: '#2563eb', backgroundColor: '#f1f5f9' },
  optionIcon:         { fontSize: 22 },
  optionLabel:        { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  optionLabelSelected:{ color: '#2563eb' },
  optionDesc:         { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
  radio:              { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center' },
  radioSelected:      { borderColor: '#2563eb' },
  radioDot:           { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },

  textArea: { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, padding: 14, fontSize: 14, color: '#0f172a', backgroundColor: '#f8fafc', minHeight: 110, fontWeight: '500' },

  disclaimer:     { backgroundColor: '#e0f2fe', borderRadius: 14, padding: 14, marginBottom: 16 },
  disclaimerText: { fontSize: 12, color: '#1d4ed8', fontWeight: '500', lineHeight: 18 },

  submitBtn:         { backgroundColor: '#2563eb', borderRadius: 16, height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 6, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  submitBtnDisabled: { opacity: 0.45 },
  submitIcon:        { fontSize: 18 },
  submitText:        { color: '#fff', fontSize: 16, fontWeight: '800' },
});
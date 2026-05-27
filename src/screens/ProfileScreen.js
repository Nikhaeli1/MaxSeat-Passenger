import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { updatePassengerProfile, changePassengerPassword } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [mobile,    setMobile]    = useState(user?.mobile || '');
  const [saving,    setSaving]    = useState(false);

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw]  = useState('');
  const [newPw,     setNewPw]      = useState('');
  const [confirmPw, setConfirmPw]  = useState('');
  const [pwSaving,  setPwSaving]   = useState(false);

  useFocusEffect(useCallback(() => {
    setMobile(user?.mobile || '');
  }, [user]));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePassengerProfile({ mobile });
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert('Required', 'Please fill in all password fields.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Too Short', 'Password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassengerPassword({ current_password: currentPw, new_password: newPw });
      Alert.alert('Password Changed', 'Your password has been updated.');
      setShowPwForm(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.error || 'Could not change password.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'End your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>🚌</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.username}>@{user?.username}</Text>
            <Text style={styles.role}>Passenger · Bugo–Igpit Route</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ACCOUNT INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>🪪 Account Information</Text>
          <View style={styles.infoGrid}>
            {[
              ['Full Name', user?.full_name || '—'],
              ['Username',  user?.username  || '—'],
              ['Role',      'Passenger'],
              ['Route',     'Bugo–Igpit'],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* EDITABLE */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>✏️ Edit Profile</Text>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
              placeholder="e.g. 09171234567"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
        </View>

        {/* CHANGE PASSWORD */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.pwToggleRow}
            onPress={() => setShowPwForm(v => !v)}
          >
            <Text style={styles.sectionLabel}>🔒 Change Password</Text>
            <Text style={styles.pwToggleIcon}>{showPwForm ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPwForm && (
            <View style={{ marginTop: 12 }}>
              {[
                { label: 'Current Password', value: currentPw, setter: setCurrentPw },
                { label: 'New Password',     value: newPw,     setter: setNewPw     },
                { label: 'Confirm New',      value: confirmPw, setter: setConfirmPw },
              ].map(({ label, value, setter }) => (
                <View key={label} style={{ marginBottom: 12 }}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={setter}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[styles.saveBtn, pwSaving && { opacity: 0.6 }]}
                onPress={handleChangePassword}
                disabled={pwSaving}
              >
                {pwSaving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Update Password</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutIcon}>⏻</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>MaxSeat Alert System · Cagayan de Oro City</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { padding: 16 },

  header:     { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  avatarRow:  { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar:     { width: 56, height: 56, borderRadius: 16, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  avatarIcon: { fontSize: 26 },
  name:       { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  username:   { fontSize: 12, color: '#2563eb', fontWeight: '700', marginTop: 2 },
  role:       { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 1 },

  card:         { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: '#475569', marginBottom: 14 },

  infoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem:  { width: '47%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 11, borderWidth: 1, borderColor: '#e2e8f0' },
  infoLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '800', color: '#0f172a' },

  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 7 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 12, height: 48 },
  inputIcon:  { fontSize: 16, marginRight: 8 },
  input:      { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
  textInput:  { borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 48, fontSize: 14, color: '#0f172a', fontWeight: '500' },

  saveBtn:     { backgroundColor: '#2563eb', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  pwToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pwToggleIcon:{ fontSize: 13, color: '#64748b', fontWeight: '800' },

  logoutBtn:  { backgroundColor: '#fff', borderRadius: 16, height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#fecaca', marginBottom: 14 },
  logoutIcon: { fontSize: 18, color: '#ef4444' },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '800' },

  footer: { textAlign: 'center', color: '#94a3b8', fontSize: 11, fontWeight: '500', marginBottom: 8 },
});
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert, StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Required', 'Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Login failed. Check your credentials.';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <Text style={styles.appName}>MaxSeat Alert</Text>
          <Text style={styles.appSub}>Passenger Portal</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>👤  PUV Commuter Access</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>Track your ride. Report violations. Ride safe.</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPwd(p => !p)} style={styles.peekBtn}>
                <Text style={styles.peekIcon}>{showPwd ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Log In</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          MaxSeat Alert System · Cagayan de Oro City{'\n'}
          For passengers of the Bugo–Igpit Route PUVs
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  header:      { alignItems: 'center', marginBottom: 32 },
  logoBox:     { width: 72, height: 72, borderRadius: 20, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#334155' },
  logoIcon:    { fontSize: 34 },
  appName:     { fontSize: 28, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  appSub:      { fontSize: 14, color: '#64748b', fontWeight: '600', marginTop: 4 },
  rolePill:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(37,99,235,0.15)', borderRadius: 30, paddingHorizontal: 14, paddingVertical: 6, marginTop: 14, borderWidth: 1, borderColor: 'rgba(37,99,235,0.3)' },
  rolePillText:{ fontSize: 12, fontWeight: '700', color: '#93c5fd' },

  card:      { backgroundColor: '#fff', borderRadius: 28, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  cardSub:   { fontSize: 13, color: '#64748b', fontWeight: '500', marginBottom: 24 },

  fieldGroup: { marginBottom: 18 },
  label:      { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, color: '#64748b', marginBottom: 7 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 14, backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 52 },
  inputIcon:  { fontSize: 16, marginRight: 10 },
  input:      { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '500' },
  peekBtn:    { padding: 4 },
  peekIcon:   { fontSize: 16 },

  loginBtn:         { backgroundColor: '#2563eb', borderRadius: 14, height: 54, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText:     { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },

  footer: { textAlign: 'center', color: '#334155', fontSize: 11, fontWeight: '500', marginTop: 28, lineHeight: 18 },
});
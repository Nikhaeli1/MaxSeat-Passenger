import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, StatusBar, RefreshControl,
} from 'react-native';
import { fetchPuvDetail } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import CapacityMeter from '../components/CapacityMeter';
import TempCard from '../components/TempCard';

export default function PuvDetailScreen({ route, navigation }) {
  const { plate }         = route.params;
  const { logout }        = useAuth();
  const [puv, setPuv]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await fetchPuvDetail(plate);
      setPuv(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.', [{ text: 'OK', onPress: logout }]);
      } else if (err?.response?.status === 404) {
        Alert.alert('Not Found', `PUV "${plate}" not found.`, [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
      } else {
        Alert.alert('Error', 'Could not load PUV details.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [plate, logout, navigation]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.splashText}>Loading {plate}…</Text>
      </View>
    );
  }

  if (!puv) return null;

  const isCritical = puv.overloaded || puv.hot;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerPlate}>{puv.plate}</Text>
          <Text style={styles.headerSub}>{puv.company} · {puv.route}</Text>
        </View>
        {isCritical && (
          <View style={styles.criticalPill}>
            <Text style={styles.criticalText}>⚠ ALERT</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563eb" />
        }
      >
        {/* CAPACITY METER */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>👥 Passenger Load</Text>
          <CapacityMeter
            passengers={puv.passengers}
            capacity={puv.capacity}
            loadPct={puv.load_pct}
          />
        </View>

        {/* TEMPERATURE */}
        <TempCard temp={puv.temp} hot={puv.hot} />

        {/* VEHICLE INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>🚌 Vehicle Info</Text>
          <View style={styles.infoGrid}>
            {[
              ['Plate',    puv.plate],
              ['Driver',   puv.driver],
              ['Route',    puv.route],
              ['Schedule', puv.schedule],
              ['Speed',    puv.speed],
              ['Location', puv.loc_name],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* STATUS */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>📡 Live Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: puv.overloaded ? '#ef4444' : '#22c55e' }]} />
            <Text style={styles.statusText}>
              {puv.overloaded
                ? `Overloaded by ${puv.passengers - puv.capacity} passenger${puv.passengers - puv.capacity !== 1 ? 's' : ''}`
                : `Within capacity (${puv.capacity - puv.passengers} seat${puv.capacity - puv.passengers !== 1 ? 's' : ''} available)`}
            </Text>
          </View>
          {puv.hot && (
            <View style={[styles.statusRow, { marginTop: 8 }]}>
              <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.statusText}>Cabin temperature elevated ({puv.temp}°C)</Text>
            </View>
          )}
          <Text style={styles.lastUpdate}>Last updated: {puv.last_update}</Text>
        </View>

        {/* REPORT BUTTON */}
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => navigation.navigate('Complaint', { plate: puv.plate, puv })}
          activeOpacity={0.85}
        >
          <Text style={styles.reportIcon}>📢 </Text>
          <Text style={styles.reportText}>Report a Violation</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#f1f5f9' },
  splash: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  splashText: { marginTop: 12, color: '#2563eb', fontWeight: '700', fontSize: 15 },
  scroll: { padding: 16 },

  header:      { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 18, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon:    { fontSize: 20, color: '#f1f5f9' },
  headerText:  { flex: 1 },
  headerPlate: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  headerSub:   { fontSize: 12, color: '#93c5fd', fontWeight: '600', marginTop: 2 },
  criticalPill:{ backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  criticalText:{ fontSize: 11, fontWeight: '800', color: '#ef4444' },

  card:         { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e0f2fe', shadowColor: '#2563eb', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: '#2563eb', marginBottom: 14 },

  infoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoItem:  { width: '47%', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 11, borderWidth: 1, borderColor: '#e0f2fe' },
  infoLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '800', color: '#0f172a' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText:{ fontSize: 13, color: '#475569', fontWeight: '600', flex: 1 },
  lastUpdate:{ fontSize: 11, color: '#94a3b8', marginTop: 12, fontWeight: '500' },

  reportBtn:  { backgroundColor: '#2563eb', borderRadius: 16, height: 56, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 6, shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
  reportIcon: { fontSize: 18 },
  reportText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMyComplaints } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

const TYPE_CONFIG = {
  overload: { icon: '👥', label: 'Passenger Overloading', color: '#ef4444', bg: '#fee2e2' },
  thermal:  { icon: '🌡', label: 'Elevated Temperature',  color: '#f59e0b', bg: '#fef3c7' },
  other:    { icon: '⚠',  label: 'Other Violation',       color: '#64748b', bg: '#f1f5f9' },
};

const STATUS_CONFIG = {
  open:   { color: '#2563eb', bg: '#eff6ff', label: 'OPEN' },
  closed: { color: '#16a34a', bg: '#dcfce7', label: 'RESOLVED' },
};

export default function MyReportsScreen() {
  const { user }                      = useAuth();
  const [complaints, setComplaints]   = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await fetchMyComplaints();
      setComplaints(data.complaints || []);
    } catch (err) {
      Alert.alert('Error', 'Could not load your reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openCount   = complaints.filter(c => c.status === 'open').length;
  const closedCount = complaints.filter(c => c.status !== 'open').length;

  const renderItem = ({ item }) => {
    const tc = TYPE_CONFIG[item.complaint]   || TYPE_CONFIG.other;
    const sc = STATUS_CONFIG[item.status]    || STATUS_CONFIG.open;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: tc.bg }]}>
            <Text style={{ fontSize: 20 }}>{tc.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.typeName}>{tc.label}</Text>
            <Text style={styles.serial}>{item.serial}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.color }]}>{sc.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          {[
            ['Plate',    item.plate],
            ['Date',     item.timestamp ? item.timestamp.split('T')[0] : '—'],
            ['Pax',      item.passengers != null ? `${item.passengers}/${item.capacity}` : '—'],
            ['Temp',     item.temp != null ? `${item.temp}°C` : '—'],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {item.description ? (
          <View style={styles.descBox}>
            <Text style={styles.descText}>"{item.description}"</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <View>
            <Text style={styles.title}>My Reports</Text>
            <Text style={styles.sub}>{user?.full_name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{complaints.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftWidth: 1, borderLeftColor: '#1e293b' }]}>
          <Text style={[styles.statValue, { color: '#2563eb' }]}>{openCount}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={[styles.statCard, { borderLeftWidth: 1, borderLeftColor: '#1e293b' }]}>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>{closedCount}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading your reports…</Text>
        </View>
      )}

      {!loading && complaints.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📢</Text>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptySub}>
            Violation reports you submit will appear here. Help keep the route safe!
          </Text>
        </View>
      )}

      {!loading && complaints.length > 0 && (
        <FlatList
          data={complaints}
          keyExtractor={(item, i) => `${item.serial}-${i}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563eb" />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>{complaints.length} report{complaints.length !== 1 ? 's' : ''} submitted</Text>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  header:   { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20 },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox:  { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  logoIcon: { fontSize: 18 },
  title:    { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  sub:      { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 2 },

  statRow:  { backgroundColor: '#0f172a', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b' },
  statCard: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statValue:{ fontSize: 22, fontWeight: '900', color: '#f1f5f9' },
  statLabel:{ fontSize: 10, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: '#2563eb', fontWeight: '600' },
  emptyIcon:   { fontSize: 52, marginBottom: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  emptySub:    { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 20 },

  list:       { padding: 16 },
  listHeader: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  card:       { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  typeIcon:   { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  typeName:   { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  serial:     { fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  statusBadge:{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '800' },
  divider:    { height: 1, backgroundColor: '#f1f5f9', marginBottom: 12 },

  infoGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  infoItem:  { width: '47%', backgroundColor: '#f8fafc', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  infoLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#94a3b8', marginBottom: 3 },
  infoValue: { fontSize: 13, fontWeight: '800', color: '#0f172a' },

  descBox:  { marginTop: 10, backgroundColor: '#eff6ff', borderRadius: 10, padding: 10 },
  descText: { fontSize: 12, color: '#1d4ed8', fontStyle: 'italic', lineHeight: 17 },
});
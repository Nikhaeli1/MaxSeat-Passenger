import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, StatusBar, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAllPuvs } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user }                       = useAuth();
  const [puvs,       setPuvs]          = useState([]);
  const [filtered,   setFiltered]      = useState([]);
  const [query,      setQuery]         = useState('');
  const [loading,    setLoading]       = useState(true);
  const [refreshing, setRefreshing]    = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await fetchAllPuvs();
      const list = data.puvs || [];
      setPuvs(list);
      setFiltered(list);
    } catch (err) {
      Alert.alert('Error', 'Could not load PUV data. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSearch = (text) => {
    setQuery(text);
    const q = text.toUpperCase();
    setFiltered(puvs.filter(p =>
      p.plate.toUpperCase().includes(q) ||
      p.driver.toUpperCase().includes(q) ||
      p.route.toUpperCase().includes(q)
    ));
  };

  const statusColor = (puv) => puv.overloaded ? '#ef4444' : puv.load_pct >= 80 ? '#f59e0b' : '#22c55e';
  const statusLabel = (puv) => puv.overloaded ? 'OVERLOADED' : puv.load_pct >= 80 ? 'NEARLY FULL' : 'AVAILABLE';

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.overloaded && styles.cardOverloaded]}
      onPress={() => navigation.navigate('PuvDetail', { plate: item.plate })}
      activeOpacity={0.82}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.plate}>{item.plate}</Text>
          <Text style={styles.route}>{item.route} · {item.company}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor(item) + '22', borderColor: statusColor(item) + '55' }]}>
          <Text style={[styles.statusText, { color: statusColor(item) }]}>{statusLabel(item)}</Text>
        </View>
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.min(item.load_pct, 100)}%`, backgroundColor: statusColor(item) }]} />
      </View>
      <View style={styles.loadRow}>
        <Text style={styles.loadLabel}>{item.passengers} / {item.capacity} passengers</Text>
        <Text style={[styles.loadPct, { color: statusColor(item) }]}>{item.load_pct}%</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>🚗 {item.driver}</Text>
        <Text style={styles.meta}>📍 {item.loc_name}</Text>
        {item.hot && <Text style={[styles.meta, { color: '#f59e0b' }]}>🌡 {item.temp}°C</Text>}
      </View>

      <Text style={styles.viewMore}>View Details →</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <View>
            <Text style={styles.topTitle}>Live PUV Tracker</Text>
            <Text style={styles.topSub}>{user?.full_name} · Bugo–Igpit</Text>
          </View>
        </View>
        {puvs.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{puvs.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search plate, driver, or route…"
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading PUV data…</Text>
        </View>
      )}

      {!loading && filtered.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🚌</Text>
          <Text style={styles.emptyTitle}>{query ? 'No Results' : 'No Active PUVs'}</Text>
          <Text style={styles.emptySub}>{query ? 'Try a different search term.' : 'No PUVs are currently active.'}</Text>
          {!query && (
            <TouchableOpacity style={styles.refreshBtn} onPress={() => load(true)}>
              <Text style={styles.refreshBtnText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!loading && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.puv_id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor="#2563eb" />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>{filtered.length} PUV{filtered.length !== 1 ? 's' : ''} on route</Text>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5f9' },

  topBar:     { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 18, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox:    { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  logoIcon:   { fontSize: 18 },
  topTitle:   { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
  topSub:     { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 2 },
  countBadge: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText:  { color: '#fff', fontSize: 13, fontWeight: '800' },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 16, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a', fontWeight: '500' },
  clearBtn:    { fontSize: 14, color: '#94a3b8', paddingLeft: 8 },

  centered:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: '#2563eb', fontWeight: '600' },
  emptyIcon:   { fontSize: 52, marginBottom: 12 },
  emptyTitle:  { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  emptySub:    { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  refreshBtn:  { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  refreshBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  list:       { padding: 16, paddingTop: 0 },
  listHeader: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },

  card:           { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardOverloaded: { borderColor: '#fecaca', borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  cardHeader:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  plate:          { fontSize: 20, fontWeight: '800', color: '#0f172a', letterSpacing: -0.4 },
  route:          { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
  statusPill:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  statusText:     { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  barBg:    { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  barFill:  { height: 8, borderRadius: 4 },
  loadRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  loadLabel:{ fontSize: 12, color: '#475569', fontWeight: '600' },
  loadPct:  { fontSize: 13, fontWeight: '800' },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  meta:    { fontSize: 12, color: '#64748b', fontWeight: '600' },
  viewMore:{ fontSize: 13, fontWeight: '800', color: '#2563eb', textAlign: 'right' },
});
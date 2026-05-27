import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, StatusBar, ActivityIndicator,
  TouchableOpacity, Alert,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchAllPuvs } from '../api/apiService';
import { useAuth } from '../context/AuthContext';

export default function MapScreen() {
  const navigation         = useNavigation();
  const { logout }         = useAuth();
  const [puvs, setPuvs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion]   = useState({
    latitude: 8.4822, longitude: 124.6472,
    latitudeDelta: 0.08, longitudeDelta: 0.08,
  });

  const markerColor = (puv) => puv.overloaded ? '#ef4444' : puv.load_pct >= 80 ? '#f59e0b' : '#22c55e';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllPuvs();
      const list = data.puvs || [];
      setPuvs(list);
      if (list.length > 0) {
        setRegion(r => ({ ...r, latitude: list[0].lat || 8.4822, longitude: list[0].lng || 124.6472 }));
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again.', [{ text: 'OK', onPress: logout }]);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const overloaded = puvs.filter(p => p.overloaded).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <View>
            <Text style={styles.title}>PUV Live Map</Text>
            <Text style={styles.sub}>Bugo–Igpit Route · Real-time</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.reloadBtn} onPress={load}>
          <Text style={styles.reloadIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.legendText}>Nearly Full</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Overloaded</Text>
        </View>
        {overloaded > 0 && (
          <View style={styles.alertBadge}>
            <Text style={styles.alertText}>⚠ {overloaded}</Text>
          </View>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading PUV locations…</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {puvs.map(item => (
          <Marker
            key={item.puv_id}
            coordinate={{
              latitude:  item.lat  || 8.4822,
              longitude: item.lng  || 124.6472,
            }}
            pinColor={markerColor(item)}
            title={item.plate}
            description={item.loc_name}
          >
            <Callout
              onPress={() => navigation.navigate('PuvDetail', { plate: item.plate })}
              tooltip={false}
            >
              <View style={styles.callout}>
                <Text style={styles.calloutPlate}>{item.plate}</Text>
                <Text style={styles.calloutCompany}>{item.company}</Text>
                <Text style={styles.calloutLoc}>📍 {item.loc_name}</Text>

                <View style={styles.calloutStats}>
                  <View style={[styles.statChip, { backgroundColor: markerColor(item) + '22' }]}>
                    <Text style={[styles.statChipText, { color: markerColor(item) }]}>
                      👥 {item.passengers}/{item.capacity}
                    </Text>
                  </View>
                  <View style={[styles.statChip, { backgroundColor: item.hot ? '#fef3c7' : '#f0fdf4' }]}>
                    <Text style={[styles.statChipText, { color: item.hot ? '#d97706' : '#16a34a' }]}>
                      🌡 {item.temp}°C
                    </Text>
                  </View>
                </View>

                <View style={styles.respondRow}>
                  <Text style={styles.respondText}>Tap to View Details →</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  map:  { flex: 1 },

  header:    { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox:   { width: 38, height: 38, borderRadius: 10, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  logoIcon:  { fontSize: 18 },
  title:     { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  sub:       { fontSize: 11, color: '#64748b', fontWeight: '600', marginTop: 1 },
  reloadBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  reloadIcon:{ fontSize: 18, color: '#2563eb', fontWeight: '800' },

  legend:     { backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 12, flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: '#334155' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  alertBadge: { marginLeft: 'auto', backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3 },
  alertText:  { color: '#fff', fontSize: 11, fontWeight: '800' },

  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText:    { color: '#f1f5f9', fontWeight: '700', marginTop: 10 },

  callout:        { width: 220, padding: 6 },
  calloutPlate:   { fontSize: 17, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
  calloutCompany: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  calloutLoc:     { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2, marginBottom: 8 },
  calloutStats:   { flexDirection: 'row', gap: 6, marginBottom: 8 },
  statChip:       { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statChipText:   { fontSize: 11, fontWeight: '700' },
  respondRow:     { alignItems: 'flex-end' },
  respondText:    { fontSize: 12, fontWeight: '800', color: '#2563eb' },
});
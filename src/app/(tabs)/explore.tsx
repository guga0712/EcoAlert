import { Locate, MapPin, Plus, X } from '@tamagui/lucide-icons-2';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useDenuncias } from '@/src/hooks/useDenuncias';
import type { DenunciaWithCategoria } from '@/src/types/database';
import { getCategoryStyle, STATUS_BG, STATUS_FG, STATUS_LABEL } from '@/src/utils/categories';

const MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const SP_REGION = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { denuncias, mutate } = useDenuncias();
  const { focusLat, focusLng, focusAt } = useLocalSearchParams<{
    focusLat?: string;
    focusLng?: string;
    focusAt?: string;
  }>();

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  useEffect(() => {
    if (!focusLat || !focusLng) return;
    const timeout = setTimeout(() => {
      mapRef.current?.animateToRegion({
        latitude: parseFloat(focusLat),
        longitude: parseFloat(focusLng),
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }, 350);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusAt]);

  const [selected, setSelected] = useState<DenunciaWithCategoria | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const cardAnim = useRef(new Animated.Value(0)).current;
  const justPressedMarker = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    })();
  }, []);

  function selectMarker(d: DenunciaWithCategoria) {
    justPressedMarker.current = true;
    setTimeout(() => { justPressedMarker.current = false; }, 300);
    setSelected(d);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }

  function dismissCard() {
    if (justPressedMarker.current) return;
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  }

  async function goToMyLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    });
  }

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
  });

  const selectedStyle = selected ? getCategoryStyle(selected.categorias?.nome ?? '') : null;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={SP_REGION}
        onPress={dismissCard}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
        showsTraffic={false}
        customMapStyle={MAP_STYLE}
      >
        {denuncias.map(d => {
          const { Icon, color } = getCategoryStyle(d.categorias?.nome ?? '');
          return (
            <Marker
              key={d.id}
              coordinate={{ latitude: d.latitude, longitude: d.longitude }}
              onPress={() => selectMarker(d)}
              tracksViewChanges={false}
            >
              <View style={styles.markerWrapper} pointerEvents="none">
                <View style={[styles.markerBubble, { backgroundColor: color }]}>
                  <Icon size={16} color="#fff" />
                </View>
                <View style={[styles.markerTip, { borderTopColor: color }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Header overlay */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <Header />
      </View>

      {/* Botão minha localização */}
      <Pressable
        onPress={goToMyLocation}
        style={({ pressed }) => [styles.locationBtn, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Locate size={22} color="#2e7d32" />
      </Pressable>

      {/* Card preview */}
      {selected && selectedStyle && (
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardTranslateY }] }]}
        >
          <Pressable style={styles.cardTouchable} onPress={() => setDetailVisible(true)}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: selectedStyle.color + '22' }]}>
                <selectedStyle.Icon size={20} color={selectedStyle.color} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardCategory}>
                  {selected.categorias?.nome ?? 'Ocorrência'}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {selected.titulo}
                </Text>
              </View>
              <Pressable onPress={dismissCard} style={styles.cardCloseBtn} hitSlop={8}>
                <X size={18} color="#9e9e9e" />
              </Pressable>
            </View>

            <Text style={styles.cardDesc} numberOfLines={2}>
              {selected.descricao}
            </Text>

            <View style={styles.cardFooter}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[selected.status] }]}>
                <Text style={[styles.statusText, { color: STATUS_FG[selected.status] }]}>
                  {STATUS_LABEL[selected.status]}
                </Text>
              </View>
              <Text style={styles.detailHint}>Toque para ver detalhes →</Text>
            </View>
          </Pressable>
        </Animated.View>
      )}

      {/* Modal de detalhes */}
      {selected && selectedStyle && (
        <Modal
          visible={detailVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setDetailVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setDetailVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Cabeçalho */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: selectedStyle.color + '18' }]}>
                <selectedStyle.Icon size={22} color={selectedStyle.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryLabel}>
                  {selected.categorias?.nome ?? 'Ocorrência'}
                </Text>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {selected.titulo}
                </Text>
              </View>
              <Pressable onPress={() => setDetailVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#6b7c6f" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 4 }}>
              {/* Status */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={[styles.statusBadgeLg, { backgroundColor: STATUS_BG[selected.status] }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_FG[selected.status] }]} />
                  <Text style={[styles.statusTextLg, { color: STATUS_FG[selected.status] }]}>
                    {STATUS_LABEL[selected.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Descrição */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Descrição</Text>
                <Text style={styles.detailValue}>{selected.descricao}</Text>
              </View>

              {/* Endereço */}
              {selected.endereco && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Endereço</Text>
                    <View style={styles.addressRowLg}>
                      <MapPin size={14} color="#2e7d32" style={{ marginTop: 2 }} />
                      <Text style={styles.detailValue}>{selected.endereco}</Text>
                    </View>
                  </View>
                </>
              )}

              {/* Data */}
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registrada em</Text>
                <Text style={styles.detailValue}>
                  {new Date(selected.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </Text>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/nova-ocorrencia')}
        style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
      >
        <LinearGradient
          colors={['#2e7d32', '#1b5e20']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={30} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  markerBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  locationBtn: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    zIndex: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitleBlock: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7c6f',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2e1f',
    marginTop: 1,
  },
  cardCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f4f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#5a7060',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  addressText: {
    fontSize: 12,
    color: '#9e9e9e',
    maxWidth: 180,
  },
  cardTouchable: {
    flex: 1,
  },
  detailHint: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: '#f5faf6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c8dfc8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e9',
  },
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7c6f',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b2e1f',
    lineHeight: 22,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    paddingVertical: 14,
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9e9e9e',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  detailValue: {
    fontSize: 14,
    color: '#1b2e1f',
    lineHeight: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8f5e9',
  },
  statusBadgeLg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusTextLg: {
    fontSize: 13,
    fontWeight: '700',
  },
  addressRowLg: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

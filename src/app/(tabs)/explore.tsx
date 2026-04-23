import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import Header from '@/src/components/Header';
import { useDenuncias } from '@/src/hooks/useDenuncias';
import type { DenunciaWithCategoria } from '@/src/types/database';

function getCategoryStyle(nome: string) {
  const n = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.includes('alagamento') || n.includes('enchente') || n.includes('inundacao'))
    return { icon: 'water' as const, color: '#1565c0' };
  if (n.includes('arvore') || n.includes('vegeta') || n.includes('galho'))
    return { icon: 'leaf' as const, color: '#388e3c' };
  if (n.includes('buraco') || n.includes('calcada') || n.includes('estrada') || n.includes('via'))
    return { icon: 'construct' as const, color: '#e65100' };
  if (n.includes('lixo') || n.includes('entulho') || n.includes('descarte'))
    return { icon: 'trash' as const, color: '#6a1b9a' };
  if (n.includes('deslizamento') || n.includes('erosao'))
    return { icon: 'warning' as const, color: '#795548' };
  return { icon: 'alert-circle' as const, color: '#37474f' };
}

const STATUS_LABEL: Record<string, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  resolvida: 'Resolvida',
};
const STATUS_BG: Record<string, string> = {
  aberta: '#ffebee', em_analise: '#fff3e0', resolvida: '#e8f5e9',
};
const STATUS_FG: Record<string, string> = {
  aberta: '#c62828', em_analise: '#e65100', resolvida: '#2e7d32',
};

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
  const mapRef = useRef<MapView>(null);
  const { denuncias } = useDenuncias();
  const [selected, setSelected] = useState<DenunciaWithCategoria | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

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
    setSelected(d);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }

  function dismissCard() {
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
          const { icon, color } = getCategoryStyle(d.categorias?.nome ?? '');
          return (
            <Marker
              key={d.id}
              coordinate={{ latitude: d.latitude, longitude: d.longitude }}
              onPress={() => selectMarker(d)}
              tracksViewChanges={false}
            >
              <View style={styles.markerWrapper}>
                <View style={[styles.markerBubble, { backgroundColor: color }]}>
                  <Ionicons name={icon} size={16} color="#fff" />
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
        <Ionicons name="locate" size={22} color="#2e7d32" />
      </Pressable>

      {/* Card de ocorrência selecionada */}
      {selected && selectedStyle && (
        <Animated.View
          style={[styles.card, { transform: [{ translateY: cardTranslateY }] }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: selectedStyle.color + '22' }]}>
              <Ionicons name={selectedStyle.icon} size={20} color={selectedStyle.color} />
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardCategory}>
                {selected.categorias?.nome ?? 'Ocorrência'}
              </Text>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {selected.titulo}
              </Text>
            </View>
            <Pressable onPress={dismissCard} style={styles.cardCloseBtn}>
              <Ionicons name="close" size={18} color="#9e9e9e" />
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
            {selected.endereco ? (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={12} color="#9e9e9e" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {selected.endereco}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>
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
          <Ionicons name="add" size={30} color="#fff" />
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
    elevation: 8,
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

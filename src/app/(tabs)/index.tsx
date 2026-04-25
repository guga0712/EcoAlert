import {
  CircleAlert,
  Droplets,
  Flame,
  Leaf,
  MapPin,
  Radiation,
  Trash2,
  Trees,
  TriangleAlert,
  Wind,
  Wrench,
} from '@tamagui/lucide-icons-2';
import { useFocusEffect, useRouter } from 'expo-router';
import type React from 'react';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/src/components/Header';
import { useDenuncias } from '@/src/hooks/useDenuncias';
import type { DenunciaWithCategoria } from '@/src/types/database';

type IconComponent = React.ComponentType<{ size?: number; color?: string }>;

function getCategoryStyle(nome: string): { Icon: IconComponent; color: string } {
  const n = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (n.includes('alagamento') || n.includes('enchente') || n.includes('inundacao'))
    return { Icon: Droplets, color: '#1565c0' };
  if (n.includes('arvore') || n.includes('vegeta') || n.includes('galho'))
    return { Icon: Leaf, color: '#388e3c' };
  if (n.includes('buraco') || n.includes('calcada') || n.includes('estrada') || n.includes('via'))
    return { Icon: Wrench, color: '#e65100' };
  if (n.includes('lixo') || n.includes('entulho') || n.includes('descarte'))
    return { Icon: Trash2, color: '#6a1b9a' };
  if (n.includes('deslizamento') || n.includes('erosao'))
    return { Icon: TriangleAlert, color: '#795548' };
  if (n.includes('queimada') || n.includes('incendio'))
    return { Icon: Flame, color: '#bf360c' };
  if (n.includes('poluicao'))
    return { Icon: Wind, color: '#37474f' };
  if (n.includes('desmatamento'))
    return { Icon: Trees, color: '#21952f' };
  if (n.includes('esgoto'))
    return { Icon: Radiation, color: '#849521' };
  return { Icon: CircleAlert, color: '#37474f' };
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora mesmo';
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function HomeScreen() {
  const router = useRouter();
  const { denuncias, isLoading, mutate } = useDenuncias();

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate])
  );

  function handlePress(d: DenunciaWithCategoria) {
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        focusLat: String(d.latitude),
        focusLng: String(d.longitude),
        focusAt: String(Date.now()),
      },
    });
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safe}>
      <Header />
      <FlatList
        data={denuncias}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Atividades recentes</Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#2e7d32" size="large" />
            </View>
          ) : (
            <View style={styles.center}>
              <MapPin size={44} color="#c8dfc8" />
              <Text style={styles.emptyText}>Nenhuma ocorrência registrada ainda</Text>
            </View>
          )
        }
        renderItem={({ item: d }) => {
          const { Icon, color } = getCategoryStyle(d.categorias?.nome ?? '');
          return (
            <Pressable
              onPress={() => handlePress(d)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconBox, { backgroundColor: color + '1a' }]}>
                <Icon size={22} color={color} />
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{d.titulo}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_BG[d.status] }]}>
                    <Text style={[styles.badgeText, { color: STATUS_FG[d.status] }]}>
                      {STATUS_LABEL[d.status]}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>
                  {d.categorias?.nome ?? 'Ocorrência'} · {timeAgo(d.created_at)}
                </Text>

                {d.endereco ? (
                  <View style={styles.addressRow}>
                    <MapPin size={11} color="#b0b8b0" />
                    <Text style={styles.cardAddress} numberOfLines={1}>{d.endereco}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5faf6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2e1f',
    marginBottom: 14,
  },
  center: {
    alignItems: 'center',
    paddingTop: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.88,
    backgroundColor: '#f5faf6',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2e1f',
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7c6f',
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardAddress: {
    flex: 1,
    fontSize: 12,
    color: '#b0b8b0',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

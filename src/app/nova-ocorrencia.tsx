import {
  Camera,
  CircleAlert,
  CircleX,
  Droplets,
  Flame,
  Leaf,
  MapPin,
  Pencil,
  Radiation,
  Trash2,
  Trees,
  TriangleAlert,
  Wind,
  Wrench,
  X
} from '@tamagui/lucide-icons-2';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner } from 'tamagui';

import { mutate as globalMutate } from 'swr';

import { useCategorias } from '@/src/hooks/useCategorias';
import { supabase } from '@/src/lib/supabase';
import { createDenuncia } from '@/src/services/denuncias';
import { uploadDenunciaImageFromUri } from '@/src/services/storage';
import type { DenunciaWithCategoria } from '@/src/types/database';
import { swrKeys } from '@/src/utils/swrKeys';

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

export default function NovaOcorrenciaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categorias } = useCategorias();

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addressMode, setAddressMode] = useState<'auto' | 'manual'>('auto');
  const [manualStreet, setManualStreet] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [tituloFocused, setTituloFocused] = useState(false);
  const [descricaoFocused, setDescricaoFocused] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [stateFocused, setStateFocused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo) {
          const parts = [geo.street, geo.name, geo.district, geo.city].filter(Boolean);
          setAddress(parts.slice(0, 3).join(', '));
        }
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  async function handlePickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!selectedCatId) { Alert.alert('Atenção', 'Selecione uma categoria.'); return; }
    if (!titulo.trim()) { Alert.alert('Atenção', 'Informe um título.'); return; }
    if (!descricao.trim()) { Alert.alert('Atenção', 'Informe uma descrição.'); return; }

    if (addressMode === 'manual' && (!manualStreet.trim() || !manualCity.trim())) {
      Alert.alert('Atenção', 'Informe pelo menos a rua e a cidade.');
      return;
    }
    if (addressMode === 'auto' && !location) {
      Alert.alert('Atenção', 'Localização não disponível.');
      return;
    }

    try {
      setSaving(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) throw new Error('Não autenticado');

      let fotoUrl: string | null = null;
      if (photoUri) fotoUrl = await uploadDenunciaImageFromUri(photoUri);

      let latitude = location?.coords.latitude ?? 0;
      let longitude = location?.coords.longitude ?? 0;

      const addressParts = [manualStreet.trim(), manualCity.trim(), manualState.trim()].filter(Boolean);
      const finalAddress = addressMode === 'manual'
        ? addressParts.join(', ')
        : address;

      if (addressMode === 'manual') {
        const query = [...addressParts, 'Brasil'].join(', ');
        const geocoded = await Location.geocodeAsync(query);
        if (geocoded.length > 0) {
          latitude = geocoded[0].latitude;
          longitude = geocoded[0].longitude;
        } else if (!location) {
          Alert.alert('Atenção', 'Não foi possível encontrar as coordenadas desse endereço. Verifique os campos e tente novamente.');
          return;
        }
      }

      const created = await createDenuncia({
        user_id: userId,
        categoria_id: selectedCatId,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        latitude,
        longitude,
        endereco: finalAddress,
        foto_url: fotoUrl,
      });

      const cat = categorias.find(c => c.id === selectedCatId) ?? null;
      await globalMutate<DenunciaWithCategoria[]>(
        swrKeys.denuncias,
        (current = []) => [
          { ...created, categorias: cat ? { id: cat.id, nome: cat.nome } : null },
          ...current,
        ],
        { revalidate: false },
      );
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a ocorrência.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Handle bar */}
      <View style={styles.handle} />

      {/* Cabeçalho */}
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Nova Ocorrência</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={18} color="#6b7c6f" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={insets.bottom + 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Categoria */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoria</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {categorias.map(cat => {
                const { Icon, color } = getCategoryStyle(cat.nome);
                const active = selectedCatId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedCatId(cat.id)}
                    style={[
                      styles.chip,
                      active
                        ? { backgroundColor: color, borderColor: color }
                        : { backgroundColor: '#fff', borderColor: '#c8dfc8' },
                    ]}
                  >
                    <Icon size={14} color={active ? '#fff' : color} />
                    <Text style={[styles.chipText, { color: active ? '#fff' : '#3a5c40' }]}>
                      {cat.nome}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Título */}
          <View style={styles.section}>
            <Text style={styles.label}>Título</Text>
            <View style={[styles.inputRow, { borderColor: tituloFocused ? '#2e7d32' : '#b0ccb4' }]}>
              <Pencil
                size={16}
                color={tituloFocused ? '#2e7d32' : '#9e9e9e'}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Árvore caída na calçada"
                placeholderTextColor="#b0b8b0"
                onFocus={() => setTituloFocused(true)}
                onBlur={() => setTituloFocused(false)}
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.label}>Descrição</Text>
            <View style={[styles.textarea, { borderColor: descricaoFocused ? '#2e7d32' : '#b0ccb4' }]}>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descreva a ocorrência com mais detalhes..."
                placeholderTextColor="#b0b8b0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                onFocus={() => setDescricaoFocused(true)}
                onBlur={() => setDescricaoFocused(false)}
                style={styles.textareaInput}
              />
            </View>
          </View>

          {/* Localização */}
          <View style={styles.section}>
            <Text style={styles.label}>Localização</Text>

            {/* Toggle */}
            <View style={styles.addressToggle}>
              <Pressable
                style={[styles.toggleBtn, addressMode === 'auto' && styles.toggleBtnActive]}
                onPress={() => setAddressMode('auto')}
              >
                <MapPin size={13} color={addressMode === 'auto' ? '#fff' : '#3a5c40'} />
                <Text style={[styles.toggleText, addressMode === 'auto' && styles.toggleTextActive]}>
                  Usar atual
                </Text>
              </Pressable>
              <Pressable
                style={[styles.toggleBtn, addressMode === 'manual' && styles.toggleBtnActive]}
                onPress={() => setAddressMode('manual')}
              >
                <Pencil size={13} color={addressMode === 'manual' ? '#fff' : '#3a5c40'} />
                <Text style={[styles.toggleText, addressMode === 'manual' && styles.toggleTextActive]}>
                  Digitar
                </Text>
              </Pressable>
            </View>

            {/* Conteúdo conforme modo */}
            {addressMode === 'auto' ? (
              <View style={styles.locationBox}>
                {loadingLocation ? (
                  <>
                    <Spinner size="small" color="#2e7d32" />
                    <Text style={styles.locationMuted}>Obtendo localização...</Text>
                  </>
                ) : location ? (
                  <>
                    <MapPin size={18} color="#2e7d32" style={{ marginRight: 8 }} />
                    <Text style={styles.locationText} numberOfLines={2}>
                      {address ?? `${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`}
                    </Text>
                  </>
                ) : (
                  <>
                    <MapPin size={18} color="#e53935" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 14, color: '#e53935' }}>Localização não disponível</Text>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.manualFields}>
                {/* Rua */}
                <View style={[styles.inputRow, { borderColor: streetFocused ? '#2e7d32' : '#b0ccb4' }]}>
                  <MapPin size={16} color={streetFocused ? '#2e7d32' : '#9e9e9e'} style={{ marginRight: 8 }} />
                  <TextInput
                    value={manualStreet}
                    onChangeText={setManualStreet}
                    placeholder="Rua, número e bairro"
                    placeholderTextColor="#b0b8b0"
                    onFocus={() => setStreetFocused(true)}
                    onBlur={() => setStreetFocused(false)}
                    style={styles.textInput}
                  />
                </View>

                {/* Cidade + Estado lado a lado */}
                <View style={styles.cityStateRow}>
                  <View style={[styles.inputRow, styles.cityInput, { borderColor: cityFocused ? '#2e7d32' : '#b0ccb4' }]}>
                    <TextInput
                      value={manualCity}
                      onChangeText={setManualCity}
                      placeholder="Cidade"
                      placeholderTextColor="#b0b8b0"
                      onFocus={() => setCityFocused(true)}
                      onBlur={() => setCityFocused(false)}
                      style={styles.textInput}
                    />
                  </View>
                  <View style={[styles.inputRow, styles.stateInput, { borderColor: stateFocused ? '#2e7d32' : '#b0ccb4' }]}>
                    <TextInput
                      value={manualState}
                      onChangeText={setManualState}
                      placeholder="UF"
                      placeholderTextColor="#b0b8b0"
                      autoCapitalize="characters"
                      maxLength={2}
                      onFocus={() => setStateFocused(true)}
                      onBlur={() => setStateFocused(false)}
                      style={[styles.textInput, { textAlign: 'center' }]}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Foto */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <Text style={styles.label}>
              Foto{' '}
              <Text style={styles.optional}>(opcional)</Text>
            </Text>
            {photoUri ? (
              <View style={styles.photoWrapper}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoPreview}
                  contentFit="cover"
                />
                <Pressable onPress={() => setPhotoUri(null)} style={styles.removePhoto}>
                  <CircleX size={26} color="#e53935" />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={handlePickPhoto} style={styles.photoPlaceholder}>
                <Camera size={28} color="#9e9e9e" />
                <Text style={styles.photoPlaceholderText}>Adicionar foto</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botão registrar */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleSubmit}
          disabled={saving}
          style={({ pressed }) => [
            styles.submitBtn,
            { opacity: pressed || saving ? 0.85 : 1 },
          ]}
        >
          <LinearGradient
            colors={['#2e7d32', '#1b5e20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {saving
              ? <Spinner size="small" color="#fff" />
              : <Text style={styles.submitText}>Registrar ocorrência</Text>
            }
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5faf6',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c8dfc8',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2e1f',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7c6f',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  optional: {
    fontSize: 12,
    color: '#9e9e9e',
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  chipRow: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1b2e1f',
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
  },
  textareaInput: {
    fontSize: 15,
    color: '#1b2e1f',
    minHeight: 96,
    textAlignVertical: 'top',
  },
  addressToggle: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#2e7d32',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3a5c40',
  },
  toggleTextActive: {
    color: '#fff',
  },
  manualFields: {
    gap: 8,
  },
  cityStateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cityInput: {
    flex: 3,
  },
  stateInput: {
    flex: 1,
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#b0ccb4',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  locationText: {
    fontSize: 14,
    color: '#3a5c40',
    flex: 1,
  },
  locationMuted: {
    fontSize: 14,
    color: '#9e9e9e',
    marginLeft: 8,
  },
  photoPlaceholder: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#b0ccb4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 6,
  },
  photoPlaceholderText: {
    fontSize: 13,
    color: '#9e9e9e',
  },
  photoWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 13,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#e8f5e9',
    backgroundColor: '#f5faf6',
  },
  submitBtn: {
    borderRadius: 14,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitGradient: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

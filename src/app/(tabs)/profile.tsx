import { Camera, LogOut, MapPin, Pencil, Trash2 } from '@tamagui/lucide-icons-2';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Text as NText,
  View as NView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mutate as globalMutate } from 'swr';
import { Button, Label, Spinner, Text, View, XStack, YStack } from 'tamagui';

import Header from '@/src/components/Header';
import { useMyDenuncias } from '@/src/hooks/useMyDenuncias';
import { useProfile } from '@/src/hooks/useProfile';
import { supabase } from '@/src/lib/supabase';
import { signOut } from '@/src/services/auth';
import { deleteDenuncia } from '@/src/services/denuncias';
import { updateProfile } from '@/src/services/profiles';
import { uploadAvatarImage } from '@/src/services/storage';
import type { DenunciaStatus, DenunciaWithCategoria } from '@/src/types/database';
import { getCategoryStyle, STATUS_BG, STATUS_FG, STATUS_LABEL } from '@/src/utils/categories';
import { swrKeys } from '@/src/utils/swrKeys';

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

export default function ProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');
  const [nomeFocused, setNomeFocused] = useState(false);

  const { profile, isLoading, mutate } = useProfile(userId);
  const { denuncias: myDenuncias, isLoading: loadingOcc, mutate: mutateMyDenuncias } = useMyDenuncias(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      mutateMyDenuncias();
    }, [mutateMyDenuncias]),
  );

  useEffect(() => {
    if (profile) setNomeEdit(profile.nome ?? '');
  }, [profile]);

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para escolher um avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    try {
      setUploadingAvatar(true);
      const publicUrl = await uploadAvatarImage(userId!, result.assets[0].uri);
      await updateProfile(userId!, { foto_url: publicUrl });
      await mutate();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    if (!nomeEdit.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar em branco.');
      return;
    }
    try {
      setSaving(true);
      await updateProfile(userId!, { nome: nomeEdit.trim() });
      await mutate();
      setEditing(false);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setNomeEdit(profile?.nome ?? '');
    setEditing(false);
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login');
          } catch {
            Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
          }
        },
      },
    ]);
  }

  function handleChangeStatus(d: DenunciaWithCategoria) {
    const options = (['aberta', 'em_analise', 'resolvida'] as DenunciaStatus[])
      .filter(s => s !== d.status)
      .map(s => ({
        text: STATUS_LABEL[s],
        onPress: () => doUpdateStatus(d.id, s),
      }));

    Alert.alert('Alterar status', d.titulo, [
      ...options,
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function doUpdateStatus(id: string, status: DenunciaStatus) {
    await mutateMyDenuncias(
      (current = []) => current.map(d => d.id === id ? { ...d, status } : d),
      { revalidate: false },
    );
    await globalMutate<DenunciaWithCategoria[]>(
      swrKeys.denuncias,
      (current = []) => current.map(d => d.id === id ? { ...d, status } : d),
      { revalidate: false },
    );
  }

  function handleDelete(d: DenunciaWithCategoria) {
    Alert.alert(
      'Excluir ocorrência',
      `Deseja excluir "${d.titulo}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => doDelete(d.id) },
      ]
    );
  }

  async function doDelete(id: string) {
    try {
      await deleteDenuncia(id);
      await mutateMyDenuncias();
      await globalMutate(swrKeys.denuncias);
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir a ocorrência.');
    }
  }

  const avatarUri = profile?.foto_url ?? null;
  const initials = profile?.nome
    ? profile.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#f5faf6' }}>
      <Header />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <YStack paddingHorizontal="$5" paddingTop="$6" gap="$6" maxWidth={480} width="100%" alignSelf="center">

            {/* Avatar */}
            <YStack alignItems="center" gap="$3">
              <View
                width={100}
                height={100}
                borderRadius={50}
                shadowColor="#2e7d32"
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.2}
                shadowRadius={8}
                style={{ elevation: 6 }}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    width={100}
                    height={100}
                    borderRadius={50}
                    backgroundColor="#2e7d32"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={32} fontWeight="700" color="#fff">
                      {isLoading ? '' : initials}
                    </Text>
                  </View>
                )}
                <View
                  position="absolute"
                  bottom={0}
                  right={0}
                  width={30}
                  height={30}
                  borderRadius={15}
                  backgroundColor="#2e7d32"
                  borderWidth={2}
                  borderColor="#f5faf6"
                  alignItems="center"
                  justifyContent="center"
                  onTouchEnd={uploadingAvatar ? undefined : handlePickAvatar}
                >
                  {uploadingAvatar
                    ? <Spinner size="small" color="#fff" />
                    : <Camera size={14} color="#fff" />
                  }
                </View>
              </View>

              {isLoading ? (
                <Spinner size="small" color="#2e7d32" />
              ) : (
                <Text fontSize={20} fontWeight="700" color="#1b5e20">
                  {profile?.nome ?? '—'}
                </Text>
              )}
            </YStack>

            {/* Card de informações */}
            <YStack
              backgroundColor="#fff"
              borderRadius={16}
              borderWidth={1}
              borderColor="#d0e8d4"
              padding="$4"
              gap="$4"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={0.06}
              shadowRadius={6}
              style={{ elevation: 2 }}
            >
              <YStack gap="$1">
                <Label fontSize={12} fontWeight="600" color="#6b7c6f" textTransform="uppercase" letterSpacing={0.8}>
                  Nome
                </Label>
                {editing ? (
                  <XStack
                    alignItems="center"
                    backgroundColor="#f5faf6"
                    borderRadius={10}
                    borderWidth={1.5}
                    borderColor={nomeFocused ? '#2e7d32' : '#d0e8d4'}
                    paddingHorizontal="$3"
                    height={46}
                  >
                    <TextInput
                      value={nomeEdit}
                      onChangeText={setNomeEdit}
                      placeholder="Seu nome"
                      placeholderTextColor="#9e9e9e"
                      onFocus={() => setNomeFocused(true)}
                      onBlur={() => setNomeFocused(false)}
                      style={{ flex: 1, fontSize: 15, color: '#1b2e1f' }}
                    />
                  </XStack>
                ) : (
                  <Text fontSize={15} color="#1b2e1f" fontWeight="500">
                    {profile?.nome ?? '—'}
                  </Text>
                )}
              </YStack>

              <View height={1} backgroundColor="#e8f5e9" />

              <YStack gap="$1">
                <Label fontSize={12} fontWeight="600" color="#6b7c6f" textTransform="uppercase" letterSpacing={0.8}>
                  E-mail
                </Label>
                <Text fontSize={15} color="#1b2e1f" fontWeight="500">
                  {profile?.email ?? '—'}
                </Text>
              </YStack>
            </YStack>

            {/* Botões */}
            {editing ? (
              <XStack gap="$3">
                <Button
                  flex={1}
                  size="$5"
                  onPress={handleCancelEdit}
                  backgroundColor="#fff"
                  borderRadius={12}
                  height={54}
                  borderWidth={1.5}
                  borderColor="#d0e8d4"
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Text color="#6b7c6f" fontWeight="600">Cancelar</Text>
                </Button>
                <Button
                  flex={1}
                  size="$5"
                  onPress={handleSave}
                  backgroundColor="#2e7d32"
                  borderRadius={14}
                  height={54}
                  borderWidth={0}
                  shadowColor="#2e7d32"
                  shadowOffset={{ width: 0, height: 6 }}
                  shadowOpacity={0.3}
                  shadowRadius={10}
                  elevation={6}
                  pressStyle={{ opacity: 0.85, backgroundColor: '#256427' }}
                >
                  {saving
                    ? <Spinner size="small" color="#fff" />
                    : <Text color="#fff" fontWeight="700">Salvar</Text>
                  }
                </Button>
              </XStack>
            ) : (
              <Button
                size="$5"
                onPress={() => setEditing(true)}
                backgroundColor="#2e7d32"
                borderRadius={14}
                height={54}
                borderWidth={0}
                shadowColor="#2e7d32"
                shadowOffset={{ width: 0, height: 6 }}
                shadowOpacity={0.3}
                shadowRadius={10}
                elevation={6}
                pressStyle={{ opacity: 0.85, backgroundColor: '#256427' }}
              >
                <XStack alignItems="center" gap="$2">
                  <Pencil size={16} color="#fff" />
                  <Text color="#fff" fontWeight="700" fontSize={16}>Editar perfil</Text>
                </XStack>
              </Button>
            )}

            {/* Logout */}
            <Button
              size="$5"
              onPress={handleLogout}
              backgroundColor="#fff"
              borderRadius={14}
              height={54}
              borderWidth={1.5}
              borderColor="#ffcdd2"
              pressStyle={{ opacity: 0.85, backgroundColor: '#fff8f8' }}
            >
              <XStack alignItems="center" gap="$2">
                <LogOut size={16} color="#c62828" />
                <Text color="#c62828" fontWeight="600" fontSize={16}>Sair da conta</Text>
              </XStack>
            </Button>

          </YStack>

          {/* Minhas Ocorrências */}
          <NView style={styles.occSection}>
            <NView style={styles.occHeader}>
              <NText style={styles.occSectionTitle}>Minhas Ocorrências</NText>
              {myDenuncias.length > 0 && (
                <NView style={styles.occCountBadge}>
                  <NText style={styles.occCountText}>{myDenuncias.length}</NText>
                </NView>
              )}
            </NView>

            {loadingOcc ? (
              <NView style={styles.occCenter}>
                <ActivityIndicator color="#2e7d32" size="large" />
              </NView>
            ) : myDenuncias.length === 0 ? (
              <NView style={styles.occCenter}>
                <NText style={styles.occEmpty}>Você ainda não registrou nenhuma ocorrência.</NText>
              </NView>
            ) : (
              myDenuncias.map(d => {
                const { Icon, color } = getCategoryStyle(d.categorias?.nome ?? '');
                return (
                  <NView key={d.id} style={styles.card}>
                    {/* Linha principal */}
                    <NView style={styles.cardMain}>
                      <NView style={[styles.cardIconBox, { backgroundColor: color + '1a' }]}>
                        <Icon size={20} color={color} />
                      </NView>

                      <NView style={styles.cardBody}>
                        <NText style={styles.cardTitle} numberOfLines={1}>{d.titulo}</NText>
                        <NText style={styles.cardMeta}>
                          {d.categorias?.nome ?? 'Ocorrência'} · {timeAgo(d.created_at)}
                        </NText>
                        {d.endereco ? (
                          <NView style={styles.cardAddressRow}>
                            <MapPin size={11} color="#b0b8b0" />
                            <NText style={styles.cardAddress} numberOfLines={1}>{d.endereco}</NText>
                          </NView>
                        ) : null}
                      </NView>

                      <Pressable
                        onPress={() => handleDelete(d)}
                        hitSlop={10}
                        style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
                      >
                        <Trash2 size={17} color="#e53935" />
                      </Pressable>
                    </NView>

                    {/* Status — toque para alterar */}
                    <Pressable
                      onPress={() => handleChangeStatus(d)}
                      style={({ pressed }) => [
                        styles.statusRow,
                        { backgroundColor: STATUS_BG[d.status], opacity: pressed ? 0.75 : 1 },
                      ]}
                    >
                      <NView style={[styles.statusDot, { backgroundColor: STATUS_FG[d.status] }]} />
                      <NText style={[styles.statusLabel, { color: STATUS_FG[d.status] }]}>
                        {STATUS_LABEL[d.status]}
                      </NText>
                      <NText style={[styles.statusHint, { color: STATUS_FG[d.status] + 'aa' }]}>
                        toque para alterar →
                      </NText>
                    </Pressable>
                  </NView>
                );
              })
            )}
          </NView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  occSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  occHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  occSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2e1f',
  },
  occCountBadge: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  occCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  occCenter: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  occEmpty: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8f5e9',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b2e1f',
  },
  cardMeta: {
    fontSize: 12,
    color: '#6b7c6f',
    fontWeight: '500',
  },
  cardAddressRow: {
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
  deleteBtn: {
    padding: 6,
    flexShrink: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8f5e9',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusHint: {
    fontSize: 12,
    marginLeft: 'auto',
  },
});

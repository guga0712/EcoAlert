import { Camera, LogOut, Pencil } from '@tamagui/lucide-icons-2';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Label, Spinner, Text, View, XStack, YStack } from 'tamagui';

import Header from '@/src/components/Header';
import { useProfile } from '@/src/hooks/useProfile';
import { supabase } from '@/src/lib/supabase';
import { signOut } from '@/src/services/auth';
import { updateProfile } from '@/src/services/profiles';
import { uploadAvatarImage } from '@/src/services/storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [nomeEdit, setNomeEdit] = useState('');
  const [nomeFocused, setNomeFocused] = useState(false);

  const { profile, isLoading, mutate } = useProfile(userId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id);
    });
  }, []);

  useEffect(() => {
    if (profile) {
      setNomeEdit(profile.nome ?? '');
    }
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
    } catch (error) {
      console.log(error)
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

  const avatarUri = profile?.foto_url ?? null;
  const initials = profile?.nome
    ? profile.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#f5faf6' }}>
      <Header />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <YStack flex={1} paddingHorizontal="$5" paddingTop="$6" gap="$6" maxWidth={480} width="100%" alignSelf="center">

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

              {/* Botão câmera */}
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
            {/* Nome */}
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

            {/* Divisor */}
            <View height={1} backgroundColor="#e8f5e9" />

            {/* E-mail (somente leitura) */}
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
                pressStyle={{ opacity: 0.85, backgroundColor: '#256427' }}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

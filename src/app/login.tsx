import { signIn, signUp } from "@/src/services/auth";
import { Ionicons } from '@expo/vector-icons';
import { Eye, EyeOff, Lock, Mail, User } from '@tamagui/lucide-icons-2';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Label, Text, View, XStack, YStack } from 'tamagui';

function inputContainerProps(focused: boolean) {
  return {
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: focused ? '#2e7d32' : '#b0ccb4',
    paddingHorizontal: '$3' as const,
    height: 52,
    shadowColor: focused ? '#2e7d32' : '#00000000',
    shadowOffset: { width: 0, height: focused ? 3 : 1 },
    shadowOpacity: focused ? 0.15 : 0.06,
    shadowRadius: focused ? 6 : 3,
  };
}

export default function LoginScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('a@a.com');
  const [password, setPassword] = useState('12345678');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);



  function resetFields() {
    setEmail('');
    setPassword('');
    setNome('');
    setShowPassword(false);
  }

  function switchTab(tab: 'login' | 'register') {
    resetFields();
    setActiveTab(tab);
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos para entrar.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }

    try {
      await signIn({ email, password });
      router.replace('/(tabs)');
    } catch {
      Alert.alert("Erro", 'E-mail ou senha incorretos. Tente novamente.');
    }
  }

  async function handleRegister() {
    if (!nome || !email || !password) {
      Alert.alert("Erro", "Preencha todos os campos para criar uma conta.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve conter pelo menos 6 caracteres.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Erro", "Digite um e-mail válido.");
      return;
    }

    try {
      await signUp({ nome, email, password });
      router.replace('/(tabs)');
    } catch {
      Alert.alert("Erro", 'Não foi possível criar a conta. Tente novamente.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5faf6' }} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" paddingHorizontal="$5" gap="$6" maxWidth={480} width="100%" alignSelf="center">

          {/* Logo */}
          <YStack alignItems="center" gap="$3">
            <View
              width={72}
              height={72}
              borderRadius={20}
              shadowColor="#2e7d32"
              shadowOffset={{ width: 0, height: 6 }}
              shadowOpacity={0.35}
              shadowRadius={4}
              style={{ elevation: 8 }}
            >
              <LinearGradient
                colors={['#2e7d32', '#1b5e20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="leaf" size={38} color="#fff" />
              </LinearGradient>
            </View>
            <Text fontSize={28} fontWeight="700" color="#1b5e20" letterSpacing={0.5}>
              EcoAlert
            </Text>
          </YStack>

          {/* Abas */}
          <XStack
            backgroundColor="#e8f5e9"
            borderRadius={12}
            padding="$1"
          >
            <View
              flex={1}
              backgroundColor={activeTab === 'login' ? '#fff' : 'transparent'}
              borderRadius={10}
              paddingVertical="$2"
              alignItems="center"
              shadowColor={activeTab === 'login' ? '#000' : 'transparent'}
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={activeTab === 'login' ? 0.08 : 0}
              shadowRadius={3}
              style={{ elevation: activeTab === 'login' ? 2 : 0 }}
              onTouchEnd={() => switchTab('login')}
            >
              <Text fontWeight="600" fontSize={14} color={activeTab === 'login' ? '#2e7d32' : '#6b7c6f'}>
                Entrar
              </Text>
            </View>
            <View
              flex={1}
              backgroundColor={activeTab === 'register' ? '#fff' : 'transparent'}
              borderRadius={10}
              paddingVertical="$2"
              alignItems="center"
              shadowColor={activeTab === 'register' ? '#000' : 'transparent'}
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={activeTab === 'register' ? 0.08 : 0}
              shadowRadius={3}
              style={{ elevation: activeTab === 'register' ? 2 : 0 }}
              onTouchEnd={() => switchTab('register')}
            >
              <Text fontWeight="600" fontSize={14} color={activeTab === 'register' ? '#2e7d32' : '#6b7c6f'}>
                Registrar
              </Text>
            </View>
          </XStack>

          {/* Campos */}
          <YStack gap="$4">

            {/* Nome — só no register */}
            {activeTab === 'register' && (
              <YStack gap="$1">
                <Label fontSize={13} fontWeight="600" color="#3a5c40" marginLeft="$1">
                  Nome
                </Label>
                <XStack {...inputContainerProps(nomeFocused)}>
                  <User size={18} color={nomeFocused ? '#2e7d32' : '#9e9e9e'} />
                  <TextInput
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Seu nome completo"
                    placeholderTextColor="#9e9e9e"
                    onFocus={() => setNomeFocused(true)}
                    onBlur={() => setNomeFocused(false)}
                    style={{ flex: 1, fontSize: 15, color: '#1b2e1f', marginLeft: 8 }}
                  />
                </XStack>
              </YStack>
            )}

            {/* E-mail */}
            <YStack gap="$1">
              <Label fontSize={13} fontWeight="600" color="#3a5c40" marginLeft="$1">
                E-mail
              </Label>
              <XStack {...inputContainerProps(emailFocused)}>
                <Mail size={18} color={emailFocused ? '#2e7d32' : '#9e9e9e'} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="seu@email.com"
                  placeholderTextColor="#9e9e9e"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  style={{ flex: 1, fontSize: 15, color: '#1b2e1f', marginLeft: 8 }}
                />
              </XStack>
            </YStack>

            {/* Senha */}
            <YStack gap="$1">
              <Label fontSize={13} fontWeight="600" color="#3a5c40" marginLeft="$1">
                Senha
              </Label>
              <XStack {...inputContainerProps(passwordFocused)}>
                <Lock size={18} color={passwordFocused ? '#2e7d32' : '#9e9e9e'} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Sua senha"
                  placeholderTextColor="#9e9e9e"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  style={{ flex: 1, fontSize: 15, color: '#1b2e1f', marginLeft: 8 }}
                />
                <Pressable onPress={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={18} color="#9e9e9e" /> : <Eye size={18} color="#9e9e9e" />}
                </Pressable>
              </XStack>
            </YStack>
          </YStack>

          {/* Botão */}
          <Pressable
            onPress={activeTab === 'login' ? handleLogin : handleRegister}
            style={({ pressed }) => ({
              borderRadius: 14,
              shadowColor: '#2e7d32',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 10,
              elevation: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <LinearGradient
              colors={['#2e7d32', '#1b5e20']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text color="#fff" fontWeight="700" fontSize={16} letterSpacing={0.5}>
                {activeTab === 'login' ? 'Entrar' : 'Criar conta'}
              </Text>
            </LinearGradient>
          </Pressable>

        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { signIn } from "@/src/services/auth";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, YStack } from 'tamagui';

import Title from '@/src/components/Title';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function Login({ email, password }: any) {
    try {
      const result = await signIn({
        email: email,
        password: password,
      });
      console.log(result);
      Alert.alert(
        "Sucesso",
        result.user?.email
          ? `Logado como ${result.user.email}`
          : "Login realizado com sucesso.",
      );
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log(error)
      Alert.alert("Erro", 'Tente novamente');
    }
  }

  function handleSubmit() {
    Login({ email, password })
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <YStack flex={1} padding="$4" justifyContent="center" gap="$4" maxWidth={480} width="100%" alignSelf="center">
          <Title text="Entrar" alignSelf="unset" />
          <Text color="$color10">Use suas credenciais (demo: qualquer valor).</Text>
          <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" style={{ color: '#fff' }} />
          <TextInput value={password} onChangeText={setPassword} secureTextEntry={true} style={{ color: '#fff' }} />
          <Button size="$4" backgroundColor="green" onPress={handleSubmit}>
            Continuar
          </Button>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

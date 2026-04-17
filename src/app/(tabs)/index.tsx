import { Plus } from '@tamagui/lucide-icons-2';


import Title from '@/src/components/Title';
import { useDenuncias } from '@/src/hooks/useDenuncias';
import { signUp } from '@/src/services/auth';
import { createDenuncia } from '@/src/services/denuncias';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, YStack } from 'tamagui';

export default function HomeScreen() {
  const { denuncias, isLoading, error, mutate } = useDenuncias()
  console.log(denuncias)
  async function handleCreate() {
    try {
      await createDenuncia({
        user_id: 'a305e6bb-857c-4703-873d-895a5818d6c5',
        categoria_id: 1,
        titulo: 'Ala o agamento',
        descricao: 'Água acumulada bloqueando passagem',
        latitude: -23.55052,
        longitude: -46.633308,
        endereco: 'Centro, São Paulo',
      })
      await mutate()
      console.log('Denuncia Criada')

      Alert.alert('Sucesso', 'Denúncia criada com sucesso.')
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Não foi possível criar a denúncia.')
    }
  }


  async function CreateUser() {
    try {
      const result = await signUp({
        nome: 'Nicole Teste',
        email: `nicole${Date.now()}@gmail.com`, // evita duplicação
        password: '12345678',
      })

      console.log('Usuário criado:', result.user)

      Alert.alert('Sucesso', 'Usuário criado com sucesso!')
    } catch (error: any) {
      console.error(error)

      Alert.alert(
        'Erro',
        error.message ?? 'Erro ao criar usuário.'
      )
    }
  }

  return (
    <SafeAreaView>
      <YStack gap='$4' paddingVertical={20}>
        <Title text=' EcoAlerts 🌱' alignSelf='center' />
        <Text>Total de denuncias: {isLoading ? 'Carregando' : denuncias.length}</Text>
        <Button alignSelf="center" icon={Plus} iconSize={40} height={50} theme='light' onPress={handleCreate}>
          <Text fontSize={20}>Criar denuncia</Text>
        </Button>
        <Button alignSelf="center" icon={Plus} iconSize={40} height={50} theme='light' onPress={CreateUser}>
          <Text fontSize={20} >Criar usuário</Text>
        </Button>
      </YStack>
    </SafeAreaView>
  );
}

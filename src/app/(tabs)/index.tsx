import Header from '@/src/components/Header';
import Title from '@/src/components/Title';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'tamagui';

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#f5faf6' }}>
      <Header />
      <View padding="$4">
        <Title text="Início" alignSelf="unset" />
      </View>
    </SafeAreaView>
  );
}

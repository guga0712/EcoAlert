import Header from '@/src/components/Header';
import Title from '@/src/components/Title';
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from 'tamagui';

export default function MapsScreen() {

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }}>
      <Header />
      <View padding='$4'>
        <Title text='Mapa' alignSelf='unset' />
      </View>
    </SafeAreaView>
  );
}


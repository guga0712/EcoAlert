import Title from '@/src/components/Title'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View } from 'tamagui'


export default function Header() {
  const insets = useSafeAreaInsets()

  return (
    <View
      backgroundColor='green'
      borderBottomWidth={1}
      paddingTop={insets.top}
      paddingBottom={16}>
      <StatusBar style="light" />
      <Title text='🌱' alignSelf='center' />
    </View>
  )
}
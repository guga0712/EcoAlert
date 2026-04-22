import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, View, XStack } from 'tamagui';

export default function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View
      shadowColor="#2e7d32"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.2}
      shadowRadius={6}
      style={{ elevation: 6 }}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#2e7d32', '#1b5e20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <XStack alignItems="center" gap="$2">
          <View
            width={36}
            height={36}
            borderRadius={10}
            backgroundColor="rgba(255,255,255,0.15)"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons name="leaf" size={20} color="#fff" />
          </View>
          <Text fontSize={20} fontWeight="700" color="#fff" letterSpacing={0.5}>
            EcoAlert
          </Text>
        </XStack>
      </LinearGradient>
    </View>
  );
}

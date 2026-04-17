import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'

export default function CreateDenunciaScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Nova denúncia</ThemedText>
    </ThemedView>
  )
}

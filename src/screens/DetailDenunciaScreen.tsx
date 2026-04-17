import { ThemedText } from '@/src/components/themed-text'
import { ThemedView } from '@/src/components/themed-view'

export default function DetailDenunciaScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Detalhe da denúncia</ThemedText>
    </ThemedView>
  )
}

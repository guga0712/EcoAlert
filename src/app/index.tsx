import { Redirect } from 'expo-router';

import { useAuth } from '@/src/contexts/auth';

export default function Index() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

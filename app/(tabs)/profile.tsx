import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { signInWithEmail, signUpWithEmail, signOut } from '@/lib/auth';
import { syncRecipes } from '@/lib/sync';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ProfileScreen() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Vul in', 'Vul je e-mailadres en wachtwoord in.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Wachtwoord te kort', 'Je wachtwoord moet minimaal 6 tekens zijn.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegistering) {
        const data = await signUpWithEmail(email.trim(), password);
        if (data.session) {
          await syncRecipes();
          Alert.alert('Account aangemaakt', 'Je recepten worden nu gesynchroniseerd met de cloud.');
        } else {
          Alert.alert('Bevestig je e-mail', 'We hebben een bevestigingsmail gestuurd. Klik op de link in de mail en log daarna in.');
        }
      } else {
        await signInWithEmail(email.trim(), password);
        await syncRecipes();
        Alert.alert('Ingelogd', 'Je recepten worden nu gesynchroniseerd met de cloud.');
      }
    } catch (e: any) {
      const msg = e.message?.includes('Invalid login')
        ? 'Onjuist e-mailadres of wachtwoord.'
        : e.message?.includes('already registered')
        ? 'Dit e-mailadres is al geregistreerd. Probeer in te loggen.'
        : e.message || 'Probeer het opnieuw.';
      Alert.alert(isRegistering ? 'Registratie mislukt' : 'Inloggen mislukt', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Uitloggen',
      'Je recepten blijven lokaal bewaard, maar worden niet meer gesynchroniseerd.',
      [
        { text: 'Annuleer', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (e: any) {
              Alert.alert('Fout', e.message);
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncRecipes();
      Alert.alert('Gesynchroniseerd', 'Je recepten zijn bijgewerkt.');
    } catch (e: any) {
      Alert.alert('Sync mislukt', e.message || 'Probeer het later opnieuw.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2f95dc" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 bg-gray-100" contentContainerClassName="p-5">
          <View className="bg-white rounded-2xl p-6 items-center mt-5 shadow-sm">
            <FontAwesome name="cloud-upload" size={48} color="#2f95dc" style={{ marginBottom: 16 }} />
            <Text className="text-2xl font-bold mb-2 text-black">Cloud backup</Text>
            <Text className="text-base text-gray-500 text-center leading-6 mb-6">
              {isRegistering
                ? 'Maak een account aan om je recepten veilig in de cloud op te slaan.'
                : 'Log in om je recepten te synchroniseren met de cloud.'}
            </Text>

            <TextInput
              style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 12 }}
              placeholder="E-mailadres"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TextInput
              style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 20 }}
              placeholder="Wachtwoord"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />

            <Pressable
              className={`w-full bg-blue-500 py-3.5 rounded-xl items-center ${isSubmitting ? 'opacity-60' : ''}`}
              onPress={handleAuth}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  {isRegistering ? 'Account aanmaken' : 'Inloggen'}
                </Text>
              )}
            </Pressable>

            <Pressable className="mt-4 p-2" onPress={() => setIsRegistering(!isRegistering)}>
              <Text className="text-blue-500 text-base">
                {isRegistering ? 'Heb je al een account? Log in' : 'Nog geen account? Registreer'}
              </Text>
            </Pressable>
          </View>

          <Text className="text-sm text-gray-400 text-center mt-4 px-5">
            Je kunt de app ook zonder account gebruiken. Recepten worden dan alleen lokaal opgeslagen.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-5">
      <View className="bg-white rounded-2xl p-6 items-center mt-5 shadow-sm">
        <FontAwesome name="check-circle" size={48} color="#34c759" style={{ marginBottom: 16 }} />
        <Text className="text-2xl font-bold mb-2 text-black">Ingelogd</Text>
        <Text className="text-base text-gray-500 text-center leading-6 mb-2">
          {user?.email || 'Onbekend'}
        </Text>
        <Text className="text-sm text-green-500 text-center mb-5">
          Je recepten worden automatisch gesynchroniseerd met de cloud.
        </Text>

        <Pressable
          className={`flex-row items-center bg-blue-500 px-5 py-3 rounded-xl w-full justify-center gap-2 ${isSyncing ? 'opacity-60' : ''}`}
          onPress={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome name="refresh" size={16} color="#fff" />
              <Text className="text-white text-base font-semibold">Synchroniseer nu</Text>
            </>
          )}
        </Pressable>
      </View>

      <Pressable className="mt-5 items-center p-3.5" onPress={handleSignOut}>
        <Text className="text-red-500 text-base font-medium">Uitloggen</Text>
      </Pressable>
    </View>
  );
}

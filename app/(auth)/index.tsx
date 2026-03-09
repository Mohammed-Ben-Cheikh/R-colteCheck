import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () =>
      mode === "login"
        ? "Connexion Agriculteur"
        : "Créer un compte Agriculteur",
    [mode],
  );

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation", "Email et mot de passe sont obligatoires.");
      return;
    }

    if (mode === "register" && !fullName.trim()) {
      Alert.alert(
        "Validation",
        "Le nom complet est obligatoire pour créer le compte.",
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp({ email, password, fullName, phone });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      Alert.alert("Erreur Firebase", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.card}>
          <ThemedText type="title" style={styles.title}>
            RécolteCheck
          </ThemedText>
          <ThemedText style={styles.subtitle}>{title}</ThemedText>

          {mode === "register" && (
            <TextInput
              placeholder="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
          )}

          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          {mode === "register" && (
            <TextInput
              placeholder="Téléphone (optionnel)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
            />
          )}

          <Pressable
            onPress={handleSubmit}
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {mode === "login" ? "Se connecter" : "Créer le compte"}
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.switchRow}>
            <ThemedText>
              {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}
            </ThemedText>
            <Pressable
              onPress={() => setMode(mode === "login" ? "register" : "login")}
            >
              <ThemedText type="link" style={styles.switchLink}>
                {mode === "login" ? "S'inscrire" : "Se connecter"}
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 28,
  },
  subtitle: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  switchLink: {
    lineHeight: 22,
  },
});

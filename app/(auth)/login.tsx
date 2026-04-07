import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import authService from "../../api/authService";
import { Colors } from "../../constants/theme";

const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const { isLoading } = useSelector((state: any) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Invalid email format";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await dispatch(authService.login(email.trim(), password));
      router.replace("/");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Something went wrong";
      const status = error?.response?.status;

      if (
        status === 401 ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("authenticate")
      ) {
        Alert.alert(
          "Authentication Failed",
          "Please check your email and password and try again.",
        );
      } else if (
        status === 403 ||
        msg.toLowerCase().includes("verif") ||
        msg.toLowerCase().includes("document")
      ) {
        Alert.alert(
          "Verification Pending",
          "Your documents are under review. You can sign in after verification.",
        );
      } else if (!error?.response) {
        Alert.alert(
          "Network Error",
          "Please check your connection and API URL, then try again.",
        );
      } else {
        Alert.alert("Login Failed", msg);
      }
    }
  };

  return (
    <LinearGradient colors={["#FFF4EE", "#FFE2D3", "#FFF9F5"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.topGlow} />
          <View style={styles.bottomGlow} />

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroBlock}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to manage pickups, deliveries, and your activity.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Pickup Person Account</Text>

              <TextInput
                placeholder="Email"
                placeholderTextColor="#9A8F88"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

              <TextInput
                placeholder="Password"
                placeholderTextColor="#9A8F88"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              {errors.password ? (
                <Text style={styles.error}>{errors.password}</Text>
              ) : null}

              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Info", "Forgot password flow is not set up yet.")
                }
              >
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              <View style={styles.linewithtext}>
                <View style={styles.line} />
                <Text style={styles.text}>or</Text>
                <View style={styles.line} />
              </View>

              <Text style={styles.otherSignIn}>Sign in with</Text>
              <View style={styles.otherSignInicon}>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#3b5998" }]}
                >
                  <FontAwesome name="facebook-f" size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#ff8c00" }]}
                >
                  <MaterialIcons name="email" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New pickup partner?</Text>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push("/(auth)/signup")}
            >
              <AntDesign name="arrow-up" size={14} color={Colors.default.primary} />
              <Text style={styles.footerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topGlow: {
    position: "absolute",
    top: -80,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 90, 31, 0.14)",
  },
  bottomGlow: {
    position: "absolute",
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 171, 137, 0.18)",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
  },
  heroBlock: {
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 180,
    height: 138,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#221813",
  },
  subtitle: {
    textAlign: "center",
    color: "#6C5E57",
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    shadowColor: "#A3471E",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 7,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: Colors.default.primary,
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#FFF7F3",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 54,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#F2D6CA",
    color: Colors.default.text,
  },
  button: {
    backgroundColor: Colors.default.primary,
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    shadowColor: Colors.default.primary,
    shadowOpacity: 0.24,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  forgotPassword: {
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: "#7A5B4C",
    marginTop: 6,
  },
  error: {
    color: "#C62828",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 6,
  },
  linewithtext: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E7CFC2",
  },
  text: {
    fontSize: 14,
    color: "#8B7468",
    marginHorizontal: 12,
  },
  otherSignIn: {
    color: "#7A5B4C",
    textAlign: "center",
    fontSize: 14,
    marginTop: 14,
    marginBottom: 10,
  },
  otherSignInicon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  footerText: {
    color: "#6F625C",
    fontSize: 14,
    fontWeight: "600",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF1EA",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  footerButtonText: {
    color: Colors.default.primary,
    fontWeight: "700",
  },
});

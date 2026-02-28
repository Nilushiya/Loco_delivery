import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import authService from "../../api/authService";
import { Colors } from "../../constants/theme";

type LoginScreenProps = NativeStackScreenProps<any, "Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    let newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleLogin = async () => {
    if (!validate()) return;

    try {
      authService.login({ email, password });
      Alert.alert("Success", "Login successful!");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Something went wrong",
      );
    }
  };

  return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <TouchableOpacity onPress={() => router.push("/#")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Eat Now!</Text>
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

          {/* Email Login */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#ff8c00" }]}
          >
            <MaterialIcons name="email" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.SignupBtn}>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <AntDesign name="up" size={15} color="white" style={styles.upArrow}/>
          <Text style={[styles.signup, {color:"white"}]}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.default.background,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  gradient: {
    flex: 1,
  },
  card: {
    padding: 25,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: Colors.default.primary,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  input: {
    backgroundColor: Colors.default.white,
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 40,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: Colors.default.gray,
  },
  button: {
    backgroundColor: Colors.default.primary,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    textAlign: "right",
    textDecorationLine: "underline",
    fontSize: 13,
    fontWeight: "500",
  },
  link: {
    textAlign: "center",
    marginTop: 15,
    color: Colors.default.primary,
    fontWeight: "500",
  },
  signup: {
    textAlign: "center",
    color: Colors.default.primary,
    fontWeight: "500",
    marginBottom: 7
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
  },
  linewithtext: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
  },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.default.primary,
  },
  text: {
    fontSize: 16,
    color: "black",
    marginBottom: 5,
  },
  otherSignIn: {
    color: Colors.default.primary,
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
  otherSignInicon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 7,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  SignupBtn: {
    flex:1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    position: "fixed",
    bottom: 0,
    backgroundColor: Colors.default.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  upArrow: {
    flex: 1,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5
  }
});

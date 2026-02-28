import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import authService from "../../api/authService";
import { Colors } from "../../constants/theme";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";

type SignupScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const SignupScreen = ({ navigation }: SignupScreenProps) => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    let newErrors: {
      username?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    // Username
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Minimum 3 characters required";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username = "Only letters and numbers allowed";
    }

    // Email
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Minimum 8 characters required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)
    ) {
      newErrors.password =
        "Must include uppercase, lowercase, number & special character";
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      authService.signup({ username, email, password });
      Alert.alert("Success", "Account created!");
      navigation.navigate("login");
    } catch (error: any) {
      Alert.alert(
        "Register Failed",
        error?.response?.data?.message || "Something went wrong",
      );
    }
  };

return (
    <LinearGradient colors={["#FEEDE6", "#FFFFFF"]} style={styles.gradient}>
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
      <View style={styles.card}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
        {errors.username && (
          <Text style={styles.error}>{errors.username}</Text>
        )}

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
        {errors.password && (
          <Text style={styles.error}>{errors.password}</Text>
        )}

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}

        <TouchableOpacity onPress={() => router.push("/#")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Never Hungry Again!</Text>
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
        <TouchableOpacity onPress={() => router.push("/login")}>
          <AntDesign name="up" size={15} color="white" style={styles.upArrow}/>
          <Text style={[styles.signup, {color:"white"}]}>Sign In</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SignupScreen;

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
    // backgroundColor: Colors.default.secondary,
    padding: 25,
    borderRadius: 20,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.default.primary,
    marginBottom: 20,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 10,
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
    forgotPassword: {
    textAlign: "right",
    textDecorationLine: "underline",
    fontSize: 13,
    fontWeight: "500",
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
    linewithtext: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 30,
    marginRight: 30,
    marginTop: 10,
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
    position: "relative",
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

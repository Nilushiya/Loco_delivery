import { AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import restaurantService from "../../api/restaurantService";
import { Colors } from "../../constants/theme";
import { resetRegistrationState } from "../../redux/slices/restaurantRegistrationSlice";

const createNormalizedAsset = (asset: any, fallbackName: string) => {
  if (!asset?.uri && !asset?.fileCopyUri) {
    return null;
  }

  const uri = asset.fileCopyUri || asset.uri;
  const name = asset.name || asset.fileName || fallbackName;
  const mimeType =
    asset.mimeType ||
    asset.type ||
    (name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg");

  return {
    uri,
    name,
    mimeType,
    type: mimeType,
  };
};

const SignupScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<any>();
  const { isSubmitting, error: submitError, successMessage } = useSelector(
    (state: any) => state.restaurantRegistration,
  );

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [userPicture, setUserPicture] = useState<any>(null);
  const [userDocument, setUserDocument] = useState<any>(null);
  const [vehiclePicture, setVehiclePicture] = useState<any>(null);
  const [vehicleDocument, setVehicleDocument] = useState<any>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    return () => {
      dispatch(resetRegistrationState());
    };
  }, [dispatch]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!firstname.trim()) nextErrors.firstname = "First name is required";
    if (!lastname.trim()) nextErrors.lastname = "Last name is required";

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Invalid email format";
    }

    if (!phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required";

    if (!password) {
      nextErrors.password = "Password is required";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    if (!userPicture) nextErrors.userPicture = "User picture is required";
    if (!userDocument) nextErrors.userDocument = "User document is required";
    if (!vehiclePicture) nextErrors.vehiclePicture = "Vehicle picture is required";
    if (!vehicleDocument) {
      nextErrors.vehicleDocument = "Vehicle document is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const pickImage = async (setter: React.Dispatch<React.SetStateAction<any>>) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setter(createNormalizedAsset(result.assets[0], "image.jpg"));
    }
  };

  const pickDocument = async (
    setter: React.Dispatch<React.SetStateAction<any>>,
  ) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets?.length) {
      setter(createNormalizedAsset(result.assets[0], "document.pdf"));
    }
  };

  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setUserPicture(null);
    setUserDocument(null);
    setVehiclePicture(null);
    setVehicleDocument(null);
    setErrors({});
  };

  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    try {
      await dispatch(
        restaurantService.registerRestaurant({
          firstname,
          lastname,
          email,
          phoneNumber,
          password,
          userPicture,
          userDocument,
          vehiclePicture,
          vehicleDocument,
        }),
      );
      resetForm();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to complete registration.";

      if (!error?.response) {
        Alert.alert("Network Error", "Please check your connection and try again.");
        return;
      }

      Alert.alert("Registration Failed", message);
    }
  };

  const getSelectedName = (asset: any, placeholder: string) =>
    asset?.name || asset?.fileName || placeholder;

  const renderUploadStatus = (asset: any, placeholder: string) =>
    asset ? `Selected: ${getSelectedName(asset, placeholder)}` : placeholder;

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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.heroBlock}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Create Pickup Person Account</Text>
              <Text style={styles.subtitle}>
                Complete the form below and upload all required business documents.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Registration Details</Text>

              {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
              {successMessage ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>{successMessage}</Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                    <Text style={styles.successLink}>Continue to Sign In</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <TextInput
                placeholder="First Name"
                placeholderTextColor="#9A8F88"
                style={styles.input}
                value={firstname}
                onChangeText={setFirstname}
              />
              {errors.firstname ? <Text style={styles.error}>{errors.firstname}</Text> : null}

              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#9A8F88"
                style={styles.input}
                value={lastname}
                onChangeText={setLastname}
              />
              {errors.lastname ? <Text style={styles.error}>{errors.lastname}</Text> : null}

              <TextInput
                placeholder="Email"
                placeholderTextColor="#9A8F88"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#9A8F88"
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber ? (
                <Text style={styles.error}>{errors.phoneNumber}</Text>
              ) : null}

              <TextInput
                placeholder="Password"
                placeholderTextColor="#9A8F88"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}



              <View style={styles.uploadSection}>
                <Text style={styles.uploadHeading}>Required Uploads</Text>

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickImage(setUserPicture)}
                >
                  <MaterialIcons
                    name="photo-camera"
                    size={20}
                    color={Colors.default.primary}
                  />
                  <Text style={styles.uploadBtnText}>
                    {renderUploadStatus(userPicture, "Select User Picture")}
                  </Text>
                </TouchableOpacity>
                {errors.userPicture ? (
                  <Text style={styles.error}>{errors.userPicture}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickDocument(setUserDocument)}
                >
                  <FontAwesome
                    name="id-card-o"
                    size={20}
                    color={Colors.default.primary}
                  />
                  <Text style={styles.uploadBtnText}>
                    {renderUploadStatus(userDocument, "Select User Document")}
                  </Text>
                </TouchableOpacity>
                {errors.userDocument ? (
                  <Text style={styles.error}>{errors.userDocument}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickImage(setVehiclePicture)}
                >
                  <MaterialIcons
                    name="directions-car"
                    size={20}
                    color={Colors.default.primary}
                  />
                  <Text style={styles.uploadBtnText}>
                    {renderUploadStatus(vehiclePicture, "Select Vehicle Picture")}
                  </Text>
                </TouchableOpacity>
                {errors.vehiclePicture ? (
                  <Text style={styles.error}>{errors.vehiclePicture}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickDocument(setVehicleDocument)}
                >
                  <MaterialIcons
                    name="description"
                    size={20}
                    color={Colors.default.primary}
                  />
                  <Text style={styles.uploadBtnText}>
                    {renderUploadStatus(
                      vehicleDocument,
                      "Select Vehicle Document",
                    )}
                  </Text>
                </TouchableOpacity>
                {errors.vehicleDocument ? (
                  <Text style={styles.error}>{errors.vehicleDocument}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register Pickup Person</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered?</Text>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <AntDesign name="arrow-up" size={14} color={Colors.default.primary} />
              <Text style={styles.footerButtonText}>Go to Sign In</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignupScreen;

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
    top: -90,
    right: -20,
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  heroBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 170,
    height: 118,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#221813",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6C5E57",
    lineHeight: 21,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
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
  submitError: {
    color: "#B42318",
    backgroundColor: "#FEE4E2",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  successBanner: {
    backgroundColor: "#E8FFF3",
    borderColor: "#A6F4C5",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  successText: {
    color: "#067647",
    fontWeight: "600",
  },
  successLink: {
    color: Colors.default.primary,
    fontWeight: "700",
    marginTop: 6,
  },
  error: {
    color: "#C62828",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 6,
    marginBottom: 4,
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
  textArea: {
    height: 96,
    paddingTop: 14,
  },
  coordinateRow: {
    flexDirection: "row",
    gap: 12,
  },
  coordinateField: {
    flex: 1,
  },
  uploadSection: {
    marginTop: 14,
  },
  uploadHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4E3E37",
    marginBottom: 8,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7F3",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F2D6CA",
    marginBottom: 8,
  },
  uploadBtnText: {
    color: "#5E524C",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.default.primary,
    height: 54,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
  footer: {
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 10,
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

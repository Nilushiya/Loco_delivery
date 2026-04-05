import { Platform } from "react-native";
import { ENDPOINTS } from "../constants/Config";
import {
    registrationFailure,
    registrationStart,
    registrationSuccess,
} from "../redux/slices/restaurantRegistrationSlice";
import apiClient from "./client";

const getMimeType = (filename, mimeType) => {
  if (mimeType) {
    return mimeType;
  }

  const extension = filename?.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return "application/pdf";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "heic") {
    return "image/heic";
  }

  return "image/jpeg";
};

const normalizeAsset = async (asset, fallbackName) => {
  if (!asset?.uri) {
    return null;
  }

  const name = asset.name || asset.fileName || fallbackName;
  const type = getMimeType(name, asset.mimeType || asset.type);
  const rawUri = asset.fileCopyUri || asset.uri;
  const uri =
    Platform.OS === "android" && rawUri?.startsWith("file://")
      ? rawUri
      : rawUri;

  if (Platform.OS === "web") {
    if (asset.file) {
      return asset.file;
    }

    const response = await fetch(uri);
    const blob = await response.blob();

    if (typeof File !== "undefined") {
      return new File([blob], name, { type });
    }

    return blob;
  }

  return {
    uri,
    name,
    type,
  };
};

const buildRestaurantRegistrationFormData = async (payload) => {
  const formData = new FormData();

  formData.append("firstname", payload.firstname.trim());
  formData.append("lastname", payload.lastname.trim());
  formData.append("email", payload.email.trim().toLowerCase());
  formData.append("phoneNumber", payload.phoneNumber.trim());
  formData.append("password", payload.password);

  formData.append(
    "userPicture",
    await normalizeAsset(payload.userPicture, "user-picture.jpg"),
  );
  formData.append(
    "userDocument",
    await normalizeAsset(payload.userDocument, "user-document.pdf"),
  );
  formData.append(
    "vehiclePicture",
    await normalizeAsset(payload.vehiclePicture, "vehicle-picture.jpg"),
  );
  formData.append(
    "vehicleDocument",
    await normalizeAsset(payload.vehicleDocument, "vehicle-document.pdf"),
  );

  return formData;
};

const restaurantService = {
  registerRestaurant: (payload) => async (dispatch) => {
    dispatch(registrationStart());

    try {
      const formData = await buildRestaurantRegistrationFormData(payload);
      const response = await apiClient.post(
        ENDPOINTS.RESTAURANT_REGISTER,
        formData,
        {
          headers: {
            Accept: "application/json",
            ...(Platform.OS !== "web"
              ? { "Content-Type": "multipart/form-data" }
              : {}),
          },
          transformRequest: (data) => data,
        },
      );

      dispatch(registrationSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to register restaurant. Please try again.";

      dispatch(registrationFailure(errorMessage));
      throw error;
    }
  },
};

export default restaurantService;

import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/create.styles";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Recipe</Text>
      </View>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          style={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.form}>
              {/* RECIPE TITLE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Recipe Title</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter the name of the recipe"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>

              {/* CAPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Caption</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe the meal..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>

              {/* UPLOAD BUTTON (non-functional for now) */}
              <TouchableOpacity
                style={styles.button}
                disabled={loading}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Share Recipe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
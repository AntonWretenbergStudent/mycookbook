import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const { height } = Dimensions.get('window');

const CustomMealModal = ({ visible, onClose, mealType, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showNutrition, setShowNutrition] = useState(false);
  const [calories, setCalories] = useState('');
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  
  const modalAnimation = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    if (visible) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start();
      
      // Clear form when closing
      setName('');
      setDescription('');
      setCalories('');
      setShowNutrition(false);
      setImage(null);
      setImageBase64(null);
      setShowImageOptions(false);
    }
  }, [visible]);

  const translateY = modalAnimation.interpolate({
    inputRange: [0, this.complete ? 1 : 1],
    outputRange: [height, 0]
  });

  const getMealTitle = () => {
    switch(mealType) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      default: return 'Meal';
    }
  };

  const getMealIcon = () => {
    switch(mealType) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'restaurant-outline';
      case 'dinner': return 'moon-outline';
      default: return 'restaurant-outline';
    }
  };

  const getMealColor = () => {
    switch(mealType) {
      case 'breakfast': return '#f39c12';
      case 'lunch': return '#3498db';
      case 'dinner': return '#9b59b6';
      default: return COLORS.primary;
    }
  };
  
  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera permissions to take a photo");
        return false;
      }
      return true;
    }
    return true;
  };
  
  const requestGalleryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera roll permissions to select an image");
        return false;
      }
      return true;
    }
    return true;
  };
  
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
      
      setShowImageOptions(false);
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Error", "There was a problem taking the photo");
    }
  };
  
  const pickImage = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64);
        } else {
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
      
      setShowImageOptions(false);
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "There was a problem selecting your image");
    }
  };
  
  const handleImagePress = () => {
    if (image) {
      // If image exists, show options to replace or remove
      Alert.alert(
        "Image Options",
        "What would you like to do?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Remove Image", onPress: () => {
            setImage(null);
            setImageBase64(null);
          }},
          { text: "Replace Image", onPress: () => setShowImageOptions(true) }
        ]
      );
    } else {
      // If no image, show options to add
      setShowImageOptions(true);
    }
  };
  
  const handleSave = () => {
    if (!name) return; // Name is required
    
    // Format image for storage if available
    let imageUrl = null;
    if (image && imageBase64) {
      const uriParts = image.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";
      imageUrl = `data:${imageType};base64,${imageBase64}`;
    }
    
    const customMeal = {
      name,
      description,
      nutrition: {
        calories: calories ? parseInt(calories) : 0
      },
      image: imageUrl,
      isCustom: true
    };
    
    onSave(customMeal);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ margin: 0, padding: 0 }}
            >
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY }] }
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.headerIconContainer}>
                    <Ionicons name={getMealIcon()} size={24} color={getMealColor()} />
                  </View>
                  <Text style={[styles.modalTitle, { color: getMealColor() }]}>
                    Add Custom {getMealTitle()}
                  </Text>
                  <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.formContainer}>
                  {/* Image Picker */}
                  <TouchableOpacity style={styles.imagePicker} onPress={handleImagePress}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.previewImage} />
                    ) : (
                      <View style={styles.placeholderContainer}>
                        <Ionicons
                          name="image-outline"
                          size={40}
                          color={COLORS.icon}
                        />
                        <Text style={styles.placeholderText}>
                          Tap to add an image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  {/* Image Option Buttons */}
                  {showImageOptions && (
                    <View style={styles.imageOptionsContainer}>
                      <TouchableOpacity 
                        style={styles.imageOptionButton}
                        onPress={takePhoto}
                      >
                        <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.imageOptionText}>Take Photo</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.imageOptionButton}
                        onPress={pickImage}
                      >
                        <Ionicons name="images-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.imageOptionText}>Choose from Gallery</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.imageOptionButton, styles.cancelButton]}
                        onPress={() => setShowImageOptions(false)}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Meal Name*</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter meal name"
                      placeholderTextColor={COLORS.placeholderText}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter meal description"
                      placeholderTextColor={COLORS.placeholderText}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.nutritionToggleButton}
                    onPress={() => setShowNutrition(!showNutrition)}
                  >
                    <Text style={styles.nutritionToggleText}>
                      {showNutrition ? 'Hide Nutrition Info' : 'Add Nutrition Info'}
                    </Text>
                    <Ionicons 
                      name={showNutrition ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                  </TouchableOpacity>
                  
                  {showNutrition && (
                    <View style={styles.nutritionContainer}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Calories</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="kcal"
                          placeholderTextColor={COLORS.placeholderText}
                          value={calories}
                          onChangeText={setCalories}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, !name ? styles.saveButtonDisabled : null]}
                    onPress={handleSave}
                    disabled={!name}
                  >
                    <Text style={styles.saveButtonText}>Save Meal</Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIconContainer: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    padding: 16,
  },
  imagePicker: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    marginBottom: 16,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  imageOptionsContainer: {
    marginBottom: 16,
  },
  imageOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageOptionText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  cancelButton: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  nutritionToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  nutritionToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nutritionContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomMealModal;
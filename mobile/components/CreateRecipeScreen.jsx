import { useState } from "react"
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import COLORS from "../constants/colors"
import { useAuthStore } from "../store/authStore"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import { API_URI } from "../constants/api"
import styles from "../assets/styles/create.styles"
import { FlatList } from "react-native"

export default function CreateRecipeScreen() {
  const [title, setTitle] = useState("")
  const [caption, setCaption] = useState("")
  const [rating, setRating] = useState(3)
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // State for ingredients
  const [ingredients, setIngredients] = useState([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [currentQuantity, setCurrentQuantity] = useState("")
  const [currentUnit, setCurrentUnit] = useState("")
  const [showIngredientsSection, setShowIngredientsSection] = useState(false)

  const router = useRouter()
  const { token } = useAuthStore()

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need camera roll permissions to upload an image"
          )
          return
        }
      }

      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)

        // if base64 is provided, use it
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        } else {
          // otherwise convert to base64
          const base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          )
          setImageBase64(base64)
        }
      }
    } catch (error) {
      console.log("Error picking image:", error)
      Alert.alert("Error", "There was a problem selecting your image")
    }
  }

  const handleAddIngredient = () => {
    if (!currentIngredient.trim()) {
      Alert.alert("Error", "Please enter an ingredient name")
      return
    }

    const newIngredient = {
      id: Date.now().toString(), // Simple unique ID
      name: currentIngredient.trim(),
      quantity: currentQuantity.trim() || "to taste",
      unit: currentUnit.trim() || ""
    }

    setIngredients([...ingredients, newIngredient])
    setCurrentIngredient("")
    setCurrentQuantity("")
    setCurrentUnit("")
  }

  const handleRemoveIngredient = (id) => {
    setIngredients(ingredients.filter(ingredient => ingredient.id !== id))
  }

  const handleToggleIngredients = () => {
    setShowIngredientsSection(!showIngredientsSection)
  }

  const renderIngredientItem = ({ item }) => (
    <View style={styles.ingredientItem}>
      <View style={styles.ingredientInfo}>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <Text style={styles.ingredientQuantity}>
          {item.quantity} {item.unit}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeIngredientButton}
        onPress={() => handleRemoveIngredient(item.id)}
      >
        <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  )

  const handleSubmit = async () => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      const uriParts = image.split(".")
      const fileType = uriParts[uriParts.length - 1]
      const imageType = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg"

      const imageDataUrl = `data:${imageType};base64,${imageBase64}`

      const response = await fetch(`${API_URI}/recipes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataUrl,
          ingredients: ingredients.length > 0 ? ingredients : undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      Alert.alert("Success", "Your recipe has been posted!")
      setTitle("")
      setCaption("")
      setRating(3)
      setImage(null)
      setImageBase64(null)
      setIngredients([])

      router.push("/")
    } catch (error) {
      console.error("Error creating post:", error)
      Alert.alert("Error", error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const renderRatingPicker = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : "rgba(255,255,255,0.5)"}
          />
        </TouchableOpacity>
      )
    }
    return <View style={styles.ratingContainer}>{stars}</View>
  }

  return (
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
              <Text style={styles.label}>Recipe Title*</Text>
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

            {/* RATING */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Rating*</Text>
              {renderRatingPicker()}
            </View>

            {/* IMAGE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Recipe Image*</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={pickImage}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.placeholderText}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* INGREDIENTS SECTION */}
            <View style={styles.formGroup}>
              <TouchableOpacity 
                style={styles.sectionToggle}
                onPress={handleToggleIngredients}
              >
                <Text style={styles.sectionToggleText}>
                  {showIngredientsSection ? "Hide Ingredients" : "Add Ingredients"}
                </Text>
                <Ionicons 
                  name={showIngredientsSection ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="rgba(255,255,255,0.7)" 
                />
              </TouchableOpacity>

              {showIngredientsSection && (
                <View style={styles.ingredientsContainer}>
                  <Text style={styles.ingredientsTitle}>Ingredients</Text>
                  
                  {/* Current ingredients list */}
                  {ingredients.length > 0 ? (
                    <FlatList
                      data={ingredients}
                      renderItem={renderIngredientItem}
                      keyExtractor={(item) => item.id}
                      style={styles.ingredientsList}
                      scrollEnabled={false}
                    />
                  ) : (
                    <Text style={styles.noIngredientsText}>
                      No ingredients added yet
                    </Text>
                  )}
                  
                  {/* Ingredient input fields */}
                  <View style={styles.ingredientInputRow}>
                    <View style={styles.quantityContainer}>
                      <TextInput
                        style={styles.quantityInput}
                        placeholder="Qty"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={currentQuantity}
                        onChangeText={setCurrentQuantity}
                        keyboardType="numeric"
                      />
                    </View>
                    
                    <View style={styles.unitContainer}>
                      <TextInput
                        style={styles.unitInput}
                        placeholder="Unit"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={currentUnit}
                        onChangeText={setCurrentUnit}
                      />
                    </View>
                    
                    <View style={styles.ingredientNameContainer}>
                      <TextInput
                        style={styles.ingredientNameInput}
                        placeholder="Ingredient name"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={currentIngredient}
                        onChangeText={setCurrentIngredient}
                      />
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.addIngredientButton}
                    onPress={handleAddIngredient}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color={COLORS.white}
                      style={styles.addIngredientIcon}
                    />
                    <Text style={styles.addIngredientText}>Add Ingredient</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* CAPTION */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Caption*</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the meal..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            {/* UPLOAD */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share Recipe</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
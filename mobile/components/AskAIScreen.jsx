import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Modal,
  Animated,
  Easing,
} from "react-native"
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as FileSystem from "expo-file-system"
import COLORS from "../constants/colors"
import { useAuthStore } from "../store/authStore"
import { API_URI } from "../constants/api"

export default function AskAIScreen() {
  const [ingredients, setIngredients] = useState([])
  const [currentIngredient, setCurrentIngredient] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [aiResponse, setAiResponse] = useState(null)
  const [parsedRecipes, setParsedRecipes] = useState([])
  const [activeTab, setActiveTab] = useState("text")
  const { token } = useAuthStore()
  
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const rotation = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  
  const inputRef = useRef(null)

  useEffect(() => {
    if (loading) {
      // Rotation animation for loading icon
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start()

      // Fade in animation for overlay
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      rotation.stopAnimation()
      
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [loading])

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  const addIngredient = () => {
    if (currentIngredient.trim().length > 0) {
      setIngredients([...ingredients, currentIngredient.trim()])
      setCurrentIngredient("")
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  // Handle removing an ingredient
  const removeIngredient = (index) => {
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  // Handle picking an image from library
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload an image"
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        } else {
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

  // Handle taking a photo
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera permissions to take a photo"
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        } else {
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
      console.log("Error taking photo:", error)
      Alert.alert("Error", "There was a problem taking the photo")
    }
  }

  // Reset the image
  const resetImage = () => {
    setImage(null)
    setImageBase64(null)
    setAiResponse(null)
    setParsedRecipes([])
  }

  const formatAIResponse = (responseText) => {
    if (!responseText) return []
    
    console.log("AI response:", responseText)

    const recipes = []
    
    try {
      const recipePattern = /Recipe\s+\d+:[\s\S]*?(?=Recipe\s+\d+:|$)/g
      const matches = Array.from(responseText.matchAll(recipePattern))
      
      if (matches.length > 0) {
        matches.forEach((match, index) => {
          const recipeText = match[0]
          
          const recipe = {
            title: `Recipe ${index + 1}`,
            description: "",
            ingredients: [],
            instructions: []
          }
          
          const titleMatch = recipeText.match(/Recipe\s+\d+:\s*(.+?)(?:\r|\n|$)/)
          if (titleMatch && titleMatch[1]) {
            recipe.title = titleMatch[1].trim()
          }
          
          const descriptionMatch = recipeText.match(/Description:[\s\S]*?(?=Ingredients:|$)/i)
          if (descriptionMatch) {
            const descriptionText = descriptionMatch[0].replace(/Description:/i, "").trim()
            recipe.description = descriptionText;
          }
          
          const ingredientsMatch = recipeText.match(/Ingredients:[\s\S]*?(?=Instructions:|$)/i)
          if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[0].replace(/Ingredients:/i, "").trim()
            recipe.ingredients = ingredientsText
              .split(/\n/)
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => line.replace(/^[-•*]\s*/, ''))
          }
          
          const instructionsMatch = recipeText.match(/Instructions:[\s\S]*?$/i)
          if (instructionsMatch) {
            const instructionsText = instructionsMatch[0].replace(/Instructions:/i, "").trim()
            recipe.instructions = instructionsText
              .split(/\n/)
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .map(line => line.replace(/^\d+\.\s*/, ''))
          }
          
          // Add recipe to array if it has content
          if (recipe.title) {
            recipes.push(recipe)
          }
        })
      } 
      
      // If no matches with the pattern, try a fallback approach
      if (recipes.length === 0) {
        const lines = responseText.split('\n')
        let currentRecipe = null
        let currentSection = null
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          if (!trimmedLine) continue
          
          // Check for recipe header
          const recipeMatch = trimmedLine.match(/Recipe\s+(\d+):\s*(.*)/i)
          if (recipeMatch) {
            if (currentRecipe) {
              recipes.push(currentRecipe)
            }
            
            currentRecipe = {
              title: recipeMatch[2] || `Recipe ${recipeMatch[1]}`,
              description: "",
              ingredients: [],
              instructions: []
            }
            currentSection = null
            continue
          }
          
          // Check for section headers
          if (trimmedLine.match(/^Description:/i)) {
            currentSection = "description"
            continue
          } else if (trimmedLine.match(/^Ingredients:/i)) {
            currentSection = "ingredients"
            continue
          } else if (trimmedLine.match(/^Instructions:|^Steps:/i)) {
            currentSection = "instructions"
            continue
          }
          
          if (currentRecipe && currentSection) {
            if (currentSection === "description") {
              currentRecipe.description += (currentRecipe.description ? " " : "") + trimmedLine
            } else if (currentSection === "ingredients") {
              currentRecipe.ingredients.push(trimmedLine.replace(/^[-•*]\s*/, ''))
            } else if (currentSection === "instructions") {
              currentRecipe.instructions.push(trimmedLine.replace(/^\d+\.\s*/, ''))
            }
          }
        }
        
        // Add the last recipe if we have one
        if (currentRecipe) {
          recipes.push(currentRecipe)
        }
      }
      
      console.log(`Found ${recipes.length} recipes`)
      
      return recipes.map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || []
      }))
    } catch (error) {
      console.error("Error parsing AI response:", error)
      
      return [{
        title: "Recipe suggestion",
        description: "Based on your ingredients",
        ingredients: [],
        instructions: [responseText.trim()]
      }]
    }
  }

  // Open recipe detail modal
  const openRecipeDetail = (recipe) => {
    setSelectedRecipe(recipe)
    setModalVisible(true)
  }

  // Get suggestions from AI
  const getAISuggestions = async () => {
    try {
      setLoading(true)
      setAiResponse(null)
      setParsedRecipes([])

      // Validate inputs based on active tab
      if (activeTab === "text" && ingredients.length === 0) {
        Alert.alert("Error", "Please add at least one ingredient")
        setLoading(false)
        return
      }

      if (activeTab === "image" && !imageBase64) {
        Alert.alert(
          "Error",
          "Please take or select a photo of your ingredients"
        )
        setLoading(false)
        return
      }

      // Prepare request data
      let requestData = {}

      if (activeTab === "text") {
        requestData = {
          ingredients: ingredients,
          type: "text",
        }
      } else {
        // Format the image data for API
        const imageData = `data:image/jpeg;base64,${imageBase64}`
        requestData = {
          image: imageData,
          type: "image",
        }
      }

      // Call API
      const response = await fetch(`${API_URI}/ai/suggestions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to get suggestions")
      }

      const data = await response.json()
      setAiResponse(data.response)
      
      // Parse the AI response
      const recipes = formatAIResponse(data.response)
      setParsedRecipes(recipes)
      
    } catch (error) {
      console.error("Error getting AI suggestions:", error)
      Alert.alert("Error", error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Handle rendering ingredient items
  const renderIngredientItem = ({ item, index }) => (
    <View style={styles.ingredientItem}>
      <Text style={styles.ingredientText}>{item}</Text>
      <TouchableOpacity onPress={() => removeIngredient(index)}>
        <Ionicons
          name="close-circle"
          size={20}
          color="rgba(255,255,255,0.7)"
        />
      </TouchableOpacity>
    </View>
  )

  // Simplified recipe card that matches your app design
  const renderRecipeCard = ({ item, index }) => {
    // Get counts for display
    const ingredientCount = item.ingredients ? item.ingredients.length : 0
    const instructionCount = item.instructions ? item.instructions.length : 0
    
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => openRecipeDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeBadge}>Recipe {index + 1}</Text>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </View>
        
        <Text style={styles.recipeTitle}>{item.title}</Text>
        
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description || "No description available"}
        </Text>
        
        <View style={styles.recipeStats}>
          <View style={styles.recipeStat}>
            <Ionicons name="list-outline" size={16} color="#fff" />
            <Text style={styles.recipeStatText}>
              {ingredientCount} ingredients
            </Text>
          </View>
          
          <View style={styles.recipeStat}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.recipeStatText}>
              {instructionCount} steps
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewRecipeButton}
          onPress={() => openRecipeDetail(item)}
        >
          <Text style={styles.viewRecipeButtonText}>View Full Recipe</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  // Render the main content based on the active tab
  const renderInputContent = () => {
    if (activeTab === "text") {
      return (
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Enter Your Ingredients</Text>
          <Text style={styles.sectionSubtitle}>
            List the ingredients you have, and I'll suggest recipes you can make
          </Text>
          
          {/* Ingredient input field */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Add an ingredient..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              onSubmitEditing={addIngredient}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addIngredient}
              disabled={currentIngredient.trim().length === 0}
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Ingredients list */}
          {ingredients.length > 0 ? (
            <View style={styles.ingredientsList}>
              <FlatList
                data={ingredients}
                numColumns={2}
                renderItem={renderIngredientItem}
                keyExtractor={(item, index) => `ingredient-${index}`}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.emptyIngredientsContainer}>
              <Ionicons
                name="leaf-outline"
                size={40}
                color="rgba(255,255,255,0.3)"
              />
              <Text style={styles.emptyIngredientsText}>
                Start by adding ingredients you have
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.getRecipesButton,
              ingredients.length === 0 ? styles.disabledButton : null,
            ]}
            onPress={getAISuggestions}
            disabled={ingredients.length === 0 || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons
                  name="restaurant-outline"
                  size={24}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Get Recipe Ideas</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )
    } else {
      return (
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>
            Take a Photo of Your Ingredients
          </Text>
          <Text style={styles.sectionSubtitle}>
            Take a photo of what's in your fridge, and I'll suggest what you can make
          </Text>

          {/* Image picker/preview */}
          {!image ? (
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={takePhoto}
              >
                <Ionicons
                  name="camera-outline"
                  size={44}
                  color={COLORS.primary}
                />
                <Text style={styles.imagePickerText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <Ionicons
                  name="images-outline"
                  size={44}
                  color={COLORS.primary}
                />
                <Text style={styles.imagePickerText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />

              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity
                  style={styles.resetImageButton}
                  onPress={resetImage}
                >
                  <Ionicons name="refresh-outline" size={20} color="white" />
                  <Text style={styles.resetImageText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.getRecipesButton,
                    loading ? styles.disabledButton : null,
                  ]}
                  onPress={getAISuggestions}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Ionicons
                        name="restaurant-outline"
                        size={24}
                        color="white"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.buttonText}>Get Recipe Ideas</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )
    }
  }

  // Render the AI response as recipe cards
  const renderRecipes = () => {
    if (!aiResponse || parsedRecipes.length === 0) return null
    
    return (
      <View style={styles.recipesContainer}>
        <Text style={styles.recipesTitle}>AI Recipe Suggestions</Text>
        
        <Text style={styles.recipesSubtitle}>
          Based on {activeTab === 'text' 
            ? `your ingredients: ${ingredients.join(', ')}` 
            : 'the image you provided'}
        </Text>
        
        <FlatList
          data={parsedRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(_, index) => `recipe-${index}`}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "text" ? styles.activeTab : null]}
          onPress={() => setActiveTab("text")}
        >
          <Ionicons
            name="list-outline"
            size={22}
            color={activeTab === "text" ? "white" : "rgba(255,255,255,0.7)"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "text" ? styles.activeTabText : null,
            ]}
          >
            Input Text
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "image" ? styles.activeTab : null,
          ]}
          onPress={() => setActiveTab("image")}
        >
          <Ionicons
            name="camera-outline"
            size={22}
            color={activeTab === "image" ? "white" : "rgba(255,255,255,0.7)"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "image" ? styles.activeTabText : null,
            ]}
          >
            Use Camera
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderInputContent()}
        {renderRecipes()}
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalBackButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Recipe</Text>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {selectedRecipe && (
                <>
                  {/* Recipe Title */}
                  <Text style={styles.recipeDetailTitle}>
                    {selectedRecipe.title}
                  </Text>
                  
                  {/* Recipe Description */}
                  {selectedRecipe.description ? (
                    <Text style={styles.recipeDetailDescription}>
                      {selectedRecipe.description}
                    </Text>
                  ) : null}
                  
                  {/* Ingredients Section */}
                  <View style={styles.recipeDetailSection}>
                    <Text style={styles.recipeDetailSectionTitle}>
                      Ingredients
                    </Text>
                    {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                      selectedRecipe.ingredients.map((ingredient, index) => (
                        <View 
                          key={`ingredient-${index}`}
                          style={styles.recipeDetailIngredientItem}
                        >
                          <Ionicons name="ellipse" size={8} color={COLORS.primary} style={styles.ingredientBullet} />
                          <Text style={styles.recipeDetailIngredientText}>
                            {ingredient}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noContentText}>No ingredients available</Text>
                    )}
                  </View>
                  
                  {/* Instructions Section */}
                  <View style={styles.recipeDetailSection}>
                    <Text style={styles.recipeDetailSectionTitle}>
                      Instructions
                    </Text>
                    {selectedRecipe.instructions && selectedRecipe.instructions.length > 0 ? (
                      selectedRecipe.instructions.map((instruction, index) => (
                        <View key={`instruction-${index}`} style={styles.recipeDetailInstructionItem}>
                          <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.recipeDetailInstructionText}>
                            {instruction}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noContentText}>No instructions available</Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Loading overlay */}
      {loading && (
        <Animated.View 
          style={[
            styles.loadingOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.loadingContainer}>
            <Animated.View 
              style={[
                styles.loadingIconContainer,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <Ionicons name="restaurant" size={36} color={COLORS.primary} />
            </Animated.View>
            <Text style={styles.loadingText}>
              Finding recipe suggestions...
            </Text>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 30,
  },

  // Tab styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(40,50,60,0.6)",
    borderRadius: 16,
    margin: 20,
    marginBottom: 0,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  activeTabText: {
    color: "white",
    fontWeight: "700",
  },

  // Section styles
  inputSection: {
    backgroundColor: "rgba(40,50,60,0.6)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 16,
    lineHeight: 20,
  },

  // Input styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "white",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  // Ingredients list
  ingredientsList: {
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 10,
    margin: 5,
    flex: 1,
    maxWidth: "47%",
  },
  ingredientText: {
    color: "white",
    marginRight: 8,
    flex: 1,
  },
  emptyIngredientsContainer: {
    alignItems: "center",
    padding: 30,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
  },
  emptyIngredientsText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },

  // Button styles
  getRecipesButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  // Image input styles
  imagePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  imagePickerButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    width: "45%",
  },
  imagePickerText: {
    color: "white",
    marginTop: 8,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  resetImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  resetImageText: {
    color: "white",
    marginLeft: 8,
  },

  // Recipe cards styles
  recipesContainer: {
    backgroundColor: "rgba(40,50,60,0.6)",
    borderRadius: 16,
    padding: 20,
  },
  recipesTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  recipesSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 16,
  },
  recipeCard: {
    backgroundColor: "rgba(50,60,70,0.6)",
    borderRadius: 12,
    padding: 16,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeBadge: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 6,
  },
  recipeDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    marginBottom: 12,
  },
  recipeStats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  recipeStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  recipeStatText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginLeft: 6,
  },
  viewRecipeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    alignSelf: "center",
  },
  viewRecipeButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  // Recipe Detail Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  modalScrollView: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },
  recipeDetailTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  recipeDetailDescription: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 24,
    lineHeight: 22,
  },
  recipeDetailSection: {
    marginBottom: 24,
    backgroundColor: "rgba(40,50,60,0.6)",
    borderRadius: 12,
    padding: 16,
  },
  recipeDetailSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  recipeDetailIngredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ingredientBullet: {
    marginRight: 10,
    marginTop: 5,
  },
  recipeDetailIngredientText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    lineHeight: 22,
  },
  recipeDetailInstructionItem: {
    flexDirection: "row",
    marginBottom: 14,
  },
  instructionNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  recipeDetailInstructionText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    flex: 1,
    lineHeight: 22,
  },
  noContentText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },

  // Loading overlay styles
  loadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "rgba(40,50,60,0.9)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    minWidth: 200,
  },
  loadingIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  }
}
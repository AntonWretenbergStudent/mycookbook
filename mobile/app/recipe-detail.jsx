import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import COLORS from "../constants/colors";
import styles from "../assets/styles/recipe-detail.styles";
import { useAuthStore } from "../store/authStore";
import { API_URI } from "../constants/api";

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  
  // State for bookmark functionality
  const [isBookmarked, setIsBookmarked] = useState(params.isBookmarked === 'true');
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  
  // Get recipe data from params
  const recipe = {
    id: params.id,
    title: params.title || 'Recipe Name',
    caption: params.caption || 'No description available',
    image: params.image || null,
    rating: parseInt(params.rating) || 3,
    username: params.username || 'User',
    userImage: params.userImage || null,
    createdAt: params.createdAt || new Date().toISOString(),
    nutrition: params.nutrition ? JSON.parse(params.nutrition) : { calories: 0 }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.getDate() + " " + 
      ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][date.getMonth()] + 
      ". " + date.getFullYear();
  };
  
  // Handle bookmark toggle
  const handleBookmark = async () => {
    try {
      setBookmarkLoading(true);
      
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`${API_URI}/bookmarks/${recipe.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to remove bookmark");
        
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const response = await fetch(`${API_URI}/bookmarks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId: recipe.id }),
        });

        if (!response.ok) throw new Error("Failed to add bookmark");
        
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      Alert.alert("Error", error.message || "Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };
  
  // Render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : "rgba(255,255,255,0.5)"}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.primary, 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
        style={styles.backgroundGradient}
        locations={[0, 0.3, 0.6]}
      />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Recipe</Text>
        <Text style={styles.headerDate}>{formatDate(recipe.createdAt)}</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipe image */}
        <View style={styles.imageContainer}>
          {recipe.image ? (
            <Image 
              source={{ uri: recipe.image }} 
              style={styles.recipeImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={60} color="rgba(255,255,255,0.3)" />
              <Text style={styles.noImageText}>No image available</Text>
            </View>
          )}
          
          {/* Bookmark button overlay */}
          <TouchableOpacity 
            style={styles.bookmarkButton}
            onPress={handleBookmark}
            disabled={bookmarkLoading}
          >
            {bookmarkLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={26} 
                color="white" 
              />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Recipe details card */}
        <View style={styles.detailsCard}>
          {/* User info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                {recipe.userImage ? (
                  <Image
                    source={{ uri: recipe.userImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <Ionicons name="person" size={24} color="rgba(255,255,255,0.5)" />
                )}
              </View>
              <Text style={styles.username}>{recipe.username}</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              {renderRatingStars(recipe.rating)}
            </View>
          </View>
          
          {/* Recipe title */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          
          {/* Recipe description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{recipe.caption}</Text>
          </View>
          
          {/* Nutrition section - if available */}
          {recipe.nutrition && recipe.nutrition.calories > 0 && (
            <View style={styles.nutritionContainer}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                
                {recipe.nutrition.protein && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                )}
                
                {recipe.nutrition.carbs && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                )}
                
                {recipe.nutrition.fat && (
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
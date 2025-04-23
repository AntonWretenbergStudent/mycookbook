import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { formatPublishDate } from "../../lib/utils";
import { useRouter } from "expo-router";
import Loader from "../../components/Loader";
import { useAuthStore } from "../../store/authStore";
import { API_URI } from "../../constants/api";
import styles from "../../assets/styles/bookmark.styles";

// For simulating delay like in your other components
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Bookmark() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removeLoading, setRemoveLoading] = useState({});
  const [error, setError] = useState(null);
  const router = useRouter();
  const { token } = useAuthStore();

  // Load bookmarks when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBookmarks();
      return () => {};
    }, [])
  );

  const fetchBookmarks = async () => {
    setError(null);
    try {
      setLoading(true);
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_URI}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        throw new Error("Session expired. Please login again.");
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch bookmarks");
      }
      
      const data = await response.json();
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setError(error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(800);
    await fetchBookmarks();
    setRefreshing(false);
  };

  const removeBookmark = async (recipeId) => {
    try {
      setRemoveLoading(prev => ({ ...prev, [recipeId]: true }));
      
      const response = await fetch(`${API_URI}/bookmarks/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to remove bookmark");
      
      setBookmarks(prev => prev.filter(bookmark => bookmark._id !== recipeId));
      Alert.alert("Success", "Recipe removed from bookmarks");
    } catch (error) {
      console.error('Error removing bookmark:', error);
      Alert.alert("Error", "Failed to remove bookmark");
    } finally {
      setRemoveLoading(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const confirmRemove = (recipeId, event) => {
    if (event) event.stopPropagation();
    Alert.alert(
      "Remove Bookmark", 
      "Are you sure you want to remove this recipe from bookmarks?", 
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeBookmark(recipeId) }
      ]
    );
  };
  
  // Navigate to recipe detail
  const openRecipeDetail = (recipe) => {
    // Format the nutrition data for URL params
    const nutritionParam = recipe.nutrition 
      ? JSON.stringify(recipe.nutrition)
      : JSON.stringify({ calories: 0 });
    
    router.push({
      pathname: "/recipe-detail",
      params: {
        id: recipe._id,
        title: recipe.title,
        image: recipe.image,
        caption: recipe.caption,
        rating: recipe.rating.toString(),
        username: recipe.username,
        userImage: recipe.userImage,
        createdAt: recipe.createdAt,
        nutrition: nutritionParam,
        isBookmarked: 'true'
      }
    });
  };

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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookmarkCard}
      activeOpacity={0.9}
      onPress={() => openRecipeDetail(item)}
    >
      <LinearGradient
        colors={[COLORS.primary, 'rgba(0,0,0,0.4)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.recipeImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={60} color="rgba(255,255,255,0.3)" />
          <Text style={styles.noImageText}>No image available</Text>
        </View>
      )}
      
      <View style={styles.recipeDetails}>
        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <TouchableOpacity 
            onPress={(e) => confirmRemove(item._id, e)}
            style={styles.removeButton}
            disabled={removeLoading[item._id]}
          >
            {removeLoading[item._id] ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        
        <Text style={styles.recipeCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        
        <Text style={styles.recipeDate}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
        
        {/* Recipe badges */}
        <View style={styles.badgeContainer}>
          {item.nutrition && item.nutrition.protein > 15 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>HIGH PROTEIN</Text>
            </View>
          )}
          
          {item.nutrition && item.nutrition.calories < 400 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>LOW CALORIE</Text>
            </View>
          )}
          
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SAVED</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.primary, 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
        style={styles.backgroundGradient}
        locations={[0, 0.3, 0.6]}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Recipes</Text>
      </View>

      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor="white"
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.bookmarkCount}>
              {bookmarks.length} {bookmarks.length === 1 ? 'recipe' : 'recipes'} saved
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={60} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>
              {error ? "Something went wrong" : "No bookmarked recipes"}
            </Text>
            <Text style={styles.emptySubtext}>
              {error 
                ? "Pull down to refresh or try again later" 
                : "Bookmark your favorite recipes to see them here!"}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/")}
            >
              <Text style={styles.browseButtonText}>Browse Recipes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
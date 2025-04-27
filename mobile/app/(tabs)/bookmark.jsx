import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
  TextInput,
  ScrollView
} from "react-native";
import React, { useState, useCallback } from "react";
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

// Filter categories
const FILTERS = {
  ALL: 'all',
  HIGH_RATED: 'high_rated'
};

export default function Bookmark() {
  const [bookmarks, setBookmarks] = useState([]);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removeLoading, setRemoveLoading] = useState({});
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(FILTERS.ALL);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [batchDeleting, setBatchDeleting] = useState(false);
  
  const router = useRouter();
  const { token } = useAuthStore();

  // Load bookmarks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBookmarks();
      return () => {
        // Reset selection mode when leaving the screen
        setSelectionMode(false);
        setSelectedItems({});
      };
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
      const newBookmarks = Array.isArray(data) ? data : [];
      
      setAllBookmarks(newBookmarks);
      applyFilters(newBookmarks, searchQuery, activeFilter);
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

  const applyFilters = (data, query, filter) => {
    let result = [...data];
    
    // Apply search query
    if (query.trim()) {
      const searchText = query.toLowerCase();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(searchText)) ||
        (item.caption && item.caption.toLowerCase().includes(searchText)) ||
        (item.username && item.username.toLowerCase().includes(searchText))
      );
    }
    
    // Apply category filter
    if (filter !== FILTERS.ALL) {
      switch (filter) {
        case FILTERS.HIGH_RATED:
          result = result.filter(item => item.rating >= 4);
          break;
      }
    }
    
    setBookmarks(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(allBookmarks, text, activeFilter);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    applyFilters(allBookmarks, searchQuery, filter);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedItems({});
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAll = () => {
    const newSelected = {};
    bookmarks.forEach(item => {
      newSelected[item._id] = true;
    });
    setSelectedItems(newSelected);
  };

  const deselectAll = () => {
    setSelectedItems({});
  };

  const getSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  const removeBookmark = async (recipeId) => {
    try {
      setRemoveLoading(prev => ({ ...prev, [recipeId]: true }));
      
      const response = await fetch(`${API_URI}/bookmarks/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to remove bookmark");
      
      const updatedBookmarks = allBookmarks.filter(bookmark => bookmark._id !== recipeId);
      setAllBookmarks(updatedBookmarks);
      applyFilters(updatedBookmarks, searchQuery, activeFilter);
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

  const deleteSelectedBookmarks = async () => {
    const selectedIds = Object.entries(selectedItems)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);
    
    if (selectedIds.length === 0) return;
    
    try {
      setBatchDeleting(true);
      
      // Create an array of promises for each delete request
      const deletePromises = selectedIds.map(id => 
        fetch(`${API_URI}/bookmarks/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      
      // Wait for all delete requests to complete
      const results = await Promise.allSettled(deletePromises);
      
      // Count successful and failed deletions
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const failed = selectedIds.length - successful;
      
      // Update bookmarks state
      const updatedBookmarks = allBookmarks.filter(bookmark => 
        !selectedItems[bookmark._id]
      );
      
      setAllBookmarks(updatedBookmarks);
      applyFilters(updatedBookmarks, searchQuery, activeFilter);
      
      // Show result message
      if (failed === 0) {
        Alert.alert(
          "Success", 
          `${successful} ${successful === 1 ? 'recipe' : 'recipes'} removed from bookmarks`
        );
      } else {
        Alert.alert(
          "Partial Success", 
          `${successful} out of ${selectedIds.length} recipes were removed. Please try again for the remaining items.`
        );
      }
      
      // Exit selection mode after batch delete
      setSelectionMode(false);
      setSelectedItems({});
      
    } catch (error) {
      console.error('Error during batch delete:', error);
      Alert.alert("Error", "Failed to remove selected bookmarks");
    } finally {
      setBatchDeleting(false);
    }
  };

  const confirmBatchDelete = () => {
    const count = getSelectedCount();
    
    if (count === 0) {
      Alert.alert("Select Recipes", "Please select at least one recipe to delete");
      return;
    }
    
    Alert.alert(
      "Delete Selected Recipes", 
      `Are you sure you want to remove ${count} selected ${count === 1 ? 'recipe' : 'recipes'} from bookmarks?`, 
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteSelectedBookmarks }
      ]
    );
  };
  
// This is a partial snippet showing the updated openRecipeDetail function in bookmark.jsx

const openRecipeDetail = (recipe) => {
  if (selectionMode) {
    toggleItemSelection(recipe._id);
    return;
  }
  
  const nutritionParam = recipe.nutrition 
    ? JSON.stringify(recipe.nutrition)
    : JSON.stringify({ calories: 0 });
  
  const ingredientsParam = recipe.ingredients && recipe.ingredients.length > 0
    ? JSON.stringify(recipe.ingredients)
    : JSON.stringify([]);
  
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
      ingredients: ingredientsParam,
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
      style={[
        styles.bookmarkCard,
        selectedItems[item._id] ? { borderColor: COLORS.primary, borderWidth: 2 } : {}
      ]}
      activeOpacity={0.9}
      onPress={() => openRecipeDetail(item)}
      onLongPress={() => {
        if (!selectionMode) {
          setSelectionMode(true);
          toggleItemSelection(item._id);
        }
      }}
    >
      <LinearGradient
        colors={[COLORS.primary, 'rgba(0,0,0,0.4)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      
      {selectionMode && (
        <View style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: 15,
          width: 30,
          height: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ionicons
            name={selectedItems[item._id] ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={selectedItems[item._id] ? COLORS.primary : "white"}
          />
        </View>
      )}
      
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
          {!selectionMode && (
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
          )}
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

  const FilterButton = ({ title, active, onPress, iconName }) => (
    <TouchableOpacity 
      style={{
        backgroundColor: active ? COLORS.primary : 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      {iconName && (
        <Ionicons 
          name={iconName} 
          size={16} 
          color="white" 
          style={{ marginRight: 5 }}
        />
      )}
      <Text style={{ color: 'white', fontWeight: active ? '600' : '400' }}>
        {title}
      </Text>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Saved Recipes</Text>
          
          {bookmarks.length > 0 && !selectionMode && (
            <TouchableOpacity 
              onPress={toggleSelectionMode}
              style={{
                padding: 8,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
              }}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          
          {selectionMode && (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={getSelectedCount() > 0 ? confirmBatchDelete : null}
                style={{
                  padding: 8,
                  backgroundColor: getSelectedCount() > 0 ? 'rgba(255,59,48,0.2)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  marginRight: 10,
                }}
                disabled={batchDeleting || getSelectedCount() === 0}
              >
                {batchDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="trash-outline" size={24} color={getSelectedCount() > 0 ? '#FF3B30' : 'rgba(255,255,255,0.5)'} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={toggleSelectionMode}
                style={{
                  padding: 8,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                }}
                disabled={batchDeleting}
              >
                <Ionicons name="close-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {selectionMode && (
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            marginTop: 10,
            marginBottom: 15,
          }}>
            <Text style={{ color: 'white', fontSize: 16 }}>
              {getSelectedCount()} of {bookmarks.length} selected
            </Text>
            
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={selectAll}
                style={{ marginRight: 15 }}
                disabled={batchDeleting}
              >
                <Text style={{ color: COLORS.primary, fontSize: 16 }}>Select All</Text>
              </TouchableOpacity>
              
              {getSelectedCount() > 0 && (
                <TouchableOpacity 
                  onPress={deselectAll}
                  disabled={batchDeleting}
                >
                  <Text style={{ color: COLORS.primary, fontSize: 16 }}>Deselect All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {!selectionMode && (
          <>
            {/* Search input */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              marginTop: 10,
              marginBottom: 15,
            }}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
              <TextInput
                style={{
                  flex: 1,
                  height: 44,
                  color: 'white',
                  marginLeft: 8,
                  fontSize: 16,
                }}
                placeholder="Search saved recipes..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              ) : null}
            </View>
            
            {/* Filter chips */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <FilterButton 
                title="All Recipes" 
                active={activeFilter === FILTERS.ALL}
                onPress={() => handleFilterChange(FILTERS.ALL)}
                iconName="grid-outline"
              />
              <FilterButton 
                title="Highly Rated" 
                active={activeFilter === FILTERS.HIGH_RATED}
                onPress={() => handleFilterChange(FILTERS.HIGH_RATED)}
                iconName="star-outline"
              />
            </ScrollView>
          </>
        )}
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
            enabled={!selectionMode}
          />
        }
        ListHeaderComponent={
          !selectionMode && (
            <View style={styles.listHeader}>
              <Text style={styles.bookmarkCount}>
                {bookmarks.length} {bookmarks.length === 1 ? 'recipe' : 'recipes'} 
                {activeFilter !== FILTERS.ALL && (
                  activeFilter === FILTERS.HIGH_RATED ? ' (Highly Rated)' : ''
                )}
                {searchQuery ? ` matching "${searchQuery}"` : ''}
              </Text>
            </View>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={searchQuery ? "search-outline" : "bookmark-outline"} 
              size={60} 
              color="rgba(255,255,255,0.3)" 
            />
            <Text style={styles.emptyText}>
              {error ? "Something went wrong" : 
              bookmarks.length === 0 && allBookmarks.length > 0 ? "No matching recipes" :
              "No bookmarked recipes"}
            </Text>
            <Text style={styles.emptySubtext}>
              {error ? "Pull down to refresh or try again later" : 
              bookmarks.length === 0 && allBookmarks.length > 0 ? "Try different search or filter options" :
              "Bookmark your favorite recipes to see them here!"}
            </Text>
            {!selectionMode && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/")}
              >
                <Text style={styles.browseButtonText}>Browse Recipes</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}
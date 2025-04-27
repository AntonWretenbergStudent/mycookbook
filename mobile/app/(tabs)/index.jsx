import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  TextInput,
  Animated,
} from "react-native"
import { useAuthStore } from "../../store/authStore"
import { Image } from "expo-image"
import { useEffect, useState, useCallback, useRef } from "react"
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

import styles from "../../assets/styles/home.styles"
import COLORS from "../../constants/colors"
import Loader from "../../components/Loader"
import { API_URI } from "../../constants/api"
import { formatPublishDate } from "../../lib/utils"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Home() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setpage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([])
  const [bookmarkLoading, setBookmarkLoading] = useState({})
  
  // Search functionality
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef(null)
  const searchBarHeight = useRef(new Animated.Value(0)).current
  const searchBarOpacity = useRef(new Animated.Value(0)).current

  // Load bookmarks from server when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBookmarkedRecipes()
      return () => {}
    }, [])
  )

const openRecipeDetail = (recipe) => {
  // Format the nutrition data for URL params
  const nutritionParam = recipe.nutrition 
    ? JSON.stringify(recipe.nutrition)
    : JSON.stringify({ calories: 0 })
  
  // Format ingredients data for URL params
  const ingredientsParam = recipe.ingredients && recipe.ingredients.length > 0
    ? JSON.stringify(recipe.ingredients)
    : JSON.stringify([])
  
  router.push({
    pathname: "/recipe-detail",
    params: {
      id: recipe._id,
      title: recipe.title,
      image: recipe.image,
      caption: recipe.description || recipe.caption,
      rating: recipe.rating.toString(),
      username: recipe.user.username,
      userImage: recipe.user.profileImage,
      createdAt: recipe.createdAt,
      nutrition: nutritionParam,
      ingredients: ingredientsParam,
      isBookmarked: isBookmarked(recipe._id).toString()
    }
  })
}

  // Fetch bookmarked recipes from the server
  const fetchBookmarkedRecipes = async () => {
    try {
      const response = await fetch(`${API_URI}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch bookmarks")

      const data = await response.json()
      // Store just the IDs for easy checking
      setBookmarkedRecipes(data.map(recipe => recipe._id))
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    }
  }

  // Check if a recipe is bookmarked
  const isBookmarked = (recipeId) => {
    return bookmarkedRecipes.includes(recipeId)
  }

  // Handle bookmark toggle
  const handleBookmark = async (recipe, e) => {
    if (e) e.stopPropagation()
    
    try {
      setBookmarkLoading(prev => ({ ...prev, [recipe._id]: true }))
      
      if (isBookmarked(recipe._id)) {
        // Remove bookmark
        const response = await fetch(`${API_URI}/bookmarks/${recipe._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to remove bookmark")
        
        setBookmarkedRecipes(prev => prev.filter(id => id !== recipe._id))
      } else {
        // Add bookmark
        const response = await fetch(`${API_URI}/bookmarks`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipeId: recipe._id }),
        })

        if (!response.ok) throw new Error("Failed to add bookmark")
        
        setBookmarkedRecipes(prev => [...prev, recipe._id])
      }
    } catch (error) {
      console.error("Error updating bookmark:", error)
      Alert.alert("Error", error.message || "Failed to update bookmark")
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [recipe._id]: false }))
    }
  }

  const fetchRecipes = async (pageNum = 1, refresh = false, search = "") => {
    try {
      if (refresh) setRefreshing(true)
      else if (pageNum === 1) setLoading(true)
      
      // Build the API URL with search parameter if provided
      let url = `${API_URI}/recipes?page=${pageNum}&limit=5`
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }

      const response = await fetch(
        url,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await response.json()
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch recipes")
      
      // If this is a search, update searchResults state
      if (search) {
        setSearchResults(data.recipes)
        return
      }

      const uniqueRecipes =
        refresh || pageNum === 1
          ? data.recipes
          : Array.from(
              new Set([...recipes, ...data.recipes].map((recipe) => recipe._id))
            ).map((id) =>
              [...recipes, ...data.recipes].find((recipe) => recipe._id === id)
            )

      setRecipes(uniqueRecipes)

      setHasMore(pageNum < data.totalPages)
      setpage(pageNum)
    } catch (error) {
      console.log("Error fetching recipes", error)
    } finally {
      if (refresh) {
        await sleep(800)
        setRefreshing(false)
      } else {
        setLoading(false)
      }
      
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [])

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing && !showSearch) {
      await fetchRecipes(page + 1)
    }
  }

  // Toggle search bar visibility
  const toggleSearch = () => {
    if (showSearch) {
      // Hide search bar
      Animated.parallel([
        Animated.timing(searchBarHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowSearch(false)
        setSearchQuery("")
        setSearchResults([])
      })
    } else {
      // Show search bar
      setShowSearch(true)
      Animated.parallel([
        Animated.timing(searchBarHeight, {
          toValue: 50,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Focus the search input after animation
        if (searchInputRef.current) {
          searchInputRef.current.focus()
        }
      })
    }
  }

  // Handle search
  const handleSearch = async (text) => {
    setSearchQuery(text)
    
    if (text.trim().length > 2) {
      setIsSearching(true)
      await fetchRecipes(1, false, text)
    } else if (text.trim() === "") {
      setSearchResults([])
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  const renderRatingStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : "rgba(255,255,255,0.5)"}
          style={{ marginRight: 2 }}
        />
      )
    }
    return stars
  }

  const renderItem = ({ item }) => (
    <View style={styles.recipeCard}>
      <TouchableOpacity 
        activeOpacity={0.9}
        style={styles.recipeCardContent} 
        onPress={() => openRecipeDetail(item)}
      >
        <View style={styles.recipeHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: item.user.profileImage }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.username}>{item.user.username}</Text>
          </View>
        </View>

        <View style={styles.recipeImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.recipeImage}
            contentFit="cover"
          />
        </View>

        <View style={styles.recipeDetails}>
          <View style={styles.titleContainer}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <TouchableOpacity 
              style={styles.bookmarkButton}
              onPress={(e) => handleBookmark(item, e)}
              disabled={bookmarkLoading[item._id]}
            >
              {bookmarkLoading[item._id] ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons 
                  name={isBookmarked(item._id) ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color="white" 
                />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.ratingContainer}>
            {renderRatingStars(item.rating)}
          </View>
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
          <Text style={styles.date}>
            Shared on {formatPublishDate(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  )

  const handleRefresh = async () => {
    if (showSearch && searchQuery) {
      await fetchRecipes(1, true, searchQuery)
    } else {
      await Promise.all([
        fetchRecipes(1, true),
        fetchBookmarkedRecipes()
      ])
    }
  }

  if (loading && !isSearching) return <Loader />

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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Cookbook</Text>
          <Text style={styles.headerDate}>
            {new Date().getDate() + " " + 
             ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][new Date().getMonth()] + 
             ". " + new Date().getFullYear()}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[
              styles.headerButton,
              showSearch && { backgroundColor: COLORS.primary }
            ]}
            onPress={toggleSearch}
          >
            <Ionicons 
              name={showSearch ? "close" : "search-outline"} 
              size={22} 
              color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search bar - Animated */}
      <Animated.View 
        style={[
          styles.searchBarContainer,
          {
            height: searchBarHeight,
            opacity: searchBarOpacity,
            marginBottom: searchBarHeight.interpolate({
              inputRange: [0, 50],
              outputRange: [0, 10]
            })
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          ) : null}
        </View>
      </Animated.View>
      
      <FlatList
        data={searchResults.length > 0 ? searchResults : recipes}
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          hasMore && recipes.length > 0 && !showSearch ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color="white"
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isSearching ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons 
                  name={searchQuery ? "search" : "close"} 
                  size={60} 
                  color="rgba(255,255,255,0.3)" 
                  style={searchQuery ? {} : styles.crossIcon}
                />
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? "No recipes match your search" 
                    : "No recommendations yet"}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery 
                    ? "Try different search terms or check spelling" 
                    : "Be the first to share your recipe!"}
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  )
}
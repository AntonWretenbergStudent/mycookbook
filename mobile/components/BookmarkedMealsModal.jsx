import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import COLORS from "../constants/colors"
import { API_URI } from "../constants/api"
import { useAuthStore } from "../store/authStore"

const { height } = Dimensions.get('window')

const BookmarkedMealsModal = ({ visible, onClose, mealType, onSelectMeal }) => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuthStore()
  
  const modalAnimation = React.useRef(new Animated.Value(0)).current
  
  useEffect(() => {
    if (visible) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8
      }).start()
      
      // Fetch bookmarks when modal opens
      fetchBookmarks()
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start()
    }
  }, [visible])

  const fetchBookmarks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URI}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch bookmarks")
      
      const data = await response.json()
      setBookmarks(data)
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const translateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0]
  })

  const getMealTitle = () => {
    switch(mealType) {
      case 'breakfast': return 'Breakfast'
      case 'lunch': return 'Lunch'
      case 'dinner': return 'Dinner'
      default: return 'Meal'
    }
  }

  const getMealIcon = () => {
    switch(mealType) {
      case 'breakfast': return 'sunny-outline'
      case 'lunch': return 'restaurant-outline'
      case 'dinner': return 'moon-outline'
      default: return 'restaurant-outline'
    }
  }

  const getMealColor = () => {
    switch(mealType) {
      case 'breakfast': return '#f39c12'
      case 'lunch': return '#3498db'
      case 'dinner': return '#9b59b6'
      default: return COLORS.primary
    }
  }

  const renderRatingStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={12}
          color={i <= rating ? "#f4b400" : COLORS.placeholderText}
          style={{ marginRight: 2 }}
        />
      )
    }
    return stars
  }

  const handleSelectMeal = (recipe) => {
    // Format the recipe for diary entry
    const meal = {
      recipeId: recipe._id,
      name: recipe.title,
      description: recipe.caption,
      image: recipe.image,
      rating: recipe.rating,
      isBookmarked: true
    }
    
    onSelectMeal(meal)
    onClose()
  }

  const renderBookmarkItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookmarkItem}
      onPress={() => handleSelectMeal(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.recipeImage}
        contentFit="cover"
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.caption}
        </Text>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user?.profileImage }}
            style={styles.userAvatar}
          />
          <Text style={styles.username} numberOfLines={1}>
            By {item.user?.username || "Unknown"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

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
                  Select {getMealTitle()} from Bookmarks
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading bookmarks...</Text>
                </View>
              ) : bookmarks.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="bookmark-outline" size={60} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>No bookmarked recipes</Text>
                  <Text style={styles.emptySubtext}>
                    Bookmark recipes to add them to your meals
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={bookmarks}
                  renderItem={renderBookmarkItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.bookmarksList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

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
    maxHeight: '80%',
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  bookmarksList: {
    padding: 16,
    paddingBottom: 30,
  },
  bookmarkItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 16, // Fixed typo: changed a6 to a proper value
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  username: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
})

export default BookmarkedMealsModal
import { useEffect, useState } from "react"
import { View, Text, Alert, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useRouter } from "expo-router"
import { API_URI } from "../../constants/api"
import { useAuthStore } from "../../store/authStore"
import styles from "../../assets/styles/profile.styles"
import Loader from "../../components/Loader";
import LogoutButton from "../../components/LogoutButton"
import ProfileHeader from "../../components/ProfileHeader"
import { Ionicons } from "@expo/vector-icons"
import COLORS from "../../constants/colors"
import { Image } from "expo-image";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Profile() {
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteRecipeId, setDeleteRecipeId] = useState(null)

  const { token } = useAuthStore()

  const router = useRouter()

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_URI}/recipes/user`, {
        headers: { Authorization: `Bearer ${token}`},
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to fetch user recipes")

      setRecipes(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      Alert.alert("Error", "Failed to load profile data. Pull down to refresh")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteRecipe = async (recipeId) => {
    try {
      setDeleteRecipeId(recipeId)
      const response = await fetch(`${API_URI}/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`}
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to delete recipe")

      setRecipes(recipes.filter((recipe) => recipe._id !== recipeId))
      Alert.alert("Success", "Recipe deleted successfully")
    } catch (error) {
      console.error("Delete error:", error)
      Alert.alert("Error", error.message || "Failed to delete recipe")
    } finally {
      setDeleteRecipeId(null)
    }
  }

  const confirmDelete = (recipeId) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteRecipe(recipeId)},
    ])
  }

  const renderRecipeItem = ({item}) => (
    <View style={styles.bookItem}>
      <Image source={{ uri: item.image }} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.bookCaption} numberOfLines={2}>{item.caption}</Text>
        <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
        {deleteRecipeId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  )

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.placeholderText}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const handleRefresh = async() => {
    setRefreshing(true)
    await sleep(500)
    await fetchData()
    setRefreshing(false)
  }

  if(isLoading && !refreshing) return <Loader />

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />
      <View style={styles.booksHeader}>
        <Text style={styles.bookTitle}>Your Recipes</Text>
        <Text style={styles.booksCount}>{recipes.length} recipes</Text>
      </View>

      <FlatList 
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={50} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No recipes yet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>Add Your First Recipe</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}
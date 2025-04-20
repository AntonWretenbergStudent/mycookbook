import { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Alert, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  StatusBar 
} from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { API_URI } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import Loader from "../../components/Loader";
import LogoutButton from "../../components/LogoutButton";
import ProfileHeader from "../../components/ProfileHeader";
import COLORS from "../../constants/colors";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Profile() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteRecipeId, setDeleteRecipeId] = useState(null);

  const { token } = useAuthStore();
  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URI}/recipes/user`, {
        headers: { Authorization: `Bearer ${token}`},
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch user recipes");

      setRecipes(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load profile data. Pull down to refresh");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteRecipe = async (recipeId) => {
    try {
      setDeleteRecipeId(recipeId);
      const response = await fetch(`${API_URI}/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`}
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete recipe");

      setRecipes(recipes.filter((recipe) => recipe._id !== recipeId));
      Alert.alert("Success", "Recipe deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", error.message || "Failed to delete recipe");
    } finally {
      setDeleteRecipeId(null);
    }
  };

  const confirmDelete = (recipeId) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDeleteRecipe(recipeId)},
    ]);
  };

  const renderRecipeItem = ({item}) => (
    <View style={styles.recipeItem}>
      <LinearGradient
        colors={[COLORS.primary, 'rgba(0,0,0,0.4)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
        <Text style={styles.recipeCaption} numberOfLines={2}>{item.caption}</Text>
        <Text style={styles.recipeDate}>
          {new Date(item.createdAt).getDate() + " " + 
           ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][new Date(item.createdAt).getMonth()] + 
           ". " + new Date(item.createdAt).getFullYear()}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
        {deleteRecipeId === item._id ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="trash-outline" size={20} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );

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

  const handleRefresh = async() => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    setRefreshing(false);
  };

  if(isLoading && !refreshing) return <Loader />;

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
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerDate}>
          {new Date().getDate() + " " + 
           ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][new Date().getMonth()] + 
           ". " + new Date().getFullYear()}
        </Text>
      </View>
      
      <ProfileHeader />
      <LogoutButton />
      
      <View style={styles.recipesHeader}>
        <Text style={styles.recipesTitle}>Your Recipes</Text>
        <Text style={styles.recipesCount}>{recipes.length} recipes</Text>
      </View>

      <FlatList 
        data={recipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recipesList}
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
            <Text style={styles.emptyText}>No recipes yet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/create")}>
              <Text style={styles.addButtonText}>Add Your First Recipe</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
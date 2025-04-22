import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useAuthStore } from "../../store/authStore";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import styles from "../../assets/styles/home.styles";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";
import { API_URI } from "../../constants/api";
import { formatPublishDate } from "../../lib/utils";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setpage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Function to open recipe detail
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
        caption: recipe.description || recipe.caption,
        rating: recipe.rating.toString(),
        username: recipe.user.username,
        userImage: recipe.user.profileImage,
        createdAt: recipe.createdAt,
        nutrition: nutritionParam,
        isBookmarked: "false"
      }
    });
  };

  const fetchRecipes = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await fetch(
        `${API_URI}/recipes?page=${pageNum}&limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch recipes");

      const uniqueRecipes =
        refresh || pageNum === 1
          ? data.recipes
          : Array.from(
              new Set([...recipes, ...data.recipes].map((recipe) => recipe._id))
            ).map((id) =>
              [...recipes, ...data.recipes].find((recipe) => recipe._id === id)
            );

      setRecipes(uniqueRecipes);

      setHasMore(pageNum < data.totalPages);
      setpage(pageNum);
    } catch (error) {
      console.log("Error fetching recipes", error);
    } finally {
      if (refresh) {
        await sleep(800)
        setRefreshing(false);
      } else setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await fetchRecipes(page + 1);
    }
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
  );

  const handleRefresh = async () => {
    await fetchRecipes(1, true);
  };

  if (loading) return <Loader />

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
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={recipes}
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
          hasMore && recipes.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color="white"
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="close" 
              size={60} 
              color="rgba(255,255,255,0.3)" 
              style={styles.crossIcon}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your recipe!
            </Text>
          </View>
        }
      />
    </View>
  );
}
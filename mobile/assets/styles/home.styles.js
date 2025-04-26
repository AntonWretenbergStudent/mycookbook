import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  // Main container and background
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  
  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000',
  },
  
  // Header styles
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  
  // Search bar styles
  searchBarContainer: {
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  searchInputContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  
  // List container
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
  },
  
  // Recipe card
  recipeCard: {
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  recipeCardContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: 'white',
  },
  
  // Recipe image
  recipeImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  
  // Recipe details
  recipeDetails: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: 'white',
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
    justifyContent: 'center',
    zIndex: 10, // Ensure the bookmark button stays on top
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  crossIcon: {
    transform: [{ rotate: '45deg' }],
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: "center",
  },
  
  // Footer loader
  footerLoader: {
    marginVertical: 20,
  },
});

export default styles;
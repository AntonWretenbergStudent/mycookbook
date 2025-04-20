// styles/profile.styles.js
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
  
  // Header styles
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
  
  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#000',
  },
  
  // Profile header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  
// Logout button styles for profile.styles.js
logoutButton: {
  position: 'absolute',
  right: 16,
  top: 60,
  zIndex: 10,
  backgroundColor: 'rgba(255,255,255,0.15)',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
},
logoutText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 14,
},
  logoutText: {
    color: COLORS.white,
    fontWeight: "600",
    marginLeft: 8,
  },
  
  // Recipes header
  recipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  recipesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: 'white',
  },
  recipesCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  
  // Recipes list
  recipesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  
  // Recipe item
  recipeItem: {
    flexDirection: "row",
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  recipeImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: 'white',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  recipeCaption: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    flex: 1,
  },
  recipeDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Delete button
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,59,48,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  crossIcon: {
    transform: [{ rotate: '45deg' }],
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default styles;
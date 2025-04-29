import { StyleSheet } from "react-native"
import COLORS from "../../constants/colors"

const styles = StyleSheet.create({
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
  
  // List container and header
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
  },
  listHeader: {
    marginBottom: 15,
  },
  bookmarkCount: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Bookmark card
  bookmarkCard: {
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 16,
    marginBottom: 16,
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
    width: "100%",
    height: 180,
  },
  noImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  recipeDetails: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: 'white',
    flex: 1,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,59,48,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeCaption: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    lineHeight: 20,
  },
  recipeDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  
  // Badge styles
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
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
    color: 'rgba(255,255,255,0.7)',
    textAlign: "center",
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: "600",
    fontSize: 16,
  },
})

export default styles
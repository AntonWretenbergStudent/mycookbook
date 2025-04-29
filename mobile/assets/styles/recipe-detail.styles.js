// styles/recipe-detail.styles.js
import { StyleSheet, Dimensions } from "react-native"
import COLORS from "../../constants/colors"

const { width, height } = Dimensions.get('window')

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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
  
  // Scroll content
  scrollContent: {
    flex: 1,
  },
  
  // Image container
  imageContainer: {
    width: width,
    height: width * 0.8,
    position: 'relative',
    marginTop: 15,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  // Details card
  detailsCard: {
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    padding: 20,
    paddingTop: 25,
    minHeight: height * 0.5,
  },
  
  // User info
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  
  // Recipe title
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  
  // Description section
  descriptionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Ingredients section
  ingredientsContainer: {
    marginBottom: 25,
  },
  ingredientsList: {
    marginTop: 5,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 5,
  },
  ingredientBullet: {
    marginTop: 6,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
    lineHeight: 22,
  },
  ingredientQuantity: {
    fontWeight: '600',
    color: 'white',
  },
  toTaste: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  
  // Nutrition section
  nutritionContainer: {
    marginBottom: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  nutritionItem: {
    width: '25%',
    padding: 5,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
})

export default styles
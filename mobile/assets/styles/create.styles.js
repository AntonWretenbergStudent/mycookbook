// styles/create.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  // Main container and background
  mainContainer: {
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
  
  // Content container styles
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  scrollViewStyle: {
    flex: 1,
  },
  
  // Card styles
  card: {
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  
  // Form styles
  form: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: 'white',
    fontWeight: "500",
  },
  
  // Input styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: 'white',
  },
  textArea: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    height: 100,
    color: 'white',
  },
  
  // Rating styles
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
  },
  starButton: {
    padding: 8,
  },
  
  // Image picker styles
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  
  // Button styles
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Section toggle
  sectionToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionToggleText: {
    color: 'white',
    fontWeight: "600",
    fontSize: 16,
  },

  // Ingredients section
  ingredientsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: 'white',
    marginBottom: 12,
  },
  ingredientsList: {
    marginBottom: 16,
  },
  noIngredientsText: {
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Ingredient item
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    color: 'white',
    fontWeight: "500",
    fontSize: 15,
  },
  ingredientQuantity: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  removeIngredientButton: {
    padding: 4,
  },
  
  // Ingredient input row
  ingredientInputRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  quantityContainer: {
    flex: 2,
    marginRight: 8,
  },
  quantityInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: 'white',
    height: 44,
  },
  unitContainer: {
    flex: 2,
    marginRight: 8,
  },
  unitInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: 'white',
    height: 44,
  },
  ingredientNameContainer: {
    flex: 4,
  },
  ingredientNameInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    color: 'white',
    height: 44,
  },
  
  // Add ingredient button
  addIngredientButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addIngredientIcon: {
    marginRight: 8,
  },
  addIngredientText: {
    color: 'white',
    fontWeight: "500",
  },
});

export default styles;
import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import COLORS from "../../constants/colors"
import { useRouter } from "expo-router"

// Import the original create screen as a component
import CreateRecipeScreen from "../../components/CreateRecipeScreen"
import AskAIScreen from "../../components/AskAIScreen"

export default function Create() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState(null)

  const renderSelectionScreen = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionTitle}>What would you like to do?</Text>
      
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => setSelectedMode('create')}
      >
        <View style={styles.optionIconContainer}>
          <Ionicons name="create-outline" size={40} color={COLORS.primary} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Create a Recipe</Text>
          <Text style={styles.optionDescription}>
            Create a new recipe from scratch with ingredients, steps and more
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => setSelectedMode('ai')}
      >
        <View style={styles.optionIconContainer}>
          <Ionicons name="bulb-outline" size={40} color={COLORS.primary} />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Ask AI for Tips</Text>
          <Text style={styles.optionDescription}>
            Get recipe suggestions based on the ingredients you have
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </View>
  )
  
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.primary, "rgba(0,0,0,0.8)", "rgba(0,0,0,1)"]}
        style={styles.backgroundGradient}
        locations={[0, 0.3, 0.6]}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedMode === null ? "Create" : 
           selectedMode === 'create' ? "New Recipe" : "Ask AI for Tips"}
        </Text>
        
        {selectedMode !== null && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedMode(null)}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {selectedMode === null && renderSelectionScreen()}
      {selectedMode === 'create' && <CreateRecipeScreen />}
      {selectedMode === 'ai' && <AskAIScreen />}
    </View>
  )
}

const styles = {
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
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionContainer: {
    flex: 1,
    padding: 20,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionCard: {
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
}
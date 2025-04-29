import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native'
import { Ionicons } from "@expo/vector-icons"
import COLORS from "../constants/colors"

const { height } = Dimensions.get('window')

const MealActionModal = ({ visible, onClose, mealType, onSelectBookmark, onCreateMeal }) => {
  const modalAnimation = React.useRef(new Animated.Value(0)).current
  
  React.useEffect(() => {
    if (visible) {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8
      }).start()
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start()
    }
  }, [visible])

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
                  Add {getMealTitle()}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => {
                    onSelectBookmark()
                    onClose()
                  }}
                >
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="bookmark" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Add from Bookmarks</Text>
                    <Text style={styles.optionDescription}>Select a meal from your saved recipes</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionButton}
                  onPress={() => {
                    onCreateMeal()
                    onClose()
                  }}
                >
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>Create Your Own</Text>
                    <Text style={styles.optionDescription}>Add a custom meal entry</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
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
    paddingBottom: 30,
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
  optionsContainer: {
    padding: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 148, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
})

export default MealActionModal
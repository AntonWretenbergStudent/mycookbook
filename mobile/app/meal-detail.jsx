import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
  Vibration,
  Alert
} from 'react-native'
import { Image } from "expo-image"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from "expo-router"
import COLORS from "../constants/colors"

const { width, height } = Dimensions.get('window')
const HOLD_DURATION = 2000

export default function MealDetailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  
  // Get meal data from params
  const meal = {
    type: params.type || 'breakfast',
    name: params.name || 'Meal Name',
    description: params.description || 'No description available',
    image: params.image || null,
    nutrition: (() => {
      try {
        return params.nutrition ? JSON.parse(params.nutrition) : { calories: 0 }
      } catch (e) {
        console.warn("Error parsing nutrition data", e)
        return { calories: 0 }
      }
    })()
  }
  
  // Button animations and state
  const [isPressed, setIsPressed] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const buttonScale = useRef(new Animated.Value(1)).current
  const progressWidth = useRef(new Animated.Value(0)).current
  const holdTimer = useRef(null)
  
  // Animation configurations
  const scaleAnimation = Animated.timing(buttonScale, {
    toValue: 0.95,
    duration: 200,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  })
  
  const resetScaleAnimation = Animated.timing(buttonScale, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
    easing: Easing.out(Easing.ease),
  })
  
  const progressAnimation = Animated.timing(progressWidth, {
    toValue: 1,
    duration: HOLD_DURATION,
    useNativeDriver: false,
    easing: Easing.linear,
  })
  
  // Handle button press start
  const handlePressIn = () => {
    setIsPressed(true)
    scaleAnimation.start()
    progressAnimation.start()
    
    // Start timer for hold duration
    holdTimer.current = setTimeout(() => {
      Vibration.vibrate(500) // Short vibration feedback
      setIsCompleted(true)
      Alert.alert(
        "Meal Completed",
        `Great job! You've completed this ${getMealTitle().toLowerCase()}.`,
        [{ text: "OK", onPress: () => router.back() }]
      )
    }, HOLD_DURATION)
  }
  
  // Handle button press end
  const handlePressOut = () => {
    if (!isCompleted) {
      setIsPressed(false)
      resetScaleAnimation.start()
      progressAnimation.stop()
      progressWidth.setValue(0)
      
      if (holdTimer.current) {
        clearTimeout(holdTimer.current)
      }
    }
  }
  
  const getMealColor = () => {
    switch(meal.type) {
      case 'breakfast': return '#f39c12'
      case 'lunch': return '#3498db'
      case 'dinner': return '#9b59b6'
      default: return COLORS.primary
    }
  }
  
  const getMealIcon = () => {
    switch(meal.type) {
      case 'breakfast': return 'sunny'
      case 'lunch': return 'restaurant'
      case 'dinner': return 'moon'
      default: return 'restaurant'
    }
  }
  
  const getMealTitle = () => {
    switch(meal.type) {
      case 'breakfast': return 'Breakfast'
      case 'lunch': return 'Lunch'
      case 'dinner': return 'Dinner'
      default: return 'Meal'
    }
  }
  
  const mealColor = getMealColor()
  
  // Clean up animations and timers
  useEffect(() => {
    return () => {
      if (holdTimer.current) {
        clearTimeout(holdTimer.current)
      }
      progressAnimation.stop()
      scaleAnimation.stop()
      resetScaleAnimation.stop()
    }
  }, [])
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={mealColor} />
      
      {/* Full screen gradient background */}
      <LinearGradient
        colors={[mealColor, 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
        style={styles.backgroundGradient}
        locations={[0, 0.5, 0.8]}
      >
        {/* Decorative Background Icon */}
        <View style={styles.decorativeIconContainer}>
          <Ionicons 
            name={getMealIcon()} 
            size={280} 
            color="rgba(255, 255, 255, 0.1)" 
            style={styles.decorativeIcon}
          />
        </View>
      </LinearGradient>
      
      {/* Main content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getMealTitle()}</Text>
          
          {/* Action buttons */}
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Date and schedule indicator */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {new Date().getDate() + " " + 
             ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][new Date().getMonth()] + 
             ". " + new Date().getFullYear()}
          </Text>
          <View style={styles.scheduleIndicator}>
            <Ionicons name="calendar-outline" size={18} color="rgba(255,255,255,0.7)" />
            <Text style={styles.scheduleText}>SCHEDULED</Text>
          </View>
        </View>
        
        {/* Meal name and info */}
        <Text style={styles.mealName}>{meal.name}</Text>
        
        <View style={styles.mealInfoRow}>
          <Text style={styles.mealTypeLabel}>{getMealTitle()}</Text>
          <Text style={styles.dot}>·</Text>
          {meal.nutrition && meal.nutrition.calories > 0 && (
            <Text style={styles.calorieInfo}>{meal.nutrition.calories} kcal</Text>
          )}
        </View>
      
        
        {/* Divider */}
        <View style={styles.divider} />
        
        {/* Card for details */}
        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant-outline" size={22} color="white" style={styles.cardIcon} />
            <Text style={styles.cardDate}>
              {new Date().getDate() + " " + 
               ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][new Date().getMonth()] + 
               ". " + new Date().getFullYear()}
            </Text>
            <Text style={styles.cardTitle}>{meal.name}</Text>
          </View>
          
          {/* Nutrition stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CALORIES</Text>
              <Text style={styles.statValue}>
                {meal.nutrition && meal.nutrition.calories || "---"}
              </Text>
            </View>
            
          </View>
        </View>
        
        {/* Description section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {meal.description || "No description available for this meal."}
          </Text>
        </View>
        
        {/* "Hold to complete" button */}
        <Animated.View 
          style={[
            styles.completeButtonContainer,
            { transform: [{ scale: buttonScale }] }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.completeButton,
              { backgroundColor: isCompleted ? '#4CAF50' : mealColor }
            ]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isCompleted}
          >
            <View style={styles.completeButtonContent}>
              <Ionicons 
                name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color="white" 
              />
              <Text style={styles.completeButtonText}>
                {isCompleted ? "Completed!" : "Hold to Complete"}
              </Text>
            </View>
            
            {/* Progress bar */}
            {isPressed && !isCompleted && (
              <View style={styles.progressBarContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { width: progressWidth.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }) }
                  ]}
                />
              </View>
            )}
          </TouchableOpacity>
          
          {/* Instruction text */}
          {!isCompleted && (
            <Text style={styles.holdInstructionText}>
              Hold to mark as completed
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorativeIconContainer: {
    position: 'absolute',
    right: -100,
    top: 0,
    opacity: 0.6,
    transform: [{ rotate: '15deg' }],
  },
  decorativeIcon: {
    opacity: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Extra space for the floating button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginRight: 10,
  },
  scheduleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 5,
  },
  mealName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  mealInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mealTypeLabel: {
    fontSize: 18,
    color: 'white',
    fontWeight: '300',
  },
  dot: {
    color: 'white',
    fontSize: 18,
    marginHorizontal: 5,
  },
  calorieInfo: {
    fontSize: 18,
    color: 'white',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  detailCard: {
    backgroundColor: 'rgba(30,40,50,0.9)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardIcon: {
    marginBottom: 5,
  },
  cardDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 5,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
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
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  descriptionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  descriptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    lineHeight: 22,
  },
  
  // Complete button styles
  completeButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  completeButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  completeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  holdInstructionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 9,
  },
})
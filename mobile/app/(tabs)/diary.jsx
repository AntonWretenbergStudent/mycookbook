import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from "../../constants/colors";
import { API_URI } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import MealActionModal from "../../components/MealActionModal";
import BookmarkedMealsModal from "../../components/BookmarkedMealsModal";
import CustomMealModal from "../../components/CustomMealModal";


// Define the component
export default function DiaryScreen() {
  const router = useRouter();

  // State for selected date and water tracking
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedCalendar, setExpandedCalendar] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(0);
  // New state for storing current week when expanded
  const [currentWeekDates, setCurrentWeekDates] = useState([]);
  const [meals, setMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuthStore();

  // State for modals
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [customMealModalVisible, setCustomMealModalVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);

  // Animation values for expandable calendar
  const calendarHeight = useRef(new Animated.Value(120)).current;
  const calendarMaxHeight = 320; // Maximum height when expanded
  const calendarMinHeight = 120; // Minimum height when collapsed

  // Load diary data when the screen comes into focus or date changes
  useFocusEffect(
    useCallback(() => {
      fetchDiaryEntry();
    }, [selectedDate])
  );

  // Function to update the current week dates
  const updateCurrentWeek = () => {
    const weekDays = generateWeekDays(selectedDate);
    setCurrentWeekDates(weekDays);
  };

  // Modify the useEffect for date changes to update current week
  useEffect(() => {
    // Generate the week dates for the selected date
    updateCurrentWeek();
  }, [selectedDate]);

  // Format date for API request
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch diary entry for selected date
  const fetchDiaryEntry = async () => {
    try {
      setLoading(true);
      const formattedDate = formatDateForAPI(selectedDate);
      
      const response = await fetch(`${API_URI}/diary/${formattedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch diary entry");
      
      const data = await response.json();
      
      setMeals({
        breakfast: data.meals?.breakfast || null,
        lunch: data.meals?.lunch || null,
        dinner: data.meals?.dinner || null
      });
      
      setWaterGlasses(data.water || 0);
    } catch (error) {
      console.error('Error loading diary entry:', error);
      Alert.alert("Error", "Failed to load diary data");
    } finally {
      setLoading(false);
    }
  };

  // Save diary entry
  const saveDiaryEntry = async (updatedData) => {
    try {
      setSaving(true);
      const formattedDate = formatDateForAPI(selectedDate);
      
      const response = await fetch(`${API_URI}/diary/${formattedDate}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error("Failed to save diary entry");
      
      // Update local state with the saved data
      const data = await response.json();
      
      if (updatedData.mealType && updatedData.meal) {
        setMeals(prevMeals => ({
          ...prevMeals,
          [updatedData.mealType]: updatedData.meal
        }));
      }
      
      if (updatedData.water !== undefined) {
        setWaterGlasses(updatedData.water);
      }
      
    } catch (error) {
      console.error('Error saving diary entry:', error);
      Alert.alert("Error", "Failed to save diary data");
    } finally {
      setSaving(false);
    }
  };

  // Delete meal
  const deleteMeal = async (mealType) => {
    try {
      setSaving(true);
      const formattedDate = formatDateForAPI(selectedDate);
      
      const response = await fetch(`${API_URI}/diary/${formattedDate}/${mealType}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete meal");
      
      // Update local state
      setMeals(prevMeals => ({
        ...prevMeals,
        [mealType]: null
      }));
      
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert("Error", "Failed to delete meal");
    } finally {
      setSaving(false);
    }
  };

  // Calendar expansion functions and PanResponder
  const expandCalendar = () => {
    // Generate the month dates before expanding
    updateCurrentWeek();
    
    Animated.spring(calendarHeight, {
      toValue: calendarMaxHeight,
      friction: 7,
      tension: 40,
      useNativeDriver: false
    }).start();
    
    setExpandedCalendar(true);
  };

  const collapseCalendar = () => {
    console.log("Collapsing calendar, selected date:", selectedDate);
    
    Animated.spring(calendarHeight, {
      toValue: calendarMinHeight,
      friction: 7,
      tension: 40,
      useNativeDriver: false
    }).start();
    
    // Generate the week that contains selectedDate
    const weekDays = generateWeekDays(selectedDate);
    console.log("Generated week days:", weekDays.map(d => d.getDate()));
    
    setCurrentWeekDates(weekDays);
    setExpandedCalendar(false);
  };
  // Modify the panResponder to better handle the collapse state
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0 && !expandedCalendar) {
          // Dragging down and calendar is collapsed
          calendarHeight.setValue(Math.min(calendarMinHeight + gesture.dy, calendarMaxHeight));
        } else if (gesture.dy < 0 && expandedCalendar) {
          // Dragging up and calendar is expanded
          calendarHeight.setValue(Math.max(calendarMaxHeight + gesture.dy, calendarMinHeight));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 50 && !expandedCalendar) {
          // Dragged down enough to expand
          expandCalendar();
        } else if (gesture.dy < -50 && expandedCalendar) {
          // Dragged up enough to collapse
          collapseCalendar();
        } else if (expandedCalendar) {
          // Not dragged enough, return to expanded
          Animated.spring(calendarHeight, {
            toValue: calendarMaxHeight,
            friction: 7,
            tension: 40,
            useNativeDriver: false
          }).start();
        } else {
          // Not dragged enough, return to collapsed
          Animated.spring(calendarHeight, {
            toValue: calendarMinHeight,
            friction: 7,
            tension: 40,
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  // Modify the useEffect to call the new functions
  useEffect(() => {
    // When selectedDate changes, update the current week
    // This is critical for ensuring the week view stays correct
    if (!expandedCalendar) {
      // Only update the current week if we're in collapsed mode
      // This prevents the week from changing unexpectedly during month view
      updateCurrentWeek();
    }
  }, [selectedDate]);

  // Add a new effect to ensure calendar state stays consistent
  useEffect(() => {
    if (expandedCalendar) {
      // If we're in expanded mode, ensure calendar height is at max
      calendarHeight.setValue(calendarMaxHeight);
    } else {
      // If we're in collapsed mode, ensure calendar height is at min
      calendarHeight.setValue(calendarMinHeight);
      // Always update current week when collapsing
      updateCurrentWeek();
    }
  }, [expandedCalendar]);

  // Helper to toggle water glass status
  const toggleWaterGlass = (count) => {
    const newCount = count === waterGlasses ? count - 1 : count;
    setWaterGlasses(newCount);
    saveDiaryEntry({ water: newCount });
  };

  // Handle adding a meal from bookmarks
  const handleAddFromBookmarks = () => {
    setBookmarkModalVisible(true);
  };

  // Handle creating a custom meal
  const handleCreateCustomMeal = () => {
    setCustomMealModalVisible(true);
  };

  // Save a selected meal
  const handleSaveMeal = (meal) => {
    saveDiaryEntry({
      mealType: activeMealType,
      meal: meal
    });
  };

  // Open meal action modal
  const openMealActionModal = (mealType) => {
    setActiveMealType(mealType);
    setActionModalVisible(true);
  };

  // Modified to accept a date parameter and always return the week containing that date
// Modified to accept a date parameter and always return the week containing that date
const generateWeekDays = (date) => {
  const currentDate = new Date(date);
  
  // Get day of week (0 is Sunday, 1 is Monday, etc.)
  const day = currentDate.getDay();
  
  // Calculate the start date of the week (Monday)
  // For Sunday (0), go back 6 days to previous Monday
  // For other days, go back (day - 1) days
  const mondayOffset = day === 0 ? -6 : -(day - 1);
  
  // Create a date object for Monday of the current week
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + mondayOffset);
  
  // Generate all days of the week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(monday);
    weekDate.setDate(monday.getDate() + i);
    weekDays.push(weekDate);
  }
  
  return weekDays;
};

  // Render days of the week header
  const renderDaysHeader = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <View style={styles.daysHeader}>
        {days.map((day, index) => (
          <Text key={day} style={styles.dayName}>
            {day}
          </Text>
        ))}
      </View>
    );
  };

  // Updated renderWeekView function to use currentWeekDates
  const renderWeekView = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    
    return (
      <View style={styles.weekContainer}>
        {renderDaysHeader()}
        <View style={styles.datesRow}>
          {currentWeekDates.map((date, index) => {
            const isSelected = 
              date.getDate() === selectedDate.getDate() && 
              date.getMonth() === selectedDate.getMonth() && 
              date.getFullYear() === selectedDate.getFullYear();
            
            const isToday = 
              date.getDate() === today.getDate() && 
              date.getMonth() === today.getMonth() && 
              date.getFullYear() === today.getFullYear();
            
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateButton,
                  isSelected ? styles.selectedDate : null,
                  isToday && !isSelected ? styles.todayDate : null,
                  isWeekend && !isSelected && !isToday ? styles.weekendDate : null
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text 
                  style={[
                    styles.dateText, 
                    isSelected ? styles.selectedDateText : null,
                    isToday && !isSelected ? styles.todayDateText : null,
                    isWeekend && !isSelected && !isToday ? styles.weekendDateText : null
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.calendarPullIndicator}>
          <Ionicons name="chevron-down" size={20} color="white" />
        </View>
      </View>
    );
  };

  // Get month dates for expanded calendar
  const getMonthDates = () => {
    const currentDate = new Date(selectedDate);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const blanks = Array(startingDay - 1).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    
    return [...blanks, ...days];
  };

  // Render month view for expanded calendar but starting at current week
  const renderMonthView = () => {
    const monthDates = getMonthDates();
    const today = new Date();
    
    // Get week start and end dates for highlighting the current week
    const currentWeekStart = currentWeekDates[0];
    const currentWeekEnd = currentWeekDates[6];
    
    // Calculate a ref to scroll to when expanded
    const scrollToCurrentWeek = () => {
      // Find the index of the current week's Monday in the month grid
      const mondayIndex = monthDates.findIndex(date => 
        date && 
        date.getDate() === currentWeekStart.getDate() && 
        date.getMonth() === currentWeekStart.getMonth()
      );
      
      // If found, we want to highlight that week
      if (mondayIndex >= 0) {
        // Calculate the row (each row has 7 days)
        const rowIndex = Math.floor(mondayIndex / 7);
        return rowIndex;
      }
      
      return -1; // Not found
    };
    
    // Get the row to focus on
    const focusRowIndex = scrollToCurrentWeek();
    
    return (
      <View style={styles.monthContainer}>
        <Text style={styles.monthTitle}>
          {selectedDate.toLocaleString('default', { month: 'long' })} {selectedDate.getFullYear()}
        </Text>
        {renderDaysHeader()}
        <View style={styles.calendarGrid}>
          {monthDates.map((date, index) => {
            if (!date) return <View key={`empty-${index}`} style={styles.emptyDate} />;
            
            const isSelected = 
              date.getDate() === selectedDate.getDate() && 
              date.getMonth() === selectedDate.getMonth() && 
              date.getFullYear() === selectedDate.getFullYear();
              
            const isToday = 
              date.getDate() === today.getDate() && 
              date.getMonth() === today.getMonth() && 
              date.getFullYear() === today.getFullYear();
            
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            // Check if this date is in the current week
            const isCurrentWeek = 
              (date >= currentWeekStart && date <= currentWeekEnd) ||
              (Math.floor(index / 7) === focusRowIndex); // Alternative way to check by row
            
            return (
              <TouchableOpacity
                key={`date-${index}`}
                style={[
                  styles.calendarDate,
                  isSelected ? styles.selectedDate : null,
                  isToday && !isSelected ? styles.todayDate : null,
                  isCurrentWeek && !isSelected && !isToday ? { backgroundColor: 'rgba(255,255,255,0.1)' } : null
                ]}
                onPress={() => {
                  setSelectedDate(date);
                }}
              >
                <Text 
                  style={[
                    styles.calendarDateText,
                    isSelected ? styles.selectedDateText : null,
                    isToday && !isSelected ? styles.todayDateText : null,
                    isWeekend && !isSelected ? styles.weekendDateText : null
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.calendarPullIndicator}>
          <Ionicons name="chevron-up" size={20} color="white" />
        </View>
      </View>
    );
  };

  // Updated renderMealTracking function for diary.jsx
  const renderMealTracking = () => {
    const mealTypes = [
      { key: 'breakfast', title: 'Breakfast', icon: 'sunny-outline', color: '#f39c12' },
      { key: 'lunch', title: 'Lunch', icon: 'restaurant-outline', color: '#3498db' },
      { key: 'dinner', title: 'Dinner', icon: 'moon-outline', color: '#9b59b6' }
    ];
    
    // New function to open meal detail screen
    const openMealDetail = (mealData, mealType) => {
      if (!mealData) return;
      
      // Format the nutrition data for URL params
      const nutritionParam = mealData.nutrition 
        ? JSON.stringify(mealData.nutrition)
        : JSON.stringify({ calories: 0 });
      
      router.push({
        pathname: "/meal-detail",
        params: {
          type: mealType,
          name: mealData.name,
          description: mealData.description || "",
          image: mealData.image || "",
          nutrition: nutritionParam
        }
      });
    };
    
    return (
      <View style={styles.mealsContainer}>
        <Text style={styles.sectionTitle}>Meals</Text>
        {mealTypes.map((meal) => {
          const mealData = meals[meal.key];
          
          return (
            <View key={meal.key} style={styles.mealCard}>
              <LinearGradient
                colors={[meal.color, 'rgba(0,0,0,0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.mealGradient}
              />
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleContainer}>
                  <Ionicons name={meal.icon} size={22} color="white" style={styles.mealIcon} />
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                </View>
                {mealData ? (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        "Delete Meal",
                        `Are you sure you want to remove this ${meal.title.toLowerCase()}?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => deleteMeal(meal.key) }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => openMealActionModal(meal.key)}
                  >
                    <Ionicons name="add" size={22} color="white" />
                  </TouchableOpacity>
                )}
              </View>
              
              {mealData && (
                <TouchableOpacity 
                  style={styles.mealContent}
                  onPress={() => openMealDetail(mealData, meal.key)}
                >
                  {mealData.image ? (
                    <View style={styles.mealWithImage}>
                      <Image
                        source={{ uri: mealData.image }}
                        style={styles.mealImage}
                        contentFit="cover"
                      />
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{mealData.name}</Text>
                        {mealData.description && (
                          <Text style={styles.mealDescription} numberOfLines={2}>
                            {mealData.description}
                          </Text>
                        )}
                        {mealData.nutrition && mealData.nutrition.calories > 0 && (
                          <Text style={styles.mealNutrition}>
                            {mealData.nutrition.calories} kcal
                          </Text>
                        )}
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.mealName}>{mealData.name}</Text>
                      {mealData.description && (
                        <Text style={styles.mealDescription}>
                          {mealData.description}
                        </Text>
                      )}
                      {mealData.nutrition && mealData.nutrition.calories > 0 && (
                        <Text style={styles.mealNutrition}>
                          {mealData.nutrition.calories} kcal
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Render water tracking section
  const renderWaterTracking = () => {
    const filledCount = waterGlasses;
    const progress = (filledCount / 8) * 100;
    const progressWidth = `${progress}%`;
    const glassAmount = 250; // ml per glass
    
    return (
      <View style={styles.waterContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Water Intake</Text>
          <Text style={styles.waterTotal}>{filledCount * glassAmount} / 2000 ml</Text>
        </View>
        
        <View style={styles.waterProgressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.waterSummary}>
            {filledCount} of 8 glasses
          </Text>
        </View>
        
        <View style={styles.waterGlassesContainer}>
          {Array.from({ length: 8 }).map((_, index) => {
            const isFilled = index < filledCount;
            
            return (
              <TouchableOpacity
                key={`glass-${index}`}
                style={[
                  styles.waterGlassButton,
                  isFilled ? styles.waterGlassFilled : null
                ]}
                onPress={() => toggleWaterGlass(index + 1)}
              >
                <Ionicons
                  name={isFilled ? "water" : "water-outline"}
                  size={22}
                  color={isFilled ? "#fff" : "rgba(255,255,255,0.6)"}
                />
                <Text style={[
                  styles.waterGlassText,
                  isFilled ? styles.waterGlassTextFilled : null
                ]}>
                  {(index + 1) * glassAmount} ml
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading diary data...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Daily Journal</Text>
        <Text style={styles.headerDate}>
          {selectedDate.getDate() + " " + 
           ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][selectedDate.getMonth()] + 
           ". " + selectedDate.getFullYear()}
        </Text>
      </View>
      
      {/* Calendar - Expandable */}
      <Animated.View 
        style={[styles.calendarContainer, { height: calendarHeight }]}
        {...panResponder.panHandlers}
      >
        {expandedCalendar ? renderMonthView() : renderWeekView()}
      </Animated.View>
      
      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderMealTracking()}
        {renderWaterTracking()}
      </ScrollView>
      
      {/* Meal Action Modal */}
      <MealActionModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        mealType={activeMealType}
        onSelectBookmark={handleAddFromBookmarks}
        onCreateMeal={handleCreateCustomMeal}
      />
      
      {/* Bookmarked Meals Modal */}
      <BookmarkedMealsModal
        visible={bookmarkModalVisible}
        onClose={() => setBookmarkModalVisible(false)}
        mealType={activeMealType}
        onSelectMeal={handleSaveMeal}
      />
      
      {/* Custom Meal Modal */}
      <CustomMealModal
        visible={customMealModalVisible}
        onClose={() => setCustomMealModalVisible(false)}
        mealType={activeMealType}
        onSave={handleSaveMeal}
      />
    </View>
  );
}

// Styles
const styles = {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },
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
  calendarContainer: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  weekContainer: {
    padding: 10,
  },
  monthContainer: {
    padding: 10,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dateButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedDate: {
    backgroundColor: COLORS.primary,
  },
  todayDate: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  weekendDate: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayDateText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekendDateText: {
    color: 'rgba(255,255,255,0.8)',
  },
  calendarPullIndicator: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  monthTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDate: {
    width: '14.28%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  calendarDateText: {
    color: 'white',
    fontSize: 14,
  },
  emptyDate: {
    width: '14.28%',
    height: 35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  mealsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  mealCard: {
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: 'rgba(30,40,50,0.8)',
    overflow: 'hidden',
    position: 'relative',
  },
  mealGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    marginRight: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealContent: {
    padding: 15,
    paddingTop: 0,
  },
  mealWithImage: {
    flexDirection: 'row',
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  mealDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 5,
  },
  mealNutrition: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  waterContainer: {
    backgroundColor: 'rgba(30,40,50,0.8)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  waterTotal: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  waterProgressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  waterSummary: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'right',
  },
  waterGlassesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  waterGlassButton: {
    width: '23%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  waterGlassFilled: {
    backgroundColor: 'rgba(52, 152, 219, 0.3)',
  },
  waterGlassText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 5,
  },
  waterGlassTextFilled: {
    color: 'white',
  }
};
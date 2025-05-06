import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Modal
} from 'react-native'
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from "expo-router"
import COLORS from "../constants/colors"
import { useAuthStore } from "../store/authStore"
import { getTodoList, saveTodoList } from "../services/todoListService"
import { Image } from "expo-image"

// Theme options for the to-do list
const THEMES = [
  { id: 'solid_black', type: 'color', value: ['#000000', '#121212'] },
  { id: 'color_teal', type: 'color', value: ['#2a9d8f', '#264653'] },
  { id: 'color_purple', type: 'color', value: ['#8338ec', '#3a0ca3'] },
  { id: 'color_pink', type: 'color', value: ['#ff006e', '#7209b7'] },
  { id: 'color_forest', type: 'color', value: ['#2e7d32', '#1b5e20'] },
  { id: 'photo_beach', type: 'image', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000' },
  { id: 'photo_mountain', type: 'image', value: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000' },
  { id: 'photo_sunset', type: 'image', value: 'https://images.unsplash.com/photo-1616982215610-a95f23915df0?q=80&w=1000' },
  { id: 'photo_forest', type: 'image', value: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000' },
  { id: 'photo_ferns', type: 'image', value: 'https://images.unsplash.com/photo-1570368294249-547a25b52ad1?q=80&w=1000' },
  { id: 'photo_lighthouse', type: 'image', value: 'https://images.unsplash.com/photo-1570129476815-ba368ac77013?q=80&w=1000' },
  { id: 'photo_beach_sunset', type: 'image', value: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=1000' },
  { id: 'photo_pink_sky', type: 'image', value: 'https://images.unsplash.com/photo-1520180404053-580f685e60aa?q=80&w=1000' },
  { id: 'mountain_snow', type: 'image', value: 'https://images.unsplash.com/photo-1483401757487-2ced3fa77952?q=80&w=1000' },
]

export default function TodoList({ route }) {
  const { listId } = route?.params || { listId: null }
  const router = useRouter()
  const { token } = useAuthStore()
  
  // State variables
  const [todoList, setTodoList] = useState({
    id: listId || `temp_${new Date().getTime()}`, // Use a temporary ID with a clear prefix
    title: 'Namnlös lista',
    tasks: [],
    theme: 'solid_black',
    createdAt: new Date().toISOString(),
  })
  const [newTask, setNewTask] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showTaskInput, setShowTaskInput] = useState(false)
  const [showCompleted, setShowCompleted] = useState(true)
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [themeFilter, setThemeFilter] = useState('all')
  
  // Animation values
  const settingsMenuHeight = useRef(new Animated.Value(0)).current
  const settingsMenuOpacity = useRef(new Animated.Value(0)).current
  
  // Load todo list data when component mounts
  useEffect(() => {
    if (listId) {
      fetchTodoList()
    }
  }, [listId])
  
  // Fetch todo list from API
  const fetchTodoList = async () => {
    try {
      setIsLoading(true)
      const data = await getTodoList(token, listId)
      
      if (data) {
        setTodoList({
          ...data,
          // Ensure we have an id property that matches _id for compatibility
          id: data._id || data.id
        })
      }
    } catch (error) {
      console.error('Error fetching todo list:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Save todo list to API
  const saveTodoListData = async () => {
    try {
      setIsLoading(true)
      
      // Save the todo list
      const savedList = await saveTodoList(token, todoList)
      
      // Update the state with the saved list (which will have the MongoDB _id if it was new)
      if (savedList) {
        setTodoList(prevList => ({
          ...prevList,
          ...savedList,
          // Keep the id property for compatibility with existing code
          id: savedList._id || savedList.id
        }))
      }
      
      return true
    } catch (error) {
      console.error('Error saving todo list:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) return
    
    const newTaskItem = {
      id: new Date().getTime().toString(),
      text: newTask.trim(),
      completed: false,
      starred: false,
      createdAt: new Date().toISOString()
    }
    
    setTodoList({
      ...todoList,
      tasks: [...todoList.tasks, newTaskItem]
    })
    
    setNewTask('')
    setShowTaskInput(false)
  }
  
  // Toggle task completion status
  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = todoList.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    
    setTodoList({
      ...todoList,
      tasks: updatedTasks
    })
  }
  
  // Toggle star status
  const toggleTaskStar = (taskId) => {
    const updatedTasks = todoList.tasks.map(task => 
      task.id === taskId ? { ...task, starred: !task.starred } : task
    )
    
    setTodoList({
      ...todoList,
      tasks: updatedTasks
    })
  }
  
  // Delete a task
  const deleteTask = (taskId) => {
    Alert.alert(
      "Ta bort uppgift",
      "Är du säker på att du vill ta bort den här uppgiften?",
      [
        { text: "Avbryt", style: "cancel" },
        { 
          text: "Ta bort", 
          style: "destructive",
          onPress: () => {
            const updatedTasks = todoList.tasks.filter(task => task.id !== taskId)
            
            setTodoList({
              ...todoList,
              tasks: updatedTasks
            })
          }
        }
      ]
    )
  }
  
  // Show/hide settings menu
  const toggleSettings = () => {
    if (settingsVisible) {
      // Hide settings
      Animated.parallel([
        Animated.timing(settingsMenuHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        }),
        Animated.timing(settingsMenuOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        })
      ]).start(() => setSettingsVisible(false))
    } else {
      // Show settings
      setSettingsVisible(true)
      Animated.parallel([
        Animated.timing(settingsMenuHeight, {
          toValue: 120,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(settingsMenuOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start()
    }
  }
  
  // Change the theme
  const changeTheme = (themeId) => {
    setTodoList({
      ...todoList,
      theme: themeId
    })
    setShowThemeSelector(false)
  }
  
  // Get the current theme
  const getCurrentTheme = () => {
    return THEMES.find(theme => theme.id === todoList.theme) || THEMES.find(theme => theme.id === 'solid_black')
  }
  
  // Filter themes based on type
  const getFilteredThemes = () => {
    if (themeFilter === 'all') {
      return THEMES
    } else {
      return THEMES.filter(theme => theme.type === themeFilter)
    }
  }
  
  // Handle back press
  const handleBackPress = async () => {
    const saveSuccess = await saveTodoListData()
    if (saveSuccess) {
      router.back()
    } else {
      // Maybe show an error message to the user
      Alert.alert("Fel", "Kunde inte spara listan. Försök igen.")
    }
  }

  // Open settings
  const handleOpenSettings = () => {
    toggleSettings()
  }

  // Handle open task input
  const handleOpenTaskInput = () => {
    setShowTaskInput(true)
  }

  // Toggle completed section visibility
  const toggleCompletedVisibility = () => {
    setShowCompleted(!showCompleted)
  }

  // Render active tasks
  const renderActiveTasks = () => {
    const activeTasks = todoList.tasks.filter(task => !task.completed)
    
    if (activeTasks.length === 0) {
      return (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>Inga uppgifter ännu</Text>
          <Text style={styles.emptyListSubText}>Tryck på + för att lägga till en uppgift</Text>
        </View>
      )
    }

    return (
      <View>
        {activeTasks
          .sort((a, b) => {
            // Sort by star status first
            if (a.starred !== b.starred) {
              return a.starred ? -1 : 1
            }
            // Then by creation date
            return new Date(b.createdAt) - new Date(a.createdAt)
          })
          .map(item => (
            <View key={item.id} style={styles.taskItemContainer}>
              <TouchableOpacity 
                style={styles.taskCheckbox}
                onPress={() => toggleTaskCompletion(item.id)}
              >
                {item.completed && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </TouchableOpacity>
              
              <Text style={styles.taskText}>
                {item.text}
              </Text>
              
              <TouchableOpacity 
                style={styles.starButton}
                onPress={() => toggleTaskStar(item.id)}
              >
                <Ionicons 
                  name={item.starred ? "star" : "star-outline"} 
                  size={22} 
                  color={item.starred ? "#f4b400" : "rgba(255,255,255,0.5)"} 
                />
              </TouchableOpacity>
            </View>
          ))
        }
      </View>
    )
  }

  // Render completed tasks
  const renderCompletedTasks = () => {
    const completedTasks = todoList.tasks.filter(task => task.completed)
    
    if (completedTasks.length === 0) return null

    return (
      <View style={styles.completedTasksSection}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={toggleCompletedVisibility}
        >
          <Ionicons 
            name={showCompleted ? "chevron-down" : "chevron-up"} 
            size={20} 
            color="rgba(255,255,255,0.7)"
            style={{ marginRight: 8 }} 
          />
          <Text style={styles.sectionHeaderText}>Slutfört</Text>
        </TouchableOpacity>

        {showCompleted && (
          <View>
            {completedTasks
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(item => (
                <View key={item.id} style={[styles.taskItemContainer, styles.completedTaskContainer]}>
                  <TouchableOpacity 
                    style={[styles.taskCheckbox, styles.taskCheckboxCompleted]}
                    onPress={() => toggleTaskCompletion(item.id)}
                  >
                    <Ionicons name="checkmark" size={18} color="white" />
                  </TouchableOpacity>
                  
                  <Text style={[styles.taskText, styles.taskTextCompleted]}>
                    {item.text}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.starButton}
                    onPress={() => toggleTaskStar(item.id)}
                  >
                    <Ionicons 
                      name={item.starred ? "star" : "star-outline"} 
                      size={22} 
                      color={item.starred ? "#f4b400" : "rgba(255,255,255,0.5)"} 
                    />
                  </TouchableOpacity>
                </View>
              ))
            }
          </View>
        )}
      </View>
    )
  }
  
  // Main background component based on selected theme
  const renderBackground = () => {
    // For new lists (no tasks yet), always use black background
    if (todoList.tasks.length === 0) {
      return (
        <View style={styles.solidBackground} />
      )
    }
    
    const theme = getCurrentTheme()
    
    if (theme.type === 'image') {
      return (
        <ImageBackground
          source={{ uri: theme.value }}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay} />
        </ImageBackground>
      )
    } else {
      return (
        <LinearGradient
          colors={theme.value}
          style={styles.backgroundGradient}
        />
      )
    }
  }
  
  // Render theme selector
  const renderThemeSelector = () => (
    <Modal
      transparent
      visible={showThemeSelector}
      animationType="slide"
      onRequestClose={() => setShowThemeSelector(false)}
    >
      <View style={styles.themeModalOverlay}>
        <View style={styles.themeModalContent}>
          <View style={styles.themeModalHeader}>
            <TouchableOpacity 
              style={styles.themeModalBackButton}
              onPress={() => setShowThemeSelector(false)}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            
            <Text style={styles.themeModalTitle}>Välj tema</Text>
            
            <TouchableOpacity 
              style={styles.themeModalDoneButton}
              onPress={() => setShowThemeSelector(false)}
            >
              <Text style={styles.themeModalDoneText}>Klar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.themeTypeSelector}>
            <TouchableOpacity 
              style={[
                styles.themeTypeButton, 
                themeFilter === 'all' ? styles.themeTypeButtonActive : null
              ]}
              onPress={() => setThemeFilter('all')}
            >
              <Text 
                style={[
                  styles.themeTypeText, 
                  themeFilter === 'all' ? styles.themeTypeTextActive : null
                ]}
              >
                Alla
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeTypeButton, 
                themeFilter === 'color' ? styles.themeTypeButtonActive : null
              ]}
              onPress={() => setThemeFilter('color')}
            >
              <Text 
                style={[
                  styles.themeTypeText, 
                  themeFilter === 'color' ? styles.themeTypeTextActive : null
                ]}
              >
                Färger
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeTypeButton, 
                themeFilter === 'image' ? styles.themeTypeButtonActive : null
              ]}
              onPress={() => setThemeFilter('image')}
            >
              <Text 
                style={[
                  styles.themeTypeText, 
                  themeFilter === 'image' ? styles.themeTypeTextActive : null
                ]}
              >
                Bilder
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            contentContainerStyle={styles.themeOptionsContainer}
            showsHorizontalScrollIndicator={false}
          >
            {getFilteredThemes().map(theme => (
              <TouchableOpacity 
                key={theme.id}
                style={[
                  styles.themeOption,
                  theme.id === todoList.theme ? styles.themeOptionSelected : null
                ]}
                onPress={() => changeTheme(theme.id)}
              >
                {theme.type === 'color' ? (
                  <LinearGradient
                    colors={theme.value}
                    style={styles.themeColorPreview}
                  />
                ) : (
                  <Image
                    source={{ uri: theme.value }}
                    style={styles.themeImagePreview}
                    contentFit="cover"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {renderBackground()}
      
      {/* Header with back button and settings */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <Text style={styles.backButtonText}>Listor</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{todoList.title}</Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleOpenSettings}
          >
            <Ionicons name="cog-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Settings Menu */}
      {settingsVisible && (
        <Animated.View
          style={[
            styles.settingsMenu,
            {
              height: settingsMenuHeight,
              opacity: settingsMenuOpacity
            }
          ]}
        >
          <TouchableOpacity
            style={styles.settingsOption}
            onPress={() => {
              toggleSettings()
              setShowThemeSelector(true)
            }}
          >
            <Ionicons name="color-palette-outline" size={20} color="white" />
            <Text style={styles.settingsOptionText}>Byt tema</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingsOption}
            onPress={() => {
              toggleSettings()
              Alert.prompt(
                "Byt namn",
                "Ange ett nytt namn för listan",
                [
                  { text: "Avbryt", style: "cancel" },
                  {
                    text: "Spara",
                    onPress: (text) => {
                      if (text && text.trim()) {
                        setTodoList({
                          ...todoList,
                          title: text.trim()
                        })
                      }
                    }
                  }
                ],
                "plain-text",
                todoList.title
              )
            }}
          >
            <Ionicons name="text-outline" size={20} color="white" />
            <Text style={styles.settingsOptionText}>Byt namn</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Main content */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.mainContent}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {renderActiveTasks()}
            {renderCompletedTasks()}
            {/* Increased height to provide proper spacing above the add button */}
            <View style={{height: 180}} />
          </View>
        </ScrollView>
        
        {/* Add Task Button */}
        {showTaskInput ? (
          <View style={styles.addTaskInputContainer}>
            <View style={styles.taskInputWrapper}>
              <TouchableOpacity style={styles.taskCheckbox} />
              <TextInput
                style={styles.taskInput}
                placeholder="Lägg till en uppgift..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={newTask}
                onChangeText={setNewTask}
                autoFocus
                onSubmitEditing={addTask}
                returnKeyType="done"
              />
            </View>
            
            <View style={styles.addTaskActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setNewTask('')
                  setShowTaskInput(false)
                }}
              >
                <Text style={styles.cancelButtonText}>Avbryt</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  !newTask.trim() && styles.addButtonDisabled
                ]}
                onPress={addTask}
                disabled={!newTask.trim()}
              >
                <Text style={styles.addButtonText}>Lägg till</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.fixedAddTaskButton}
            onPress={handleOpenTaskInput}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addTaskButtonText}>Lägg till en uppgift</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
      
      {/* Theme selector modal */}
      {renderThemeSelector()}
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: '100%',
  },
  solidBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  
  // Header
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 2,
  },
  headerButtons: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Settings menu
  settingsMenu: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 180,
    backgroundColor: 'rgba(30,40,50,0.9)',
    borderRadius: 12,
    padding: 10,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  settingsOptionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  
  // Main content
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 10,
    paddingBottom: 120, // Added padding at the bottom
  },
  
  // Task items
  taskItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50,50,50,0.8)',
    borderRadius: 10,
    marginBottom: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  completedTaskContainer: {
    opacity: 0.7,
    backgroundColor: 'rgba(40,40,40,0.6)',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.9)',
  },
  taskText: {
    fontSize: 17,
    color: 'white',
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.6)',
  },
  starButton: {
    padding: 5,
  },
  
  // Completed tasks section
  completedTasksSection: {
    marginTop: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Empty state
  emptyListContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyListSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Add task button - IMPROVED
  fixedAddTaskButton: {
    position: 'absolute',
    bottom: 30,
    left: 20, // Added horizontal padding
    right: 20, // Added horizontal padding
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    zIndex: 10, // Ensure it stays on top
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  
  // Add task input
  addTaskInputContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20, // Added horizontal padding
    right: 20, // Added horizontal padding
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 15,
    zIndex: 10, // Ensure it stays on top
  },
  taskInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 18,
  },
  addTaskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3894e9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Theme modal
  themeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  themeModalContent: {
    backgroundColor: '#1e2834',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  themeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  themeModalBackButton: {
    marginRight: 10,
  },
  themeModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  themeModalDoneButton: {
    marginLeft: 10,
  },
  themeModalDoneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  themeTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  themeTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  themeTypeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  themeTypeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  themeTypeTextActive: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  themeOptionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  themeOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionSelected: {
    borderColor: 'white',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  themeColorPreview: {
    width: '100%',
    height: '100%',
  },
  themeImagePreview: {
    width: '100%',
    height: '100%',
  },
}
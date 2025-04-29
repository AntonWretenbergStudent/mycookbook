import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  PanResponder
} from 'react-native'
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useFocusEffect } from '@react-navigation/native'
import COLORS from "../constants/colors"
import { useAuthStore } from "../store/authStore"
import { getAllTodoLists, deleteTodoList } from "../services/todoListService"

export default function TodoLists() {
  const router = useRouter()
  const { token } = useAuthStore()
  
  // State variables
  const [todoLists, setTodoLists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  
  // Create ref object to store animated values for each list item
  const rowSwipeAnimatedValues = useRef({}).current
  const rowBackgroundColors = useRef({}).current
  
  // Load todo lists when component mounts or screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTodoLists()
      return () => {}
    }, [])
  )
  
  // Fetch todo lists from service
  const fetchTodoLists = async () => {
    try {
      setIsLoading(true)
      const lists = await getAllTodoLists(token)
      
      // Ensure each list has a unique key for the FlatList
      const processedLists = lists.map(list => {
        const id = list.id || list._id
        // Initialize animated values for each list item
        if (!rowSwipeAnimatedValues[id]) {
          rowSwipeAnimatedValues[id] = new Animated.Value(0)
        }
        if (!rowBackgroundColors[id]) {
          rowBackgroundColors[id] = new Animated.Value(0)
        }
        return {
          ...list,
          key: id
        }
      })
      
      setTodoLists(processedLists)
    } catch (error) {
      console.error('Error fetching todo lists:', error)
      Alert.alert("Error", "Failed to load lists")
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTodoLists()
  }
  
  // Create a new todo list
  const createTodoList = () => {
    // Create a new empty to-do list with a unique ID
    const uniqueId = `new_list_${Date.now()}`
    const newList = {
      id: uniqueId,
      title: 'Untitled List',
      tasks: [],
      theme: 'solid_black', // Default theme - black
      createdAt: new Date().toISOString(),
    }
    
    // Navigate to the TodoList screen with the list ID
    router.push({
      pathname: "/todo-list",
      params: { listId: uniqueId }
    })
  }
  
  // Open a todo list
  const openTodoList = (list) => {
    // Navigate to the TodoList screen with the list ID
    router.push({
      pathname: "/todo-list",
      params: { listId: list.id || list._id }
    })
  }
  
  // Delete a todo list
  const handleDeleteList = async (listId) => {
    try {
      setDeleteLoading(listId)
      const success = await deleteTodoList(token, listId)
      
      if (success) {
        // Update the local state to remove the deleted list
        setTodoLists(prevLists => prevLists.filter(list => 
          (list.id !== listId && list._id !== listId)
        ))
      } else {
        Alert.alert("Error", "Failed to delete list")
      }
    } catch (error) {
      console.error('Error deleting todo list:', error)
      Alert.alert("Error", "An error occurred while deleting the list")
    } finally {
      setDeleteLoading(null)
    }
  }
  
  // Confirm delete
  const confirmDelete = (listId) => {
    Alert.alert(
      "Delete List",
      "Are you sure you want to delete this list? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel", onPress: () => {
          // Reset the position and color when cancel is pressed
          Animated.spring(rowSwipeAnimatedValues[listId], {
            toValue: 0,
            friction: 5,
            useNativeDriver: true
          }).start()
          Animated.timing(rowBackgroundColors[listId], {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
          }).start()
        }},
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => handleDeleteList(listId)
        }
      ]
    )
  }
  
  // Create a reusable renderItem with swipe support
  const renderTodoListItem = ({ item, index }) => {
    const listId = item.id || item._id
    
    // Make sure we have animated values for this item
    if (!rowSwipeAnimatedValues[listId]) {
      rowSwipeAnimatedValues[listId] = new Animated.Value(0)
    }
    if (!rowBackgroundColors[listId]) {
      rowBackgroundColors[listId] = new Animated.Value(0)
    }
    
    // Interpolate background color from white to red
    const backgroundColor = rowBackgroundColors[listId].interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(40,50,60,0.8)', 'rgba(255,59,48,0.8)']
    })
    
    // Set up pan responder for swipe gestures
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => 
        Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) { // Only allow swiping left
          rowSwipeAnimatedValues[listId].setValue(gestureState.dx)
          
          // Calculate color interpolation based on swipe distance
          // Start turning red after 40 pixels, fully red at 120 pixels
          const colorValue = Math.min(Math.max(Math.abs(gestureState.dx) - 40, 0) / 80, 1)
          rowBackgroundColors[listId].setValue(colorValue)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -120) { // Threshold for delete action
          // Show confirmation directly instead of animating further
          confirmDelete(listId)
        }
        
        // Always reset position and color - fixes the glitch
        Animated.spring(rowSwipeAnimatedValues[listId], {
          toValue: 0,
          friction: 5,
          useNativeDriver: true
        }).start()
        Animated.timing(rowBackgroundColors[listId], {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }).start()
      }
    })
    
    // Delete button rendered as part of swipe action
    const renderDeleteButton = () => {
      const trans = rowSwipeAnimatedValues[listId].interpolate({
        inputRange: [-120, 0],
        outputRange: [0, 120],
        extrapolate: 'clamp'
      })
      
      return (
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 120,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 20,
            transform: [{ translateX: trans }]
          }}
        >
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => confirmDelete(listId)}
          >
            <Ionicons name="trash" size={22} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )
    }
    
    return (
      <View style={styles.listItemOuterContainer}>
        {/* Delete button behind the item */}
        {renderDeleteButton()}
        
        <Animated.View
          style={[
            styles.swipeContainer,
            {
              transform: [
                { translateX: rowSwipeAnimatedValues[listId] }
              ]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.listItem,
              { backgroundColor }
            ]}
          >
            <TouchableOpacity
              style={styles.listItemTouchable}
              onPress={() => openTodoList(item)}
              activeOpacity={0.8}
            >
              <View style={styles.listIconContainer}>
                <Ionicons name="list" size={22} color={COLORS.primary} />
              </View>
              
              <View style={styles.listItemContent}>
                <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
                
                {/* Display task count if available */}
                {item.tasks && item.tasks.length > 0 && (
                  <Text style={styles.listTaskCount}>{item.tasks.length} tasks</Text>
                )}
              </View>
              
              <View style={styles.chevronContainer}>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    )
  }
  
  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your lists...</Text>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navBarBackground} />
      
      {/* Lists Header - FIXED: Removed purple background */}
      <View style={styles.listsHeader}>
        <Text style={styles.listsTitle}>Listor</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={createTodoList}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Todo Lists */}
      <FlatList
        data={todoLists}
        renderItem={renderTodoListItem}
        keyExtractor={(item) => item.key || item.id || item._id || String(Math.random())}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name="list-outline" 
              size={60} 
              color="rgba(255,255,255,0.3)" 
            />
            <Text style={styles.emptyText}>
              Inga listor ännu
            </Text>
            <Text style={styles.emptySubtext}>
              Tryck på + för att skapa en ny lista
            </Text>
            <TouchableOpacity
              style={styles.createListButton}
              onPress={createTodoList}
            >
              <Text style={styles.createListButtonText}>Skapa lista</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  
  // Lists Header - FIXED: Removed purple background
  listsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // List container
  listContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  
  // Swipe container
  listItemOuterContainer: {
    position: 'relative',
    marginBottom: 12, // Reduced spacing between items
    borderRadius: 14,
    overflow: 'hidden', 
  },
  swipeContainer: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,59,48,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // List item
  listItem: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  listItemTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70, // Reduced height for more compact list
  },
  listIconContainer: {
    width: 44, // Slightly smaller
    height: 44, // Slightly smaller
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  listItemContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 17, // Slightly smaller font
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  listTaskCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  chevronContainer: {
    paddingRight: 15,
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  createListButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  createListButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
}
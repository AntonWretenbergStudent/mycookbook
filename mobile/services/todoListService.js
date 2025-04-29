import AsyncStorage from "@react-native-async-storage/async-storage"
import { API_URI } from "../constants/api"

// Keys for AsyncStorage
const TODO_LISTS_KEY = "@todo_lists"
const TODO_LIST_KEY = "@todo_list_"

export const getAllTodoLists = async (token) => {
  try {
    // Try fetching from the API first
    let networkSuccess = false
    let data = []
    
    try {
      const response = await fetch(`${API_URI}/todolists`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        data = await response.json()
        // Cache the data locally
        await AsyncStorage.setItem(TODO_LISTS_KEY, JSON.stringify(data))
        networkSuccess = true
      }
    } catch (apiError) {
      console.log("API fetch failed, using local data:", apiError)
    }
    
    // If network failed, try loading from local storage
    if (!networkSuccess) {
      const todoListsJson = await AsyncStorage.getItem(TODO_LISTS_KEY)
      if (todoListsJson) {
        data = JSON.parse(todoListsJson);
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error getting todo lists:", error);
    // Return empty array in case of error
    return []
  }
}

/**
 * Get a specific todo list by ID
 * @param {string} token - Authentication token
 * @param {string} listId - ID of the todo list
 * @returns {Promise<Object|null>} - Todo list object or null if not found
 */
export const getTodoList = async (token, listId) => {
  try {
    // Skip API call for temporary IDs (they won't exist on the server)
    if (listId && (listId.startsWith('temp_') || listId.startsWith('new_list_'))) {
      // Just try to get from local storage
      const todoListJson = await AsyncStorage.getItem(`${TODO_LIST_KEY}${listId}`)
      return todoListJson ? JSON.parse(todoListJson) : null
    }
    
    // First try to get from local storage for immediate response
    const todoListJson = await AsyncStorage.getItem(`${TODO_LIST_KEY}${listId}`)
    let todoList = todoListJson ? JSON.parse(todoListJson) : null
    
    // Try fetching from the API for permanent IDs
    try {
      const response = await fetch(`${API_URI}/todolists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (response.ok) {
        const data = await response.json()
        // Cache the data locally
        await AsyncStorage.setItem(`${TODO_LIST_KEY}${listId}`, JSON.stringify(data))
        return data
      }
    } catch (apiError) {
      console.log("API fetch failed, using local data:", apiError)
    }
    
    // Return local data if API failed
    return todoList
  } catch (error) {
    console.error("Error getting todo list:", error)
    return null
  }
}

/**
 * Save a todo list
 * @param {string} token - Authentication token
 * @param {Object} todoList - Todo list to save
 * @returns {Promise<Object|null>} - Saved todo list or null if failed
 */
export const saveTodoList = async (token, todoList) => {
  try {
    // Check if this is a temporary ID or a permanent MongoDB ID
    const isTemporary = !todoList._id && (
      !todoList.id || 
      todoList.id.startsWith('temp_') || 
      todoList.id.startsWith('new_list_')
    )
    
    // If it's a temporary ID, do a POST request to create a new list
    // If it has a MongoDB _id, do a PUT request to update
    const method = isTemporary ? "POST" : "PUT";
    const url = isTemporary 
      ? `${API_URI}/todolists` 
      : `${API_URI}/todolists/${todoList._id || todoList.id}`
    
    // Always save locally first for immediate feedback
    if (todoList.id) {
      await AsyncStorage.setItem(`${TODO_LIST_KEY}${todoList.id}`, JSON.stringify(todoList))
    }
    
    // Try to save to API
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Only send necessary data (exclude client-side id for new items)
        body: JSON.stringify({
          title: todoList.title,
          tasks: todoList.tasks,
          theme: todoList.theme
        }),
      })
      
      if (response.ok) {
        const savedList = await response.json()
        
        // If this was a new list, update our local references to use the MongoDB ID
        if (isTemporary && todoList.id && savedList._id) {
          // Remove the old temporary list
          await AsyncStorage.removeItem(`${TODO_LIST_KEY}${todoList.id}`)
        }
        
        // Save with the MongoDB ID
        await AsyncStorage.setItem(`${TODO_LIST_KEY}${savedList._id}`, JSON.stringify(savedList))
        
        // Update local lists collection
        let lists = [];
        const listsJson = await AsyncStorage.getItem(TODO_LISTS_KEY)
        
        if (listsJson) {
          lists = JSON.parse(listsJson)
          
          if (isTemporary) {
            // For new lists, replace the temporary one or add
            const existingIndex = lists.findIndex(list => list.id === todoList.id)
            if (existingIndex >= 0) {
              lists[existingIndex] = savedList;
            } else {
              lists.push(savedList)
            }
          } else {
            // For existing lists, update by MongoDB ID
            const existingIndex = lists.findIndex(list => 
              list._id === savedList._id
            )
            
            if (existingIndex >= 0) {
              lists[existingIndex] = savedList;
            } else {
              lists.push(savedList)
            }
          }
        } else {
          lists = [savedList]
        }
        
        await AsyncStorage.setItem(TODO_LISTS_KEY, JSON.stringify(lists))
        
        return savedList;
      } else {
        console.log("API save failed with status:", response.status)
        // Throw to go to the catch block
        throw new Error(`API save failed with status: ${response.status}`)
      }
    } catch (apiError) {
      console.log("API save failed, data saved locally:", apiError)
      
      // Update local lists collection with the local version
      let lists = [];
      const listsJson = await AsyncStorage.getItem(TODO_LISTS_KEY)
      
      if (listsJson) {
        lists = JSON.parse(listsJson);
        const existingIndex = lists.findIndex(list => 
          list.id === todoList.id || list._id === todoList.id
        )
        
        if (existingIndex >= 0) {
          lists[existingIndex] = todoList;
        } else {
          lists.push(todoList)
        }
      } else {
        lists = [todoList]
      }
      
      await AsyncStorage.setItem(TODO_LISTS_KEY, JSON.stringify(lists))
      
      // Return the local data if network save failed
      return todoList
    }
  } catch (error) {
    console.error("Error saving todo list:", error);
    return null
  }
}

/**
 * Delete a todo list
 * @param {string} token - Authentication token
 * @param {string} listId - ID of the todo list to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteTodoList = async (token, listId) => {
  try {
    // Remove from local storage first
    await AsyncStorage.removeItem(`${TODO_LIST_KEY}${listId}`)
    
    // Update the lists collection
    const listsJson = await AsyncStorage.getItem(TODO_LISTS_KEY)
    if (listsJson) {
      const lists = JSON.parse(listsJson).filter(list => 
        list.id !== listId && list._id !== listId
      )
      await AsyncStorage.setItem(TODO_LISTS_KEY, JSON.stringify(lists))
    }
    
    // If it's a temporary ID, don't try to delete from API
    if (listId && (listId.startsWith('temp_') || listId.startsWith('new_list_'))) {
      return true;
    }
    
    // Try deleting from the API
    try {
      const response = await fetch(`${API_URI}/todolists/${listId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) {
        console.log("API delete failed, but removed locally")
      }
    } catch (apiError) {
      console.log("API delete failed, removed locally:", apiError)
    }
    
    return true
  } catch (error) {
    console.error("Error deleting todo list:", error)
    return false
  }
}
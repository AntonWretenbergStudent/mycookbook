import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from "react-native"
import { useAuthStore } from "../../store/authStore"
import { Image } from "expo-image"
import { useEffect, useState } from "react"
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"

import styles from "../../assets/styles/home.styles"
import COLORS from "../../constants/colors"
import Loader from "../../components/Loader"

export default function Home() {
  const router = useRouter();
  const { token, user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial setup
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) return <Loader />

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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>My Cookbook</Text>
          <Text style={styles.headerDate}>
            {new Date().getDate() + " " + 
             ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][new Date().getMonth()] + 
             ". " + new Date().getFullYear()}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="search-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.emptyContainer}>
        <Ionicons 
          name="close" 
          size={60} 
          color="rgba(255,255,255,0.3)" 
          style={styles.crossIcon}
        />
        <Text style={styles.emptyText}>No recommendations yet</Text>
        <Text style={styles.emptySubtext}>
          Be the first to share your recipe!
        </Text>
      </View>
    </View>
  )
}
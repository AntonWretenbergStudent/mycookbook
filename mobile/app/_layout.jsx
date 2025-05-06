import { Stack, useRouter, useSegments, SplashScreen } from "expo-router"
import { SafeAreaProvider } from "react-native-safe-area-context"
import SafeScreen from "../components/SafeScreen"
import { StatusBar } from "expo-status-bar"
import { useFonts } from "expo-font"
import { View, Text, ActivityIndicator } from "react-native"
import { useEffect, useState } from "react"

import { useAuthStore } from "../store/authStore"
import COLORS from "../constants/colors"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const router = useRouter()
  const segments = useSegments()

  const { checkAuth, user, token, isCheckingAuth } = useAuthStore()
  const [authInitialized, setAuthInitialized] = useState(false)

  const [fontsLoaded] = useFonts({
    "Outfit-Medium": require("../assets/fonts/Outfit-Medium.ttf")
  })

  // Initialize auth state when app starts - this runs once
  useEffect(() => {
    const initAuth = async () => {
      console.log("Initializing authentication...")
      await checkAuth()
      setAuthInitialized(true)
      console.log("Auth initialized, authenticated:", !!token)
    }

    initAuth()
  }, [])

  // Handle navigation based on auth state - this runs when auth state or route changes
  useEffect(() => {
    if (!authInitialized || isCheckingAuth) return
    
    const inAuthScreen = segments[0] === "(auth)"
    const isSignedIn = !!user && !!token
    
    console.log("Navigation check - Auth screen:", inAuthScreen, "Signed in:", isSignedIn)
    
    if (!isSignedIn && !inAuthScreen) {
      console.log("Not signed in, redirecting to auth screen")
      router.replace("/(auth)")
    } else if (isSignedIn && inAuthScreen) {
      console.log("Already signed in, redirecting to main screen")
      router.replace("/(tabs)")
    }
  }, [user, token, segments, authInitialized, isCheckingAuth])

  // Handle splash screen
  useEffect(() => {
    const hideSplash = async () => {
      // Only hide splash when fonts are loaded and auth check is complete
      if (fontsLoaded && !isCheckingAuth) {
        console.log("Hiding splash screen")
        await SplashScreen.hideAsync()
      }
    }
    
    hideSplash()
  }, [fontsLoaded, isCheckingAuth])

  // Show loading indicator while checking auth
  if (!fontsLoaded || isCheckingAuth) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#000' 
      }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ 
          color: 'white', 
          marginTop: 10,
          fontWeight: '600'
        }}>
          Loading MyCookBook...
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        style="light"
        backgroundColor={COLORS.navBarBackground}
        translucent={true} 
      />
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
    </SafeAreaProvider>
  )
}
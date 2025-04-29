import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import COLORS from "../../constants/colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={COLORS.navBarBackground}
        translucent={true}
      />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          headerTitleStyle: {
            color: COLORS.textPrimary,
            fontWeight: "600",
          },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: COLORS.navBarBackground,
            borderTopWidth: 1,
            borderTopColor: COLORS.navBarBackground,
            paddingTop: 5,
            paddingBottom: insets.bottom,
            height: 60 + insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Recipes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="diary"
          options={{
            title: "Diary",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={COLORS.icon} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookmark"
          options={{
            title: "Bookmark",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bookmark-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
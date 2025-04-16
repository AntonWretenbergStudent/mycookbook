import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

export default function SafeScreen({ children }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.outerContainer}>
      {/* Status bar placeholder */}
      <View style={[styles.statusBar, { height: insets.top }]} />
      
      {/* Main content with proper padding */}
      <View 
        style={[
          styles.container, 
          { paddingTop: insets.top }
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusBar: {
    backgroundColor: COLORS.navBarBackground,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1
  }
});
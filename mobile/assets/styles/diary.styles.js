import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
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
});

export default styles;
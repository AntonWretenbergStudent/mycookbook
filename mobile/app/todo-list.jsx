import { useLocalSearchParams } from "expo-router"
import TodoList from "../components/TodoList"

export default function TodoListScreen() {
  const { listId } = useLocalSearchParams()
  
  return <TodoList route={{ params: { listId } }} />
}
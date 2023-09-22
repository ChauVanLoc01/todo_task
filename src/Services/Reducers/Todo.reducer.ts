import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Todo } from "../Types/Todo.type";
import { WorkingWithLocalStorage as ls } from "../Utils/LocalStorage";
import { addTodoByBinarySearch, searchTodo } from "../Utils/Utils";
import dayjs from "dayjs";

const initialState: Todo[] = ls.get("todo")
  ? JSON.parse(ls.get("todo") as string)
  : [];

export const todoSlice = createSlice({
  name: "todoSlice",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state = addTodoByBinarySearch(state, action.payload);
      ls.update("todo", JSON.stringify(state));
    },
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const index = searchTodo(state, action.payload.deadline);
      if (state[index].deadline !== action.payload.deadline) {
        state.splice(index, 1);
        state = addTodoByBinarySearch(state, action.payload);
      } else {
        state[index] = action.payload;
      }
      ls.update("todo", JSON.stringify(state));
    },
    deleteTodo: (state, action: PayloadAction<number>) => {
      const index = searchTodo(state, action.payload);
      state.splice(index, 1);
      ls.update("todo", JSON.stringify(state));
    },
  },
});

export const { addTodo, deleteTodo, updateTodo } = todoSlice.actions;

export const TodoSliceName = todoSlice.name;

export const TodoSlice = todoSlice.reducer;

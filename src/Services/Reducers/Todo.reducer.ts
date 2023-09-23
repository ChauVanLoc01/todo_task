import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Todo } from "../Types/Todo.type";
import { WorkingWithLocalStorage as ls } from "../Utils/LocalStorage";
import { addTodoByBinarySearch } from "../Utils/Utils";
import dayjs from "dayjs";

const initialState: Todo[] = ls.get("todos")
  ? JSON.parse(ls.get("todos") as string)
  : [];

export const todoSlice = createSlice({
  name: "todoSlice",
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<Todo>) => {
      state = addTodoByBinarySearch(state, action.payload);
      ls.update("todos", JSON.stringify(state));
    },
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const input = action.payload;
      const index = state.findIndex((todo) => todo.id === input.id);
      if (index === -1) {
        return;
      }
      if (state[index].deadline !== input.deadline) {
        state.splice(index, 1);
        state = addTodoByBinarySearch(state, input);
      } else {
        state[index] = input;
      }
      ls.update("todos", JSON.stringify(state));
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      const index = state.findIndex((todo) => todo.id === action.payload);
      state.splice(index, 1);
      ls.update("todos", JSON.stringify(state));
    },
  },
});

export const { addTodo, deleteTodo, updateTodo } = todoSlice.actions;

export const TodoSliceName = todoSlice.name;

export const TodoSlice = todoSlice.reducer;

import dayjs from "dayjs";
import { Todo } from "../Types/Todo.type";

export const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};
export const searchTodo = function (todos: Todo[], deadline: number) {
  let left = 0,
    right = todos.length - 1;
  while (left < right) {
    let mid = left + Math.floor((right - left + 1) / 2);
    if (deadline > todos[mid].deadline) {
      right = mid - 1;
    } else {
      left = mid;
    }
  }
  return todos[left].deadline == deadline ? left : -1;
};

export const addTodoByBinarySearch = (todos: Todo[], target: Todo) => {
  if (
    todos.length === 0 ||
    todos[todos.length - 1].deadline > target.deadline
  ) {
    todos.push(target);
    return todos;
  }
  if (todos[0].deadline < target.deadline) {
    todos.unshift(target);
    return todos;
  }
  let left = 0,
    right = todos.length - 1;
  while (left < right) {
    let mid = left + Math.floor((right - left) / 2);
    if (target.deadline > todos[mid].deadline) {
      if (target.deadline < todos[mid - 1].deadline) {
        todos.splice(mid, 0, target);
        break;
      } else {
        right = mid - 1;
      }
    } else {
      if (target.deadline > todos[mid + 1].deadline) {
        todos.splice(mid + 1, 0, target);
        break;
      } else {
        left = mid;
      }
    }
  }
  return todos;
};

export const dayOfWeek = (milisecond: number) => {
  switch (dayjs(milisecond).day()) {
    case 0:
      return "Sun";
    case 1:
      return "Mon";
    case 2:
      return "Tue";
    case 3:
      return "Wed";
    case 4:
      return "Thu";
    case 5:
      return "Fri";
    case 6:
      return "Sat";
    default:
      break;
  }
};

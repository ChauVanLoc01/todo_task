import dayjs from "dayjs";
import { Todo } from "../Types/Todo.type";

export const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};
// export const searchTodo = function (todos: Todo[], deadline: number) {
//   let left = 0,
//     right = todos.length - 1;
//   if (todos.length === 1 && todos[0].deadline === deadline) {
//     return 0;
//   }
//   while (left < right) {
//     let mid = left + (right - left) / 2;
//     if (todos[mid].deadline === deadline) {
//       return mid;
//     } else if (todos[mid].deadline > deadline) {
//       left = mid;
//     } else {
//       right = mid + 1;
//     }
//   }
//   return -1;
// };
export const findDeadline = function (todos: Todo[], deadline: number) {
  if (todos.length === 0) {
    return -1;
  }
  if (todos.length === 1 && todos[0].deadline === deadline) {
    return 0;
  }
  let left = 0,
    right = todos.length - 1;
  while (left < right) {
    let mid = left + Math.floor((right - left) / 2);
    if (deadline === todos[mid].deadline) {
      return mid;
    }
    if (deadline > todos[mid].deadline) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return todos[left].deadline === deadline ? left : -1;
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

export const convertVnToEng = (str: string, toUpperCase?: false) => {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

  return toUpperCase ? str.toUpperCase() : str;
};

export function generateUniqueString() {
  const uniqueString = Date.now().toString(36); // Sử dụng thời gian hiện tại dưới dạng chuỗi

  // Thêm một số ngẫu nhiên để đảm bảo tính duy nhất
  const randomPart = Math.random().toString(36).substr(2, 5);

  return uniqueString + randomPart;
}

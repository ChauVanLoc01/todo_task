import { useEffect, useMemo, useState } from "react";
import {
  List,
  Input,
  Button,
  Select,
  Modal,
  DatePicker,
  message,
  Popconfirm,
} from "antd";
import "./TodoList.css";
import { Todo as TodoType } from "../../Services/Types/Todo.type";
import { Order } from "../../Services/Types/Order.type";
import { Filter } from "../../Services/Types/Filter.type";
import Todo from "../Todo/Todo";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { todoSchema } from "../../Services/Schemas/Todo.schema";
import { range } from "../../Services/Utils/Utils";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addTodo,
  deleteTodo,
  updateTodo,
} from "../../Services/Reducers/Todo.reducer";
import classNames from "classnames";

const { Option } = Select;

const TodoList = () => {
  const todos = useAppSelector((state) => state.TodoSliceName);
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<number>(dayjs().date());
  const [sortOrder, setSortOrder] = useState<Order>("ascend");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [editedTodo, setEditedTodo] = useState<TodoType | undefined>(undefined);
  const {
    control,
    handleSubmit,
    formState: {
      errors: { content, deadline, note, position },
    },
    setError,
    reset,
  } = useForm<Pick<TodoType, "content" | "deadline" | "note" | "position">>({
    resolver: yupResolver(todoSchema),
  });
  const [messageApi, contextHolder] = message.useMessage();

  const handleMarkDoneOrUnDoneTodo = (todo: TodoType) => {
    dispatch(updateTodo(todo));
  };

  const handleDeleteTodo = (index: string) => {
    dispatch(deleteTodo(index));
    messageApi.open({
      type: "success",
      content: "Delete Todos Successfully",
    });
  };
  const filteredAndSortedTodos = useMemo(() => {
    var result: TodoType[] = [];
    if (sortOrder === "descend") {
      result = todos;
    }
    if (sortOrder === "ascend") {
      result = [...todos].reverse();
    }
    if (selectedFilter === "done") {
      result = result.filter((e) => e.isDone);
    }
    if (selectedFilter === "undone") {
      result = result.filter((e) => !e.isDone);
    }
    if (searchValue) {
      const words = searchValue.split(/\s+/);
      result = result.filter((e) =>
        words.some(
          (w) => e.content.toLowerCase().indexOf(w.toLocaleLowerCase()) > -1
        )
      );
    }
    return result;
  }, [sortOrder, selectedFilter, todos, searchValue]);

  // Handle Modal
  const onSubmit =
    (todo?: TodoType) =>
    (data: Pick<TodoType, "content" | "deadline" | "note" | "position">) => {
      if (dayjs(data.deadline).diff(dayjs()) < 0) {
        setError("deadline", {
          message: "Deadline không hợp lệ",
        });
        return;
      }
      if (todo) {
        dispatch(
          updateTodo({
            ...todo,
            ...data,
            justCreatedOrEdited: true,
          })
        );
        setEditedTodo(undefined);
      } else {
        dispatch(
          addTodo({
            ...data,
            id: new Date().toISOString(),
            isDone: false,
            isWarning: false,
            justCreatedOrEdited: true,
          })
        );
      }
      reset();
      setIsModalOpen(false);
      messageApi.open({
        type: "success",
        content: `${editedTodo ? "Edit" : "Add"} Todos Successfully`,
      });
    };

  // Handle Date Picker
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    return current && current.valueOf() < dayjs().subtract(1, "day").valueOf();
  };

  const disabledDateTime = () => ({
    disabledHours: () => {
      if (selectedDate > dayjs().date()) {
        return [-1, 24];
      }
      return range(0, 24).splice(0, dayjs().hour());
    },
    disabledMinutes: (hour: number) => {
      if (hour === dayjs().hour() && selectedDate === dayjs().date()) {
        return range(0, dayjs().minute() + 1);
      }
      return [-1, 60];
    },
    disabledSeconds: () => [55, 56],
  });

  useEffect(() => {
    if (editedTodo) {
      reset({
        ...editedTodo,
        position: editedTodo.position ?? "Online",
      });
      setIsModalOpen(true);
    } else {
      reset({
        content: "",
        note: undefined,
        position: undefined,
        deadline: undefined,
      });
    }
  }, [editedTodo, setEditedTodo]);

  // const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const selected_file = e.target.files?.[0] as File;
  //   console.log(
  //     (window.URL || window.webkitURL).createObjectURL(selected_file)
  //   );
  //   console.log(selected_file);
  // };
  return (
    <div className="todos">
      {contextHolder}
      <div className="todos-header">
        <div className="todos-search">
          <Input
            placeholder="Search a todo"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="todos-input"
          />
          <Button className="todos-button" type="primary">
            Search
          </Button>
        </div>
        <div className="todos-buttons">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="todos-button todos-add"
          >
            Add
          </Button>
          <Modal
            title="Add Todo"
            open={isModalOpen}
            okText={editedTodo ? "Edit" : "Add"}
            onCancel={() => {
              reset();
              setIsModalOpen(false);
              setEditedTodo(undefined);
            }}
            onOk={handleSubmit(onSubmit(editedTodo))}
            okButtonProps={{
              htmlType: "submit",
            }}
          >
            <form>
              <div
                className={classNames("todos-modal-hidden", {
                  "todos-modal-error": content?.message,
                })}
              >
                {content?.message}
              </div>
              <div className="todos-modal todos-modal-input">
                <label
                  className="todos-modal-title todo-modal-require"
                  htmlFor="content"
                >
                  Content
                </label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      id="content"
                      placeholder="Entern your content"
                      className="todos-input todos-modal-input"
                      {...field}
                    />
                  )}
                />
              </div>
              <div
                className={classNames("todos-modal-hidden", {
                  "todos-modal-error": note?.message,
                })}
              >
                {note?.message}
              </div>
              <div className="todos-modal todos-modal-input">
                <label className="todos-modal-title" htmlFor="note">
                  Note
                </label>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      id="note"
                      placeholder="Entern your content"
                      className="todos-input todos-modal-input"
                      {...field}
                    />
                  )}
                />
              </div>
              <div
                className={classNames("todos-modal-hidden", {
                  "todos-modal-error": position?.message,
                })}
              >
                {position?.message}
              </div>
              <div className="todos-modal todos-modal-input">
                <label className="todos-modal-title" htmlFor="position">
                  Position
                </label>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="position"
                      placeholder="Entern your position"
                      className="todos-input todos-modal-input"
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="todos-modal todos-modal-input">
                <label
                  className="todos-modal-title todo-modal-require"
                  htmlFor="date"
                >
                  Deadline
                </label>
                <Controller
                  name="deadline"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      showTime
                      format="HH:mm:ss DD-MM-YYYY"
                      disabledDate={disabledDate}
                      disabledTime={disabledDateTime}
                      showNow={true}
                      className="todos-modal-input"
                      id="date"
                      value={field.value ? dayjs(field.value) : dayjs()}
                      ref={field.ref}
                      name={field.name}
                      onSelect={(date) => setSelectedDate(dayjs(date).date())}
                      onChange={(date) => {
                        field.onChange(date ? date.valueOf() : null);
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <span
                  className={classNames("todos-modal-hidden", {
                    "todos-modal-error": deadline?.message,
                  })}
                >
                  {deadline?.message}
                </span>
                {/* <input type="file" name="" id="" onChange={onFileChange} /> */}
              </div>
            </form>
          </Modal>
          <Select
            value={sortOrder}
            onChange={(value) => setSortOrder(value as Order)}
            className="todos-sort"
          >
            <Option value="ascend">Ascend</Option>
            <Option value="descend">Descend</Option>
          </Select>
          <Select
            value={selectedFilter}
            onChange={(value) => setSelectedFilter(value as Filter)}
            className="todos-filter"
          >
            <Option value="all">All</Option>
            <Option value="done">Done</Option>
            <Option value="undone">Undone</Option>
          </Select>
        </div>
      </div>
      <List
        className="todos-items"
        dataSource={filteredAndSortedTodos}
        renderItem={(todo) => (
          <List.Item
            className={classNames("todo-item", {
              "todo-item-warning": todo.isWarning && !todo.isDone,
              "todo-item-done": todo.isDone,
              // "todo-item-just-created": todo.justCreatedOrEdited,
            })}
            actions={[
              <div
                onClick={() => setEditedTodo(todo)}
                className="todo-item-action todo-item-action-edit"
              >
                EDIT
              </div>,
              <div
                onClick={() =>
                  handleMarkDoneOrUnDoneTodo({ ...todo, isDone: true })
                }
                className={classNames(
                  "todo-item-action todo-item-action-finish",
                  {
                    "todo-item-action-hidden": todo.isDone,
                  }
                )}
              >
                DONE
              </div>,
              <div
                onClick={() =>
                  handleMarkDoneOrUnDoneTodo({ ...todo, isDone: false })
                }
                className={classNames(
                  "todo-item-action todo-item-action-finish",
                  {
                    "todo-item-action-hidden":
                      dayjs().diff(dayjs(todo.deadline)) > 10 || !todo.isDone,
                  }
                )}
              >
                UNDONE
              </div>,
              <Popconfirm
                title="Delete the task"
                description="Are you sure to delete this task?"
                onConfirm={() => handleDeleteTodo(todo.id)}
                okText="Yes"
                cancelText="No"
                className="todo-item-action todo-item-action-delete"
              >
                DELETE
              </Popconfirm>,
            ]}
          >
            <Todo todo={todo} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default TodoList;

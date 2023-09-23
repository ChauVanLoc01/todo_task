import { useEffect, useState } from "react";
import {
  List,
  Input,
  Button,
  Select,
  Modal,
  DatePicker,
  message,
  Popconfirm,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
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
import {
  convertVnToEng,
  findDeadline,
  generateUniqueString,
  range,
} from "../../Services/Utils/Utils";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addTodo,
  deleteTodo,
  updateTodo,
} from "../../Services/Reducers/Todo.reducer";
import classNames from "classnames";
import { UploadChangeParam, UploadFile } from "antd/es/upload";
import { DevTool } from "@hookform/devtools";

const { Option } = Select;

const TodoList = () => {
  const data = useAppSelector((state) => state.TodoSliceName);
  const dispatch = useAppDispatch();
  const [todos, setTodos] = useState<TodoType[]>(data);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<number>(dayjs().date());
  const [sortOrder, setSortOrder] = useState<Order>("ascend");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [editedTodo, setEditedTodo] = useState<TodoType | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<UploadFile<any>>();
  const {
    control,
    handleSubmit,
    formState: {
      errors: { content, deadline, note, position },
    },
    setError,
    reset,
    setValue,
  } = useForm<Pick<TodoType, "content" | "deadline" | "note" | "position">>({
    resolver: yupResolver(todoSchema),
  });
  // dùng để hiển thị message ui
  const [messageApi, contextHolder] = message.useMessage();

  // Xóa toàn bộ data trong form
  const handleResetAllValueOfForm = () => {
    reset({
      content: "",
      note: undefined,
      position: undefined,
      deadline: undefined,
    });
  };

  const handleMarkDoneOrUnDoneTodo = (todo: TodoType) => () => {
    dispatch(updateTodo(todo));
  };

  const handleDeleteTodo = (id: string) => {
    dispatch(deleteTodo(id));
    messageApi.open({
      type: "success",
      content: "Delete Todos Successfully",
    });
  };

  const filteredAndSortedTodos = () => {
    let result: TodoType[] = data;
    if (sortOrder === "ascend") {
      result = [...result].reverse();
    }
    if (selectedFilter === "done") {
      result = result.filter((e) => e.isDone);
    }
    if (selectedFilter === "undone") {
      result = result.filter((e) => !e.isDone);
    }
    setTodos(result);
  };

  const handleSearchTodo = () => {
    if (searchValue) {
      const words = searchValue.split(/\s+/);
      setTodos((todos) =>
        todos.filter((e) =>
          words.some(
            (w) => convertVnToEng(e.content).indexOf(convertVnToEng(w)) > -1
          )
        )
      );
    }
  };

  // Handle Modal
  const onSubmit = (
    data: Pick<TodoType, "content" | "deadline" | "note" | "position">
  ) => {
    if (dayjs(data.deadline).diff(dayjs()) < 0) {
      setError("deadline", {
        message: "Deadline không hợp lệ",
      });
      return;
    }

    const isWarning =
      dayjs(data.deadline).diff(dayjs(), "h") <= 1 ? true : false;

    if (editedTodo) {
      dispatch(
        updateTodo({
          ...editedTodo,
          ...data,
          isWarning,
        })
      );
      setEditedTodo(undefined);
    } else {
      if (findDeadline(todos, data.deadline) > -1) {
        messageApi.open({
          type: "error",
          content: "Deadline đã tồn tại",
        });
        return;
      }
      dispatch(
        addTodo({
          ...data,
          isDone: false,
          isWarning,
          id: generateUniqueString(),
          justCreated: false,
          fileUrl: selectedFile ? selectedFile.thumbUrl : undefined,
          fileName: selectedFile ? selectedFile.name : undefined,
        })
      );
      setSelectedFile(undefined);
    }
    setIsModalOpen(false);
    messageApi.open({
      type: "success",
      content: `${editedTodo ? "Edit" : "Add"} Todos Successfully`,
    });
  };

  const handleCancelModal = () => {
    if (editedTodo) {
      reset({
        content: "",
        deadline: undefined,
        note: undefined,
        position: undefined,
      });
      setEditedTodo(undefined);
    }
    setIsModalOpen(false);
  };

  const dummyRequest = ({ file, onSuccess, onError }: any) => {
    setTimeout(() => {
      if (file.type.split("/")[0] === "image") {
        onSuccess("ok");
      } else {
        onError({ status: 500 }, "error");
      }
    }, 0);
  };

  const hanldeFileChange = (e: UploadChangeParam<UploadFile<any>>) => {
    if (!selectedFile && e.file.type?.split("/")[0] === "image") {
      setSelectedFile(e.file);
    }
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
    filteredAndSortedTodos();
  }, [sortOrder, selectedFilter, data]);

  // Sử dụng cho trường hợp khi người dùng clear từ khóa tìm kiếm thì sẽ tự động refresh lại todos
  useEffect(() => {
    !searchValue && filteredAndSortedTodos();
  }, [searchValue]);

  // Chỉnh sửa todo
  useEffect(() => {
    if (editedTodo) {
      reset({
        ...editedTodo,
        position: editedTodo.position ?? "Online",
      });
      setIsModalOpen(true);
    } else {
      handleResetAllValueOfForm();
    }
  }, [editedTodo, data]);

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
          <Button
            className="todos-button"
            onClick={handleSearchTodo}
            type="primary"
          >
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
            onCancel={handleCancelModal}
            onOk={handleSubmit(onSubmit)}
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
                      value={dayjs(field.value)}
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
              </div>
              <Upload
                listType="picture"
                customRequest={dummyRequest}
                onChange={hanldeFileChange}
                maxCount={1}
                beforeUpload={(file) => {
                  if (file.type?.split("/")[0] !== "image") {
                    messageApi.open({
                      type: "error",
                      content: "File không đúng định dạng (image/*)",
                    });
                  }
                }}
                onRemove={() => setSelectedFile(undefined)}
              >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </form>
            <DevTool control={control} />
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
        dataSource={todos}
        renderItem={(todo) => (
          <List.Item
            className={classNames("todo-item", {
              "todo-item-done": todo.isDone,
              "todo-item-just-created todo-animate-pulse": todo.justCreated,
              "todo-item-warning todo-animate-pulse":
                todo.isWarning && !todo.isDone,
            })}
            actions={[
              <div
                onClick={() => setEditedTodo(todo)}
                className="todo-item-action todo-item-action-edit"
              >
                EDIT
              </div>,
              <div
                onClick={handleMarkDoneOrUnDoneTodo({ ...todo, isDone: true })}
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
                onClick={handleMarkDoneOrUnDoneTodo({ ...todo, isDone: false })}
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

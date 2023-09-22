import React, { useEffect, useState } from "react";
import "./Todo.css";
import { CountdownProps, Statistic } from "antd";
import dayjs from "dayjs";
import { dayOfWeek } from "../../Services/Utils/Utils";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "../../store";
import { Todo as TodoType } from "../../Services/Types/Todo.type";
import { updateTodo } from "../../Services/Reducers/Todo.reducer";

const { Countdown } = Statistic;

type TodoProps = {
  todo: TodoType;
};

function Todo({ todo }: TodoProps) {
  const { content, deadline, id, isDone, note, position } = todo;
  const todos = useAppSelector((state) => state.TodoSliceName);
  const dispatch = useAppDispatch();
  const miliseconds = Date.now() + dayjs(deadline).diff(dayjs(), "millisecond");
  const onFinish: CountdownProps["onFinish"] = () => {
    dispatch(updateTodo({ ...todo, isDone: true, isWarning: false }));
  };

  const onChange: CountdownProps["onChange"] = (val) => {
    if (typeof val === "number") {
      if (dayjs(deadline).diff(dayjs(), "h") <= 1) {
        !todo.isWarning && dispatch(updateTodo({ ...todo, isWarning: true }));
      }
      // if (dayjs(deadline - 5000).diff(dayjs()) === val) {
      //   todo.justCreatedOrEdited &&
      //     dispatch(updateTodo({ ...todo, justCreatedOrEdited: false }));
      // }
      // console.log(val === dayjs().millisecond() + 5000);
    }
  };

  return (
    <div className="todo">
      <div
        className={classNames("todo-top", {
          "todo-top-hidden": isDone,
        })}
      >
        <Countdown
          value={miliseconds}
          title="TTL:"
          onFinish={onFinish}
          valueStyle={{ color: "#ff4d4f" }}
          onChange={onChange}
          format="Dd HH:mm:ss"
        />
      </div>
      <div className="todo-bottom">
        <div className="todo-time">
          <div className="todo-left">
            <h3 className="todo-day-of-week">{dayOfWeek(deadline)}</h3>
            <h2 className="todo-day">
              {dayjs(deadline).date()}-
              {dayjs(deadline).month() + 1 > 9
                ? dayjs(deadline).month() + 1
                : `0${dayjs(deadline).month() + 1}`}
            </h2>
          </div>
          <div className="todo-right">
            <div className="todo-hour">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="todo-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{dayjs(deadline).format("HH:mm:ss")}</span>
            </div>
            <div className="todo-position">
              {position ? position : "Online"}
            </div>
          </div>
        </div>
        <div className="todo-content">
          <h4 className=".abc">{content}</h4>
          <div
            className={classNames("todo-note", {
              "todo-note-hidden": !note,
            })}
          >
            <span className="todo-note-title">*Note: </span>
            <span className="todo-note-content">{note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Todo);

export type Todo = {
  content: string;
  note?: string;
  deadline: number;
  position?: string;
  file?: string;
  isDone: boolean;
  isWarning: boolean;
};

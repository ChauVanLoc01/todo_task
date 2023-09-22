export type Todo = {
  id: string;
  content: string;
  note?: string;
  deadline: number;
  position?: string;
  file?: string;
  isDone: boolean;
  justCreatedOrEdited: boolean;
  isWarning: boolean;
};
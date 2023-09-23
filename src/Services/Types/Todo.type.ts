export type Todo = {
  id: string;
  content: string;
  note?: string;
  deadline: number;
  position?: string;
  fileName?: string;
  fileUrl?: string;
  isDone: boolean;
  isWarning: boolean;
  justCreated: boolean;
};

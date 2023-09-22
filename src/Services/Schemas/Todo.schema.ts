import dayjs from "dayjs";
import * as yup from "yup";

export const todoSchema = yup
  .object({
    content: yup
      .string()
      .trim()
      .required("Content là bắt buộc")
      .min(2, "Độ dài Content tối thiểu 2 kí tự")
      .max(200, "Độ dài Content tối đa 300 kí tự"),
    note: yup
      .string()
      .trim()
      .optional()
      .min(10, "Độ dài Note tối thiểu 10 kí tự")
      .max(100, "Độ dài Note tối đa 200 kí tự"),
    deadline: yup.number().required("Deadline là bắt buộc"),
    position: yup
      .string()
      .trim()
      .optional()
      .min(2, "Độ dài Position tối thiểu 2 kí tự")
      .max(15, "Độ dài Position tối đa 15 kí tự"),
    file: yup.string().trim().optional().min(8, "tối thiểu 8 kí tự"),
  })
  .required();

export type TodoSchemaType = yup.InferType<typeof todoSchema>;

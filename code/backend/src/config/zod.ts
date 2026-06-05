import { z } from 'zod';

export const customZodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let message: string;

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        message = 'Trường này là bắt buộc';
      } else {
        message = 'Dữ liệu không đúng định dạng';
      }
      break;

    case z.ZodIssueCode.invalid_string:
      if (typeof issue.validation === 'string') {
        if (issue.validation === 'email') {
          message = 'Email không đúng định dạng';
        } else if (issue.validation === 'uuid') {
          message = 'Định dạng UUID không hợp lệ';
        } else {
          message = `Dữ liệu không hợp lệ (${issue.validation})`;
        }
      } else {
        message = 'Chuỗi không đúng định dạng';
      }
      break;

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        message = `Chuỗi phải chứa ít nhất ${issue.minimum} ký tự`;
      } else if (issue.type === 'number') {
        message = `Giá trị phải lớn hơn hoặc bằng ${issue.minimum}`;
      } else if (issue.type === 'array') {
        message = `Mảng phải chứa ít nhất ${issue.minimum} phần tử`;
      } else {
        message = 'Giá trị quá nhỏ';
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        message = `Chuỗi chứa tối đa ${issue.maximum} ký tự`;
      } else if (issue.type === 'number') {
        message = `Giá trị phải nhỏ hơn hoặc bằng ${issue.maximum}`;
      } else if (issue.type === 'array') {
        message = `Mảng chứa tối đa ${issue.maximum} phần tử`;
      } else {
        message = 'Giá trị quá lớn';
      }
      break;

    case z.ZodIssueCode.invalid_enum_value:
      message = `Giá trị không hợp lệ. Vui lòng chọn một trong các giá trị sau: ${issue.options.join(', ')}`;
      break;

    case z.ZodIssueCode.unrecognized_keys:
      message = `Phát hiện các trường không hợp lệ: ${issue.keys.join(', ')}`;
      break;

    case z.ZodIssueCode.custom:
      message = issue.message || 'Dữ liệu không hợp lệ';
      break;

    default:
      message = ctx.defaultError || 'Dữ liệu không hợp lệ';
  }

  return { message };
};

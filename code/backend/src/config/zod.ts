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
          message = 'không đúng định dạng email';
        } else if (issue.validation === 'uuid') {
          message = 'không hợp lệ';
        } else {
          message = `không hợp lệ (${issue.validation})`;
        }
      } else {
        message = 'không đúng định dạng';
      }
      break;

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        message = `phải chứa ít nhất ${issue.minimum} ký tự`;
      } else if (issue.type === 'number') {
        message = `phải lớn hơn hoặc bằng ${issue.minimum}`;
      } else if (issue.type === 'array') {
        message = `phải chứa ít nhất ${issue.minimum} phần tử`;
      } else {
        message = 'quá nhỏ';
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        message = `chỉ được chứa tối đa ${issue.maximum} ký tự`;
      } else if (issue.type === 'number') {
        message = `phải nhỏ hơn hoặc bằng ${issue.maximum}`;
      } else if (issue.type === 'array') {
        message = `chỉ được chứa tối đa ${issue.maximum} phần tử`;
      } else {
        message = 'quá lớn';
      }
      break;

    case z.ZodIssueCode.invalid_enum_value:
      message = `Giá trị không hợp lệ. Vui lòng chọn một trong các giá trị sau: ${issue.options.join(', ')}`;
      break;

    case z.ZodIssueCode.unrecognized_keys:
      message = `Phát hiện các trường không hợp lệ: ${issue.keys.join(', ')}`;
      break;

    case z.ZodIssueCode.custom:
      message = issue.message || 'Lỗi dữ liệu tùy chỉnh (không thỏa mãn điều kiện nghiệp vụ)';
      break;

    default:
      message = ctx.defaultError || 'Định dạng dữ liệu không được hỗ trợ hoặc không hợp lệ';
  }

  return { message };
};

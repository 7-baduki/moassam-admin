import axios from 'axios';
import { ProblemDetail } from '@/types/error.type';

const DEFAULT_MESSAGE = '잠시 후 다시 시도해 주세요.';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ProblemDetail>(error)) {
    return error.response?.data?.detail ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}

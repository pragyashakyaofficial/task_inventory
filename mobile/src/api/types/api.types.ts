import { 
  FetchBaseQueryError 
} from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export const isFetchBaseQueryError = (
  error: unknown
): error is FetchBaseQueryError => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

export const isSerializedError = (
  error: unknown
): error is SerializedError => {
  return typeof error === 'object' && error !== null && 'message' in error && !('status' in error);
};

export const getErrorMessage = (error: unknown): string => {
  if (isFetchBaseQueryError(error)) {
    const errorData = error.data as any;
    return errorData?.message || JSON.stringify(error.data) || 'Unknown fetch error';
  }
  if (isSerializedError(error)) {
    return error.message || 'Unknown serialized error';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

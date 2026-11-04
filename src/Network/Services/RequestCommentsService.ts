import {AuthContext} from '../../Utils/AppStrings';
import {apiHandler, ApiMethod} from './ApiHandler';

type ApiResponse = {
  status: boolean;
  data?: any;
  error?: string;
  message?: string;
};

type RequestOptions = {
  endpoint: string;
  method?: ApiMethod;
  authContext?: AuthContext;
  queryParams?: Record<string, any>;
  payload?: any;
  useRecaptcha?: boolean;
  isFormData?: boolean;
};

const request = (options: RequestOptions): Promise<ApiResponse> => {
  return new Promise(resolve => {
    apiHandler({
      ...options,
      onComplete: resolve,
    });
  });
};

export const requestCommentsService = {
  fetchDetails: (options: Omit<RequestOptions, 'method' | 'payload'>) =>
    request({
      ...options,
      method: 'GET',
    }),

  fetchComments: (options: Omit<RequestOptions, 'method' | 'payload'>) =>
    request({
      ...options,
      method: 'GET',
    }),

  createComment: (options: Omit<RequestOptions, 'method'>) =>
    request({
      ...options,
      method: 'POST',
    }),

  updateComment: (options: Omit<RequestOptions, 'method'>) =>
    request({
      ...options,
      method: 'PATCH',
    }),
};

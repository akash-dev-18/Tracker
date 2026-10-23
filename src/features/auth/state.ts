export type AuthState = {
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAuthState: AuthState = {};

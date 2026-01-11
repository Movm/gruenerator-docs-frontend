import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

// ============================================================================
// Inlined from @gruenerator/shared/api
// ============================================================================

export interface ApiConfig {
  baseURL: string;
  getAuthToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
}

export type AuthMode = 'cookie' | 'bearer';

export interface CreateApiClientOptions extends ApiConfig {
  authMode: AuthMode;
  timeout?: number;
}

/**
 * Creates a platform-agnostic API client
 * Web: Uses cookie-based auth (credentials: 'include')
 * Mobile: Uses Bearer token auth
 */
export function createApiClient(options: CreateApiClientOptions): AxiosInstance {
  const { baseURL, authMode, getAuthToken, onUnauthorized, timeout = 900000 } = options;

  const client = axios.create({
    baseURL,
    timeout,
    withCredentials: authMode === 'cookie',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token for bearer mode
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (authMode === 'bearer' && getAuthToken) {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Response interceptor - handle 401 errors
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && onUnauthorized) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

// Global API client instance
let globalApiClient: AxiosInstance | null = null;

export const setGlobalApiClient = (client: AxiosInstance): void => {
  globalApiClient = client;
};

export const getGlobalApiClient = (): AxiosInstance => {
  if (!globalApiClient) {
    throw new Error('API client not initialized. Call setGlobalApiClient first.');
  }
  return globalApiClient;
};

// ============================================================================
// Docs App API Client
// ============================================================================

/**
 * Axios API client for direct API calls
 */
export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true, // Send cookies for session-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor for handling auth errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401
      const currentPath = window.location.pathname;
      const loginUrl = `/api/auth/login?source=gruenerator-login&redirectTo=${encodeURIComponent(currentPath)}`;
      window.location.href = loginUrl;
    }
    return Promise.reject(error);
  }
);

/**
 * Initialize shared API client
 */
const sharedClient = createApiClient({
  baseURL,
  authMode: 'cookie',
  onUnauthorized: () => {
    const currentPath = window.location.pathname;
    const loginUrl = `/api/auth/login?source=gruenerator-login&redirectTo=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  },
});

setGlobalApiClient(sharedClient);

export default apiClient;

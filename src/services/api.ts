import axios, {
    type AxiosInstance,
    type InternalAxiosRequestConfig,
    type AxiosRequestHeaders,
    AxiosError,
    type AxiosResponse
  } from 'axios'
  
  const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    }
  })
  
  const getAuthHeader = (): AxiosRequestHeaders | undefined => {
    return undefined
  }
  
  const handleError = (error: AxiosError) => {
    console.error('API Error:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
      console.error('Response headers:', error.response.headers)
    } else if (error.request) {
      console.error('Request data:', error.request)
    } else {
      console.error('Error message:', error.message)
    }
    console.error('Error config:', error.config)
  }
  
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const authHeader = getAuthHeader()
  
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
      if (config.headers) {
        config.headers['timezone'] = userTimezone
      }
  
      if (authHeader) {
        config.headers = {
          ...config.headers,
          ...authHeader
        } as AxiosRequestHeaders
      }
      return config
    },
    (error: AxiosError) => {
      handleError(error)
      return Promise.reject(error)
    }
  )
  
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      handleError(error)
      return Promise.reject(error)
    }
  )
  
  export default api
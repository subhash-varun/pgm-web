import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pgm-backend-latest.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Auto attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pg_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pg_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

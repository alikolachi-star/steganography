import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { api, type User } from "@/api/client"

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  )
  const [loading, setLoading] = useState(true)

  const persistAuth = useCallback((accessToken: string, nextUser: User) => {
    localStorage.setItem("token", accessToken)
    setToken(accessToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.login(email, password)
      persistAuth(response.access_token, response.user)
    },
    [persistAuth]
  )

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      const response = await api.register(email, username, password)
      persistAuth(response.access_token, response.user)
    },
    [persistAuth]
  )

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    api
      .me()
      .then(setUser)
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [token, logout])

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

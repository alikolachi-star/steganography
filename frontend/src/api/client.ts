export interface User {
  id: number
  email: string
  username: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Operation {
  id: number
  type: "encode" | "decode"
  original_filename: string
  message_length: number | null
  created_at: string
}

export interface HistoryResponse {
  items: Operation[]
  total: number
}

export interface DecodeResponse {
  message: string
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function getToken(): string | null {
  return localStorage.getItem("token")
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let detail = "Request failed"
    try {
      const data = (await response.json()) as { detail?: string | { msg: string }[] }
      if (typeof data.detail === "string") {
        detail = data.detail
      } else if (Array.isArray(data.detail)) {
        detail = data.detail.map((d) => d.msg).join(", ")
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>
  }

  return response as unknown as T
}

export const api = {
  register: (email: string, username: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  encode: async (image: File, message: string) => {
    const formData = new FormData()
    formData.append("image", image)
    formData.append("message", message)

    const token = getToken()
    const response = await fetch("/api/stego/encode", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    if (!response.ok) {
      let detail = "Encode failed"
      try {
        const data = (await response.json()) as { detail?: string }
        if (data.detail) detail = data.detail
      } catch {
        // ignore
      }
      throw new ApiError(response.status, detail)
    }

    const blob = await response.blob()
    const disposition = response.headers.get("Content-Disposition") || ""
    const match = disposition.match(/filename="(.+)"/)
    const filename = match?.[1] || "stego.png"
    return { blob, filename }
  },

  decode: async (image: File) => {
    const formData = new FormData()
    formData.append("image", image)
    return request<DecodeResponse>("/stego/decode", {
      method: "POST",
      body: formData,
    })
  },

  history: () => request<HistoryResponse>("/stego/history"),
}

export { ApiError }

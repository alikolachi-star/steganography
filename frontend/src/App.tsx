import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"

import { AppShell } from "@/components/layout/AppShell"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"
import { Decode } from "@/pages/Decode"
import { Encode } from "@/pages/Encode"
import { HistoryPage } from "@/pages/History"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/encode" element={<Encode />} />
            <Route path="/decode" element={<Decode />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/encode" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            color: "#e2e8f0",
          },
        }}
      />
    </AuthProvider>
  )
}

import { motion } from "motion/react"
import { Eye, Lock, Shield } from "lucide-react"
import { Link, Navigate, Outlet, useLocation } from "react-router-dom"

import { ParticleBackground } from "@/components/layout/ParticleBackground"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

const floatingIcons = [
  { Icon: Shield, x: "15%", y: "20%", delay: 0 },
  { Icon: Lock, x: "70%", y: "30%", delay: 0.5 },
  { Icon: Eye, x: "40%", y: "65%", delay: 1 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function AuthLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const isLogin = location.pathname === "/login"

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/encode" replace />
  }

  return (
    <div className="grid-bg relative flex min-h-screen">
      <ParticleBackground />

      <div className="flex w-full flex-col lg:flex-row">
        {/* Hero */}
        <div className="relative hidden flex-1 flex-col justify-center overflow-hidden p-12 lg:flex">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-lg"
          >
            <h1 className="text-5xl font-bold leading-tight">
              Hide messages in{" "}
              <span className="gradient-text">plain sight</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Image LSB steganography lets you embed secret text inside PNG and
              BMP images. The cover image looks identical — only you know the
              hidden message is there.
            </p>
          </motion.div>

          {floatingIcons.map(({ Icon, x, y, delay }, i) => (
            <motion.div
              key={i}
              className="absolute flex h-14 w-14 items-center justify-center rounded-2xl glass"
              style={{ left: x, top: y }}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            >
              <Icon className="h-6 w-6 text-emerald-400/70" />
            </motion.div>
          ))}
        </div>

        {/* Auth card */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
          <motion.div
            layout
            className="w-full max-w-md"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="border-emerald-500/10">
              <CardHeader className="text-center">
                <motion.div layoutId="auth-icon" className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </motion.div>
                <CardTitle className="text-2xl">
                  {isLogin ? "Welcome back" : "Create account"}
                </CardTitle>
                <CardDescription>
                  {isLogin
                    ? "Sign in to encode and decode hidden messages"
                    : "Register to start hiding messages in images"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  key={location.pathname}
                >
                  <Outlet />
                  <motion.p
                    variants={itemVariants}
                    className="mt-6 text-center text-sm text-muted-foreground"
                  >
                    {isLogin ? (
                      <>
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-emerald-400 hover:underline">
                          Register
                        </Link>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <Link to="/login" className="text-emerald-400 hover:underline">
                          Sign in
                        </Link>
                      </>
                    )}
                  </motion.p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

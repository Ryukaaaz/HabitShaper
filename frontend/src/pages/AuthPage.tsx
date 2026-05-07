import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)

  // login state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // register state
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      })

      localStorage.setItem("token", response.data.token)

      navigate("/dashboard")
    } catch (error) {
      alert("Login failed")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await api.post("/auth/register", {
        email: registerEmail,
        password: registerPassword,
      })

      alert("Register success")

      setIsLogin(true)
    } catch (error) {
      alert("Register failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* background blur */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden">

          {/* logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white font-bold">
                HS
              </span>
            </div>
          </div>

          {/* title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Habit Shaper
            </h1>

            <p className="text-slate-300 mt-1 text-sm">
              Build consistency and shape your future
            </p>
          </div>

          {/* animated form */}
          <div className="relative min-h-[320px]">

            <AnimatePresence mode="wait">

              {isLogin ? (

                <motion.div
                  key="login"
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 80, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >

                  <form onSubmit={handleLogin} className="space-y-5">

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Email
                      </label>

                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Password
                      </label>

                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition text-white py-3.5 rounded-2xl font-semibold shadow-lg"
                    >
                      Login
                    </button>

                  </form>

                </motion.div>

              ) : (

                <motion.div
                  key="register"
                  initial={{ x: 80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -80, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >

                  <form onSubmit={handleRegister} className="space-y-5">

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Email
                      </label>

                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Password
                      </label>

                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder:text-slate-400 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 transition text-white py-3.5 rounded-2xl font-semibold shadow-lg"
                    >
                      Register
                    </button>

                  </form>

                </motion.div>

              )}

            </AnimatePresence>

          </div>

          {/* switch */}
          <div className="mt-1 flex items-center justify-center gap-2 text-sm">

            <span className="text-slate-400">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 transition font-medium hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>

          </div>

        </div>
      </div>
    </div>
  )
}
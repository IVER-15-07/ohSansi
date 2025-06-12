import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../../assets/logo.png"
import { cn } from "../../utils/cn"
import { Input, Button } from "../ui"
import { loginAdmin } from "../../../service/auth.api"

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await loginAdmin(username, password)
      if (res.success) {
        // Aquí podrías guardar token si lo implementas
        navigate("/AdminLayout/Olimpiadas")
      } else {
        setError(res.message || "Usuario o contraseña incorrectos")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-secondary-50">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-40 h-40 mb-2 object-contain" />
          <h2 className="text-2xl font-bold text-blue-900">Iniciar Sesión</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Usuario"
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Ingrese su usuario"
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Ingrese su contraseña"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => navigate("/")} >
            ← Volver al inicio
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login

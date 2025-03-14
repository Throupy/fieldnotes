import { useState } from 'react'
import { useAuth } from './AuthContext'

const Login = () => {
  const { login, register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("User submitted with isRegsiter value: ", isRegister)
    const success = isRegister
      ? await register(username, password)
      : await login(username, password)

    if (!success) setError("Authentication Failed")
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold">{isRegister ? "Register" : "Login"}</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-blue-500 text-white p-2 rounded">{isRegister ? "Register" : "Login"}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 mt-2">
          {isRegister ? "Already have an account? Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
}

export default Login
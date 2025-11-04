import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthCtx = createContext(null)
export function useAuth(){ return useContext(AuthCtx) }

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  async function login(email){
    try {
      const res = await api.login(email)
      if (res.success) {
        setUser({ name: 'User', role: 'USER', email: res.email })
        return true
      }
    } catch (e) {
      console.error('Login failed:', e)
    }
    return false
  }

  function logout(){
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}



import {
    createContext, useContext, useEffect, useState,
} from "react"

import { apiRequest } from "@/services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            if(!localStorage.getItem("access_token")) {
                setLoading(false)
                return
            }
            try{
                const currentUser = await apiRequest("/me")
                setUser(currentUser)
            }catch{
                localStorage.removeItem("access_token")
                setUser(null)
            }finally{
                setLoading(false)
            }
            
        }
        loadUser()
    }, [])

    async function refreshUser() {
        const currentUser = await apiRequest("/me")
        setUser(currentUser)
        return currentUser
    }

    function logout(){
        localStorage.removeItem("access_token")
        setUser(null)
    }

    return(
        <AuthContext.Provider value={{user, setUser, loading, logout, refreshUser}}>
        {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
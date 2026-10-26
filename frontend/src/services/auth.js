// import baseUrl from './api'
import { apiRequest } from "./api"

const baseUrl = "http://localhost:8000"

export default async function login(email, password){
    const formData = new URLSearchParams()
    formData.append("username",email)
    formData.append("password",password)

        const response = await fetch (`${baseUrl}/login`, {
            method:'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData 
        });

        const data = await response.json().catch(()=>({}))

        if (!response.ok){
            throw new Error(data.detail|| "Login Failed")
        }

        localStorage.setItem("access_token",data.access_token)

        // const data = await response.json();
        // console.log(data)
        return data
    }
    // catch (error) {
    //     console.error("Authentication error:", error.message);
    //     throw error;
    // }

export async function register(name, email, password, requested_role) {
    return apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({name, email, password, requested_role})
    })
}
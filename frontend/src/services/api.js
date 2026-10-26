const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("access_token")
    const headers = {
        ...(options.body instanceof FormData ? {} : options.body ? {"Content-Type" : "application/json"} : {}),
        ...options.headers
    }
    if (token){
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options, headers,
    })

    if(!response.ok){
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || "Something went wrong")
    }

    if(response.status == 204) return null

    return response.json()
    
}

export{BASE_URL}
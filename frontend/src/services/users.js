import { apiRequest } from "./api";

export function getUsers() {
    return apiRequest("/get/users");
}

export function getPendingUsers() {
    return apiRequest("/users/pending");
}

export function approveUser(userId, role) {
    return apiRequest(`/users/approve/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
    });
}

export function rejectUser(userId) {
    return apiRequest(`/users/reject/${userId}`, {
        method: "PATCH",
    });
}

export function updateUserRole(userId, role) {
    return apiRequest(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
    });
}
import { apiRequest } from "./api";

export function getMyDocuments() {
    return apiRequest("/my-documents");
}

export function getDocument(document_id){
    return apiRequest(`/document/${document_id}`)
}

export function createDocument(templateVersionId, payload) {
    return apiRequest(`/document/${templateVersionId}`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function updateDocument(documentId, payload) {
    return apiRequest(`/document/update/${documentId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export function submitDocument(documentId) {
    return apiRequest(`/documents/submit/${documentId}`, {
        method: "PATCH",
    });
}
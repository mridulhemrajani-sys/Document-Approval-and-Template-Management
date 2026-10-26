import { apiRequest } from "./api";

export function getReviewQueue() {
  return apiRequest("/review");
}

export function getReviewDocument(documentId) {
  return apiRequest(`/review/${documentId}`);
}

export function requestDocumentChanges(documentId) {
  return apiRequest(`/review/change/${documentId}`, {
    method: "PATCH",
  });
}

export function approveDocument(documentId) {
  return apiRequest(`/review/approve/${documentId}`, {
    method: "PATCH",
  });
}

export function rejectDocument(documentId) {
  return apiRequest(`/review/reject/${documentId}`, {
    method: "PATCH",
  });
}
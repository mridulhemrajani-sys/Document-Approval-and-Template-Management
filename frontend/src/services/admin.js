import { apiRequest } from "./api";

export function getSubmittedDocuments() {
  return apiRequest("/documents/submitted");
}

export function assignDocument(documentId, reviewerId) {
  return apiRequest(`/documents/assign/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({
      reviewer_id: Number(reviewerId),
    }),
  });
}

export function getReviewers() {
  return apiRequest("/reviewers");
}
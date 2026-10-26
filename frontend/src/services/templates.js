import { apiRequest } from "./api";

export function getTemplates() {
  return apiRequest("/templates");
}

export function getLatestTemplate(templateId) {
  return apiRequest(`/template/latest/${templateId}`);
}

export function getTemplateVersionById(versionId) {
  return apiRequest(`/template/version/${versionId}`);
}

export function getTemplateVersions(templateId) {
  return apiRequest(`/template/versions/${templateId}`);
}

export function createTemplate(payload) {
  return apiRequest("/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function archiveTemplate(templateId) {
  return apiRequest(`/template/archive/${templateId}`, {
    method: "PATCH",
  });
}

export function createTemplateVersion(templateId, payload) {
  return apiRequest(`/template/${templateId}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

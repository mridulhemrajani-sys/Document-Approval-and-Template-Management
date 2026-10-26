import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import RoleRedirect from "./components/layout/RoleRedirect";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RoleDashboard from "./pages/RoleDashboard";
import AppLayout from "./components/layout/AppLayout";
import CreateDocument from "./pages/author/CreateDocument";
import MyDocuments from "./pages/author/MyDocuments";
import DocumentDetails from "./pages/author/DocumentDetails";
import EditDocument from "./pages/author/EditDocument";
import ReviewQueue from "./pages/reviewer/ReviewQueue";
import ReviewDocument from "./pages/reviewer/ReviewDocument";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminTemplates from "./pages/admin/AdminTemplates";
import CreateTemplate from "./pages/admin/CreateTemplate";
import TemplateVersions from "./pages/admin/TemplateVersions";
import CreateTemplateVersion from "./pages/admin/CreateTemplateVersions";
import TemplateVersionDetails from "./pages/admin/TemplateVersionDetails";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<RoleRedirect />} />

              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<RoleDashboard />} />
                <Route path="/admin/documents" element={<AdminDocuments />}/>
                <Route path="/admin/templates" element={<AdminTemplates />}/>
                <Route path="/admin/templates/new" element={<CreateTemplate />}/>
                <Route path="/admin/templates/:templateId/versions" element={<TemplateVersions />}/>
                <Route path="/admin/templates/:templateId/versions/new" element={<CreateTemplateVersion />}/>
                <Route path="/admin/templates/:templateId/versions/:versionId" element={<TemplateVersionDetails />}/>
                <Route path="/admin/users" element={<AdminUsers />}/>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["author"]} />}>
                <Route path="/author" element={<RoleDashboard />} />
                <Route path="/author/create" element={<CreateDocument/>}/>
                <Route path = "/author/documents" element={<MyDocuments/>}/>
                <Route path = "/author/documents/:documentId" element={<DocumentDetails />}/>
                <Route path = "/author/documents/:documentId/edit" element={<EditDocument />}/>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["reviewer"]} />}>
                <Route path="/reviewer" element={<RoleDashboard />} />
                <Route path="/reviewer/queue" element={<ReviewQueue />} />
                <Route path="/reviewer/queue/:documentId" element={<ReviewDocument />} />
              </Route>
            </Route>
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
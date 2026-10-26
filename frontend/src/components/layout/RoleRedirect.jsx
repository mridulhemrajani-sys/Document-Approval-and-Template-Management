import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleRedirect() {
  const { user } = useAuth();

  const role = String(user?.role || "").toLowerCase();

  const destinations = {
    admin: "/admin",
    author: "/author",
    reviewer: "/reviewer",
  };

  return (
    <Navigate
      to={destinations[role] || "/login"}
      replace
    />
  );
}
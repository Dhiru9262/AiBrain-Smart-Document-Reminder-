import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ children }) {
  const { userEmail } = useUser();
  if (!userEmail) return <Navigate to="/" replace />;
  return children;
}

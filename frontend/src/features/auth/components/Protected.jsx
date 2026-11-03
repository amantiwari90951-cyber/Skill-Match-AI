import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

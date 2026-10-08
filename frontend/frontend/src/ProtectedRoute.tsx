import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${baseUrl}/api/validate`, {
          method: "GET",
          credentials: "include", // CRITICAL: Sends the HTTP-Only cookie
        });

        if (res.ok) {
          const data = await res.json();
          if (adminOnly && data.role !== "admin") {
            setIsAuthorized(false);
          } else {
            setIsAuthorized(true);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [adminOnly]);

  if (loading)
    return (
      <div className="h-screen bg-[#1a1e2e] flex items-center justify-center text-white uppercase tracking-widest animate-pulse">
        Verifying Credentials...
      </div>
    );

  if (!isAuthorized) return <Navigate to="/" replace />;

  return <>{children}</>;
};

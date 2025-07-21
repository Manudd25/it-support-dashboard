import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import AuthForm from "./AuthForm";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { currentUser, userRole, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const toggleAuth = () => setShowAuth(!showAuth);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex justify-between items-center mb-6 p-4 bg-white shadow">
      <h1 className="text-xl font-bold">IT Support Dashboard</h1>

      <div className="relative">
        {!currentUser ? (
          <>
            <button
              onClick={toggleAuth}
              aria-label="User login"
              className="text-3xl text-gray-700 hover:text-blue-600"
            >
              <FaUserCircle />
            </button>

            {showAuth && (
              <div className="absolute right-0 mt-2 w-80 bg-white p-4 rounded shadow-lg z-50">
                <AuthForm onSuccess={() => setShowAuth(false)} />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4 text-gray-700">
            <span className="font-medium">
              Welcome, {currentUser.email.split("@")[0]} ({userRole})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

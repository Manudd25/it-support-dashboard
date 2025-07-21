import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import SubmitTicket from "./pages/SubmitTicket";
import Tickets from "./pages/Tickets";
import Header from "./components/Header";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  const Dashboard = userRole === "admin" ? AdminDashboard : UserDashboard;

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-6">
        <Header />

        <nav className="flex gap-4 mb-6 px-4">
          <a href="/" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/submit" className="text-blue-600 hover:underline">Submit Ticket</a>
          <a href="/tickets" className="text-blue-600 hover:underline">All Tickets</a>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitTicket />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

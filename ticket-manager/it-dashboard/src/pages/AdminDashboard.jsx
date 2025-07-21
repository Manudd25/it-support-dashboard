import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  FaUsers,
  FaClipboardList,
  FaCheckCircle,
  FaHourglassHalf,
  FaTasks,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketSnap = await getDocs(collection(db, "tickets"));
        const userSnap = await getDocs(collection(db, "users"));

        const allTickets = ticketSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTickets(allTickets);
        setUsers(userSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    fetchData();
  }, []);

  if (userRole !== "admin") {
    return <Navigate to="/my-tickets" replace />;
  }

  // ⛳ Exclude 'done' tickets from dashboard view
  const activeTickets = tickets.filter((t) => t.status !== "done");

  const ticketStats = {
    total: activeTickets.length,
    open: activeTickets.filter((t) => t.status === "open").length,
    inProgress: activeTickets.filter((t) => t.status === "in progress").length,
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status: newStatus });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  const markAsDone = async (id) => {
    await handleStatusChange(id, "done");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaTasks className="text-blue-600" /> Admin Dashboard
      </h2>

      {/* 📊 Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FaClipboardList className="text-gray-600" />} label="Total Active Tickets" value={ticketStats.total} />
        <StatCard icon={<FaHourglassHalf className="text-yellow-600" />} label="Open" value={ticketStats.open} />
        <StatCard icon={<FaTasks className="text-blue-600" />} label="In Progress" value={ticketStats.inProgress} />
      </div>

      {/* 👥 Users Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaUsers className="text-purple-600" /> User Roles
        </h3>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 bg-white rounded shadow">
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>Role:</strong> {user.role || 'employee'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🎫 Ticket Manager */}
      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <FaClipboardList className="text-indigo-600" /> Manage Tickets
      </h3>
      {activeTickets.length === 0 ? (
        <p>No active tickets to show.</p>
      ) : (
        activeTickets.map((ticket) => (
          <div key={ticket.id} className="mb-4 p-4 bg-white rounded shadow">
            <h4 className="text-lg font-bold">{ticket.title || "Untitled Ticket"}</h4>
            <p>{ticket.description}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Status:</strong> {ticket.status}</p>

            <div className="mt-4 space-y-2">
              <select
                className="border p-2 rounded w-full"
                value={ticket.status}
                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              {ticket.status !== "done" && (
                <button
                  className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={() => markAsDone(ticket.id)}
                >
                  <FaCheckCircle />
                  Mark as Done
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="p-4 bg-white rounded shadow flex items-center gap-3">
      {icon}
      <div>
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  FaTasks,
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
} from "react-icons/fa";

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser?.email) return;

      try {
        const q = query(
          collection(db, "tickets"),
          where("createdBy", "==", currentUser.email.toLowerCase().trim())
        );
        const ticketSnap = await getDocs(q);
        const userTickets = ticketSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(userTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error.message);
      }
    };

    fetchTickets();
  }, [currentUser]);

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in progress").length,
    done: tickets.filter(t => t.status === "done").length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaTasks className="text-blue-600" /> My Tickets
      </h2>

      <p className="mb-6 text-gray-600">
        Welcome back! Here are the tickets you've submitted.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FaClipboardList className="text-gray-600" />} label="Total Tickets" value={ticketStats.total} />
        <StatCard icon={<FaHourglassHalf className="text-yellow-500" />} label="Open" value={ticketStats.open} />
        <StatCard icon={<FaCheckCircle className="text-green-500" />} label="Done" value={ticketStats.done} />
      </div>

      <h3 className="text-xl font-semibold mb-4">Your Ticket Activity</h3>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.id} className="mb-4 p-4 bg-white rounded shadow">
            <h4 className="text-lg font-bold">{ticket.title || "Untitled Ticket"}</h4>
            <p>{ticket.description}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
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

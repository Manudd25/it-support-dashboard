import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import {
  FaTasks,
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaTicketAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", priority: "Low" });
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser?.email) return;

      try {
        const q = userRole === "admin"
          ? collection(db, "tickets")
          : query(
              collection(db, "tickets"),
              where("createdBy", "==", currentUser.email.toLowerCase().trim())
            );

        const snap = await getDocs(q);
        const loadedTickets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTickets(loadedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error.message);
      }
    };

    fetchTickets();
  }, [currentUser, userRole]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "tickets", id), { status: newStatus });
      setTickets(prev =>
        prev.map(ticket => ticket.id === id ? { ...ticket, status: newStatus } : ticket)
      );
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };

  const markAsDone = async (id) => {
    await handleStatusChange(id, "done");
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "tickets", id));
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
    } catch (error) {
      console.error("Error deleting ticket:", error.message);
    }
  };

  const startEditing = (ticket) => {
    setEditingTicket(ticket.id);
    setEditForm({
      title: ticket.title || "",
      description: ticket.description || "",
      priority: ticket.priority || "Low",
    });
  };

  const handleEditChange = (e) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitEdit = async () => {
    try {
      await updateDoc(doc(db, "tickets", editingTicket), {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
      });
      setTickets(prev =>
        prev.map(t =>
          t.id === editingTicket ? { ...t, ...editForm } : t
        )
      );
      setEditingTicket(null);
    } catch (error) {
      console.error("Error updating ticket:", error.message);
    }
  };

  const ticketStats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in progress").length,
    done: tickets.filter(t => t.status === "done").length,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <FaTicketAlt className="text-blue-600" />
        {userRole === "admin" ? "All Tickets" : "My Tickets"}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FaClipboardList className="text-gray-600" />} label="Total" value={ticketStats.total} />
        <StatCard icon={<FaHourglassHalf className="text-yellow-500" />} label="Open" value={ticketStats.open} />
        <StatCard icon={<FaCheckCircle className="text-green-500" />} label="Done" value={ticketStats.done} />
      </div>

      {tickets.length === 0 ? (
        <p>No tickets to show.</p>
      ) : (
        tickets.map((ticket) => (
          <div key={ticket.id} className="mb-4 p-4 bg-white rounded shadow">
            {editingTicket === ticket.id ? (
              <>
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Title"
                />
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Description"
                />
                <select
                  name="priority"
                  value={editForm.priority}
                  onChange={handleEditChange}
                  className="w-full mb-2 p-2 border rounded"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={submitEdit}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingTicket(null)}
                    className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{ticket.title || "Untitled Ticket"}</h3>
                <p>{ticket.description}</p>
                <p><strong>Priority:</strong> {ticket.priority}</p>
                <p><strong>Status:</strong> {ticket.status}</p>

                {(userRole === "admin" || ticket.createdBy === currentUser.email) && (
                  <div className="mt-4 space-y-2">
                    {userRole === "admin" && (
                      <>
                        <label className="block text-sm font-medium">Update Status:</label>
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
                      </>
                    )}

                    {userRole === "employee" && ticket.createdBy === currentUser.email && (
                      <div className="flex gap-4 mt-2">
                        <button
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          onClick={() => startEditing(ticket)}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="flex items-center gap-2 text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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

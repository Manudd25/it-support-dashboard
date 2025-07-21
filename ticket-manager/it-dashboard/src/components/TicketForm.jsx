import { useState, useEffect } from "react";
import { FaSkullCrossbones, FaBug, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export default function TicketForm({ onSubmit, existing }) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    issue: "",
    priority: "Low",
  });

  useEffect(() => {
    if (existing) {
      setForm(existing);
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.issue) return alert("Please describe the issue");

    const ticketData = {
      issue: form.issue,
      priority: form.priority,
      createdBy: currentUser?.email, // ✅ email instead of uid
      status: "open",
      createdAt: new Date(),
    };

    onSubmit(ticketData);
    setForm({ issue: "", priority: "Low" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800">
        {existing ? "Edit Ticket" : "Submit a Support Ticket"}
      </h2>

      <textarea
        name="issue"
        value={form.issue}
        onChange={handleChange}
        placeholder="Describe the issue"
        className="w-full border p-2 rounded"
        rows={4}
      />

      <select
        name="priority"
        value={form.priority}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="Low">Low Priority</option>
        <option value="Medium">Medium Priority</option>
        <option value="High">High Priority</option>
      </select>

      <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
        {form.priority === "High" && (
          <>
            <FaSkullCrossbones className="text-red-600" />
            <span>High: Critical issue affecting work</span>
          </>
        )}
        {form.priority === "Medium" && (
          <>
            <FaExclamationTriangle className="text-yellow-500" />
            <span>Medium: Causing delays or slowness</span>
          </>
        )}
        {form.priority === "Low" && (
          <>
            <FaBug className="text-green-500" />
            <span>Low: Small bug or minor annoyance</span>
          </>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {existing ? "Update Ticket" : "Submit Ticket"}
      </button>
    </form>
  );
}

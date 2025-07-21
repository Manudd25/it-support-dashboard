import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

export default function SubmitTicket() {
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Low",
    status: "Open",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!currentUser?.email) return <p className="p-4">Loading user...</p>;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await addDoc(collection(db, "tickets"), {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        createdBy: currentUser.email.toLowerCase().trim(), // ✅ normalized
        createdAt: new Date(),
      });

      setForm({
        title: "",
        description: "",
        priority: "Low",
        status: "Open",
      });
      alert("Ticket submitted!");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Submit a New Ticket</h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the issue"
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}

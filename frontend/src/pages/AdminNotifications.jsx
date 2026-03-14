import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "broadcast",
    targetRole: "all",
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (error) {
      alert("Error deleting notification");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setNotifications([data, ...notifications]);
      setShowModal(false);
      setFormData({ title: "", message: "", type: "broadcast", targetRole: "all" });
    } catch (error) {
      alert("Error creating notification");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Notification Management</h1>
            <p className="text-gray-500 mt-1">Send and manage system-wide or individual notifications.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-black font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 w-fit"
          >
            <i className="ri-add-line text-xl"></i>
            Create Notification
          </button>
        </div>

        <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Notification</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Target</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <tr key={n._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{n.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{n.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      n.type === 'broadcast' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 uppercase text-xs">
                    {n.targetRole}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(n._id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                    >
                      <i className="ri-delete-bin-line text-lg"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {notifications.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">No notifications sent yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-all"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>

            <h2 className="text-2xl font-black text-gray-900 mb-6">Create Notification</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-widest">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Notification Header"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-widest">Message</label>
                <textarea
                  required
                  rows="4"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-widest">Type</label>
                  <select
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="broadcast">Broadcast</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 uppercase tracking-widest">Target Role</label>
                  <select
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  >
                    <option value="all">All</option>
                    <option value="student">Students</option>
                    <option value="driver">Drivers</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-black font-black py-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4"
              >
                Publish Notification
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;

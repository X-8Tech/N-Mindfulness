import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('branches/');
      setBranches(res.data);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await api.put(`branches/${editingBranch.id}/`, formData);
      } else {
        await api.post('branches/', formData);
      }
      setFormData({ name: '', location: '' });
      setEditingBranch(null);
      setShowModal(false);
      fetchBranches();
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`branches/${id}/`);
        fetchBranches();
      } catch (err) {
        handleAuthError(err);
      }
    }
  };

  const handleAuthError = (err) => {
    console.error('Error:', err);
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  const filteredBranches = useMemo(() => {
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, branches]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-semibold text-gray-700">Branches</h1>
        <button
          onClick={() => {
            setEditingBranch(null);
            setFormData({ name: '', location: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FaPlus /> Add Branch
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
        placeholder="Search by name or location..."
      />

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{b.name}</td>
                <td className="px-4 py-2">{b.location}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBranch(b);
                      setFormData({ name: b.name, location: b.location });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-red-600 hover:underline"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingBranch ? 'Edit Branch' : 'Add Branch'}
            </h2>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Branch Name"
              className="w-full mb-4 border p-2 rounded"
              required
            />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Location"
              className="w-full mb-4 border p-2 rounded"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Branches;

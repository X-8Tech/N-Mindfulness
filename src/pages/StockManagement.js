// src/pages/StockManagement.js
import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import StockInModal from '../components/StockInModal';
import StockOutModal from '../components/StockOutModal';

const StockManagement = () => {
  const role = localStorage.getItem('role');
  const userBranchId = localStorage.getItem('branch_id');

  const [branches, setBranches] = useState([]);
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(role === 'admin' ? '' : userBranchId);
  const [search, setSearch] = useState('');

  // Modals control
  const [showStockIn, setShowStockIn] = useState(false);
  const [showStockOut, setShowStockOut] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    // Fetch branches and items on mount
    fetchBranches();
    fetchItems();
  }, []);

  useEffect(() => {
    if (selectedBranchId) fetchInventory(selectedBranchId);
  }, [selectedBranchId]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('branches/');
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get('items/');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const fetchInventory = async (branchId) => {
    try {
      const res = await api.get(`inventory/?branch_id=${branchId}`);
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  // Filter inventory by item name search
  const filteredInventory = useMemo(() => {
    if (!search) return inventory;
    return inventory.filter(inv =>
      inv.item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, inventory]);

  // Handlers to open modals
  const handleOpenStockIn = (item) => {
    if (role !== 'admin') return; // Only admin can stock in
    setCurrentItem(item);
    setShowStockIn(true);
  };

  const handleOpenStockOut = (item) => {
    if (!selectedBranchId) return;
    setCurrentItem(item);
    setShowStockOut(true);
  };

  // After stock in or out success, refresh inventory
  const refreshInventory = () => {
    if (selectedBranchId) fetchInventory(selectedBranchId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Stock Management</h1>

      {/* Branch selector only for admin */}
      {role === 'admin' && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Branch</label>
          <select
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-xs"
          >
            <option value="">-- Select Branch --</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} - {b.location}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-2 border rounded w-full max-w-md"
      />

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Item</th>
              <th className="p-3">Stock Balance</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-500">
                  No stock found
                </td>
              </tr>
            )}
            {filteredInventory.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{inv.item.name}</td>
                <td className="p-3">{inv.quantity}</td>
                <td className="p-3 flex gap-4">
                  {role === 'admin' && (
                    <button
                      onClick={() => handleOpenStockIn(inv.item)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Stock In
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenStockOut(inv.item)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Stock Out
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showStockIn && currentItem && (
        <StockInModal
          item={currentItem}
          branches={branches}
          onClose={() => setShowStockIn(false)}
          onSuccess={() => {
            setShowStockIn(false);
            refreshInventory();
          }}
        />
      )}

      {showStockOut && currentItem && (
        <StockOutModal
          item={currentItem}
          branches={branches}
          currentBranchId={selectedBranchId}
          onClose={() => setShowStockOut(false)}
          onSuccess={() => {
            setShowStockOut(false);
            refreshInventory();
          }}
        />
      )}
    </div>
  );
};

export default StockManagement;

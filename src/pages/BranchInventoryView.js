import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const BranchInventoryView = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const location = useLocation();
  const branchQueryId = new URLSearchParams(location.search).get('branch_id') || localStorage.getItem('branch_id');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const url = branchQueryId ? `inventory/?branch_id=${branchQueryId}` : 'inventory/';
        const response = await api.get(url);
        setItems(response.data);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      }
    };

    fetchInventory();
  }, [branchQueryId]);

  const filteredItems = useMemo(() => {
    return items.filter((inv) =>
      inv.item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">Inventory (Read-Only)</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
        placeholder="Search by item name..."
      />

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Item Name</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Price (KES)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{inv.item.name}</td>
                <td className="px-4 py-2">{inv.quantity}</td>
                <td className="px-4 py-2">KES {Number(inv.item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded border text-sm font-medium ${
              page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BranchInventoryView;

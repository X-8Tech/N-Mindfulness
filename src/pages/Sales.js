import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const location = useLocation();
  const branchQueryId = new URLSearchParams(location.search).get('branch_id') || localStorage.getItem('branch_id');

  const fetchSales = useCallback(async () => {
    try {
      const url = branchQueryId ? `sales/?branch_id=${branchQueryId}` : 'sales/';
      const response = await api.get(url);
      // Sort by newest first
      setSales(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  }, [branchQueryId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const filteredSales = useMemo(() => {
    return sales.filter(
      (sale) =>
        sale.item.name.toLowerCase().includes(search.toLowerCase()) ||
        sale.branch.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sales]);

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-semibold text-gray-700">Sales</h1>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
        placeholder="Search by item or branch..."
      />

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Branch</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Total (KES)</th>
              <th className="px-4 py-2">Payment Method</th> {/* ✅ Added */}
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((sale) => (
              <tr key={sale.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{sale.item.name}</td>
                <td className="px-4 py-2">{sale.branch.name}</td>
                <td className="px-4 py-2">{sale.quantity}</td>
                <td className="px-4 py-2">KES {Number(sale.total_amount).toLocaleString()}</td>
                <td className="px-4 py-2">{sale.payment_method || '—'}</td> {/* ✅ Added */}
                <td className="px-4 py-2">{new Date(sale.timestamp).toLocaleString()}</td>
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
              page === currentPage ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sales;

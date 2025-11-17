// src/pages/Sales.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const location = useLocation();
  const branchQueryId =
    new URLSearchParams(location.search).get('branch_id') ||
    localStorage.getItem('branch_id');

  const fetchSales = useCallback(async () => {
    try {
      const url = branchQueryId ? `sales/?branch_id=${branchQueryId}` : 'sales/';
      const response = await api.get(url);

      // Sort newest first
      setSales(
        response.data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )
      );
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    }
  }, [branchQueryId]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Search filter
  const filteredSales = useMemo(() => {
    return sales.filter(
      (sale) =>
        sale.item.name.toLowerCase().includes(search.toLowerCase()) ||
        sale.branch.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sales]);

  // Pagination logic
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  // Compact pagination with ellipses
  const renderPagination = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 2);
      let end = Math.min(totalPages - 1, currentPage + 2);

      if (start > 2) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }

    return pages.map((page, idx) => (
      <button
        key={idx}
        disabled={page === '...'}
        onClick={() => page !== '...' && setCurrentPage(page)}
        className={`px-3 py-1 rounded border text-sm font-medium ${
          page === currentPage
            ? 'bg-green-600 text-white'
            : page === '...'
            ? 'cursor-default text-gray-500'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-semibold text-gray-700">Sales</h1>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1); // Reset when searching
        }}
        className="mb-4 w-full p-2 border rounded"
        placeholder="Search by item or branch..."
      />

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Item</th>
              <th className="px-4 py-2">Branch</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Total (KES)</th>
              <th className="px-4 py-2">Payment Method</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((sale) => (
              <tr key={sale.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{sale.item.name}</td>
                <td className="px-4 py-2">{sale.branch.name}</td>
                <td className="px-4 py-2">{sale.quantity}</td>
                <td className="px-4 py-2">
                  KES {Number(sale.total_amount).toLocaleString()}
                </td>
                <td className="px-4 py-2">{sale.payment_method || '—'}</td>
                <td className="px-4 py-2">
                  {new Date(sale.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">{renderPagination()}</div>
      )}
    </div>
  );
};

export default Sales;

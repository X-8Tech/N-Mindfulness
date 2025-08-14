import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const LOW_STOCK_THRESHOLD = 5;

const LowStock = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api.get('inventory/')
      .then(res => {
        const lowStockItems = res.data.filter(
          inv => inv.quantity <= LOW_STOCK_THRESHOLD
        );
        setInventory(lowStockItems);
      })
      .catch(err => console.error('Error fetching low stock:', err));
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-700">Low Stock Items</h1>
      <div className="bg-white rounded-2xl shadow p-4">
        {inventory.length === 0 ? (
          <p className="text-gray-500 italic">No low stock items 🎉</p>
        ) : (
          <table className="min-w-full text-sm table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-2 text-left">Item Name</th>
                <th className="p-2 text-left">Branch</th>
                <th className="p-2 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((inv, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-2">{inv.item.name}</td>
                  <td className="p-2">{inv.branch.name}</td>
                  <td className="p-2 text-red-600 font-bold">{inv.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LowStock;

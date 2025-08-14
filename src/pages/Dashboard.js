import React, { useEffect, useState } from 'react';
import { FaBox, FaCashRegister, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
    fetchSales();
    fetchBranches();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('inventory/');
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await api.get('sales/');
      setSales(res.data);
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('branches/');
      setBranches(res.data);
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const today = dayjs().format('YYYY-MM-DD');
  const todaySales = sales.filter((s) => dayjs(s.timestamp).format('YYYY-MM-DD') === today);
  const totalSalesAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const lowStockCount = inventory.filter((item) => item.quantity <= 5).length;

  const branchStats = branches.map((branch) => {
    const stock = inventory
      .filter((i) => i.branch.id === branch.id)
      .reduce((sum, i) => sum + i.quantity, 0);
    const sold = todaySales
      .filter((s) => s.branch.id === branch.id)
      .reduce((sum, s) => sum + s.quantity, 0);
    return {
      id: branch.id,
      name: branch.name,
      location: branch.location,
      stock,
      sold,
    };
  });

  const summaryCards = [
    {
      title: 'Total Stock',
      value: `${totalStock.toLocaleString()} Items`,
      icon: <FaBox className="text-blue-600 text-2xl" />,
    },
    {
      title: "Today's Sales",
      value: `KES ${totalSalesAmount.toLocaleString()}`,
      icon: <FaCashRegister className="text-green-600 text-2xl" />,
    },

    {
      title: 'Low Stock Alerts',
      value: (
        <button
          onClick={() => navigate('/low-stock')}
          className="text-red-600 hover:underline"
        >
          {lowStockCount} Items
        </button>
      ),
      icon: <FaExclamationTriangle className="text-red-600 text-2xl" />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-700">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 bg-white rounded-2xl shadow p-4"
          >
            {card.icon}
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="font-bold text-lg">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Table */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Branch Overview</h2>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-sm table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-2 text-left">Branch Name</th>
                <th className="p-2 text-left">Location</th>
                <th className="p-2 text-left">Items in Stock</th>
                <th className="p-2 text-left">Items Sold Today</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branchStats.map((b, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="p-2">{b.name}</td>
                  <td className="p-2">{b.location}</td>
                  <td className="p-2">{b.stock}</td>
                  <td className="p-2">{b.sold}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => navigate(`/inventory?branch_id=${b.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Inventory
                    </button>
                    <button
                      onClick={() => navigate(`/sales?branch_id=${b.id}`)}
                      className="text-green-600 hover:underline"
                    >
                      View Sales
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

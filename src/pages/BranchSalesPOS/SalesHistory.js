// src/pages/BranchSalesPOS/SalesHistory.jsx
import React from 'react';
import dayjs from 'dayjs';

export default function SalesHistory({ sales, loading }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Recent sales</h4>
      {loading && <div className="text-sm text-gray-500">Loading...</div>}
      {!loading && sales.length === 0 && (
        <div className="text-sm text-gray-500">No recent sales</div>
      )}
      <ul className="space-y-2 text-sm">
        {sales.map((s) => {
          // ✅ Prefer total_amount, otherwise calculate from price
          const price = s.total_amount
            ? Number(s.total_amount) / s.quantity
            : Number(s.price ?? s.item?.price ?? 0);

          return (
            <li key={s.id} className="flex justify-between">
              <div>
                <div className="font-medium">{s.item?.name || 'Unknown Item'}</div>
                <div className="text-xs text-gray-500">{s.branch?.name || 'Unknown Branch'}</div>
                <div className="text-xs text-gray-400">
                  Payment: {s.payment_method || 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div>
                  {s.quantity} × KES {price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {dayjs(s.timestamp).format('HH:mm')}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

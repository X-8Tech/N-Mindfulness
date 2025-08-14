// src/pages/BranchSalesPOS/Cart.jsx
import React from 'react';
import { FaTrash } from 'react-icons/fa';

export default function Cart({
  cart,
  changeQty,
  removeFromCart,
  subtotal,
  completeSale,
  loadingCartAction,
}) {
  return (
    <div>
      <h2 className="font-medium mb-3">Add items</h2>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Cart</h3>
        <div className="space-y-2">
          {cart.length === 0 && <div className="text-gray-500">Cart is empty — add items above</div>}
          {cart.map((c) => (
            <div key={c.itemId} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">KES {c.price.toLocaleString()}</div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={c.maxQty}
                  value={c.qty}
                  onChange={(e) => changeQty(c.itemId, e.target.value)}
                  className="w-20 p-1 border rounded text-center"
                />
                <div className="w-28 text-right">KES {(c.price * c.qty).toLocaleString()}</div>
                <button onClick={() => removeFromCart(c.itemId)} className="ml-2 text-red-600">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Subtotal</div>
          <div className="font-bold">KES {Number(subtotal).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={completeSale}
            disabled={loadingCartAction || cart.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loadingCartAction ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  );
}

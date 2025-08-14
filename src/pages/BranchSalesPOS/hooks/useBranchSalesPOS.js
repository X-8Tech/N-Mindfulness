// src/pages/BranchSalesPOS/hooks/useBranchSalesPOS.js
import { useState, useEffect, useMemo } from 'react';
import { fetchInventory, searchInventory } from '../utils/inventoryApi';
import { fetchSales as fetchSalesApi, postSales } from '../utils/salesApi';

export default function useBranchSalesPOS(branchId) {
  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [cart, setCart] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingCartAction, setLoadingCartAction] = useState(false);
  const [warning, setWarning] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // ✅ Payment method state
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const tax = 0;
  const total = subtotal + tax;

  useEffect(() => {
    (async () => {
      setLoadingSales(true);
      try {
        const sales = await fetchSalesApi(branchId);
        setSalesHistory(sales.slice(0, 8).reverse());

        const inv = await fetchInventory(branchId);
        // ✅ Store branch-specific price in state
        const mappedInv = inv.map((i) => ({
          inventoryId: i.id,
          itemId: i.item.id,
          name: i.item.name,
          price: parseFloat(i.price), // branch-specific price
          quantity: i.quantity,
        }));
        setInventory(mappedInv);
      } catch (err) {
        console.error('useBranchSalesPOS initial load', err);
      } finally {
        setLoadingSales(false);
      }
    })();
  }, [branchId]);

  const addToCart = (option) => {
    if (!option || !option.raw) return;
    const it = option.raw; // already has price from inventory
    setWarning(null);

    setCart((prev) => {
      const existing = prev.find((p) => p.itemId === it.itemId);
      if (existing) {
        if (existing.qty + 1 > it.quantity) {
          setWarning(`Only ${it.quantity} available for ${it.name}`);
          return prev;
        }
        return prev.map((p) =>
          p.itemId === it.itemId ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [
        ...prev,
        {
          itemId: it.itemId,
          name: it.name,
          price: it.price, // ✅ branch-specific
          qty: 1,
          maxQty: it.quantity,
        },
      ];
    });
  };

  const changeQty = (itemId, newQty) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.itemId !== itemId) return p;
        const qty = Math.max(1, Number(newQty) || 1);
        if (qty > p.maxQty) {
          setWarning(`Only ${p.maxQty} available for ${p.name}`);
          return p;
        }
        setWarning(null);
        return { ...p, qty };
      })
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((p) => p.itemId !== itemId));
  };

  const completeSale = async () => {
    if (!cart.length) {
      setWarning('Cart is empty');
      return;
    }

    setLoadingCartAction(true);
    setWarning(null);

    try {
      const payloads = cart.map((c) => ({
        item_id: c.itemId,
        branch_id: branchId ? parseInt(branchId) : null,
        quantity: parseInt(c.qty),
        payment_method: paymentMethod,
        price: c.price, // ✅ send branch-specific price to backend
      }));

      const fallbackBranch = localStorage.getItem('branch_id');
      payloads.forEach((p) => {
        if (!p.branch_id) {
          p.branch_id = fallbackBranch ? parseInt(fallbackBranch) : null;
        }
      });

      if (payloads.some((p) => !p.branch_id)) {
        throw new Error('branch_id missing. Cannot complete sale.');
      }

      const results = await postSales(payloads);

      const updatedInventory = [...inventory];
      results.forEach((r) => {
        const created = r.data;
        const idx = updatedInventory.findIndex(
          (inv) => inv.itemId === created.item.id
        );
        if (idx !== -1) {
          updatedInventory[idx] = {
            ...updatedInventory[idx],
            quantity: Math.max(
              0,
              updatedInventory[idx].quantity - created.quantity
            ),
          };
        }
      });
      setInventory(updatedInventory);

      setCart([]);
      setReceiptData({
        items: results.map((r) => r.data),
        total,
        paymentMethod,
      });
      setReceiptOpen(true);

      const newSales = await fetchSalesApi(branchId);
      setSalesHistory(newSales.slice(0, 8).reverse());
    } catch (err) {
      console.error('completeSale', err);
      const message = err.response?.data || err.message || 'Failed to complete sale';
      setWarning(
        typeof message === 'string' ? message : JSON.stringify(message)
      );
    } finally {
      setLoadingCartAction(false);
    }
  };

  const loadItemOptions = async (inputValue, callback) => {
    const q = (inputValue || '').trim();
    try {
      const res = await searchInventory(branchId, q);
      const opts = res
        .filter((inv) => inv.quantity > 0)
        .map((inv) => ({
          value: inv.item.id,
          label: `${inv.item.name} — KES ${Number(inv.price).toLocaleString()} (${inv.quantity} in stock)`,
          raw: {
            inventoryId: inv.id,
            itemId: inv.item.id,
            name: inv.item.name,
            price: parseFloat(inv.price), // ✅ branch-specific
            quantity: inv.quantity,
          },
        }));
      callback(opts);
    } catch (err) {
      const filtered = inventory
        .filter(
          (it) =>
            it.quantity > 0 &&
            it.name.toLowerCase().includes(q.toLowerCase())
        )
        .slice(0, 40)
        .map((it) => ({
          value: it.itemId,
          label: `${it.name} — KES ${Number(it.price).toLocaleString()} (${it.quantity} in stock)`,
          raw: it,
        }));
      callback(filtered);
    }
  };

  const lastSalesList = useMemo(() => salesHistory || [], [salesHistory]);

  return {
    cart,
    subtotal,
    total,
    warning,
    lastSalesList,
    loadingSales,
    loadingCartAction,
    receiptOpen,
    receiptData,
    paymentMethod,
    setPaymentMethod,
    setReceiptOpen,
    addToCart,
    changeQty,
    removeFromCart,
    completeSale,
    loadItemOptions,
  };
}

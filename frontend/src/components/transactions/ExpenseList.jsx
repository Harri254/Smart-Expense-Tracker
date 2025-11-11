import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ExpenseForm from './ExpenseForm';

export default function ExpensesPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/expenses');  // ← Fetches from backend
        if (!mounted) return;
        setExpenses(res.data?.data || []);  // ← Stores in state
      } catch (err) {
        console.error('Failed to load expenses:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [isAuthenticated, navigate]);

  const handleAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleDeleteSuccess = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Parse DB date/time and display in local timezone
  const formatDbDateToLocal = (raw) => {
    if (!raw) return '—';
    let normalized = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(normalized)) {
      normalized = normalized.replace(/\s+/, 'T');
    }
    const d = new Date(normalized);
    if (isNaN(d)) return raw;

    const datePart = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const timePart = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${datePart} · ${timePart}`;
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    setDeletingId(expenseId);
    try {
      const response = await api.delete(`/expenses/${expenseId}`);
      if (response.status === 200) handleDeleteSuccess(expenseId);
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert("Failed to delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading expenses…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">My Expenses</h1>

      {/* Expenses Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-bold mb-4">All Expenses</h2>
        
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition duration-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exp.description || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${Number(exp.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatDbDateToLocal(exp.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        className="text-red-500 hover:text-red-700 transition duration-150 disabled:opacity-50"
                      >
                        {deletingId === exp.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
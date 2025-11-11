import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/transactions/ExpenseForm';
import ExpenseList from '../components/transactions/ExpenseList';

export default function AddExpense() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const { isAuthenticated } = useAuth();

    // Form state
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // --- Data Fetching ---
    useEffect(() => {
        if (!isAuthenticated) {
            setError("You must be logged in to view expenses.");
            setLoading(false);
            return;
        }

        let mounted = true;
        const fetchData = async () => {
            try {
                setError(null);
                setLoading(true);

                const [expensesRes, categoriesRes] = await Promise.all([
                    api.get('/expenses'),
                    api.get('/categories')
                ]);

                if (mounted) {
                    setExpenses(expensesRes.data?.data || expensesRes.data || []);
                    setCategories(categoriesRes.data?.data || categoriesRes.data || []);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                if (mounted) setError("Failed to load expenses or categories.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, [isAuthenticated]);

    // --- Handlers ---
    const handleExpenseAdded = (newExpense) => {
        setExpenses(prev => [newExpense, ...prev]);
        setDescription("");
        setAmount("");
        setCategoryId("");
        setValidationErrors({});
    };

    const handleExpenseDeleted = (deletedId) => {
        setExpenses(prev => prev.filter(exp => exp.id !== deletedId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});
        setFormLoading(true);

        try {
            const localIso = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 19);

            const payload = {
                description: description || null,
                amount: parseFloat(amount),
                category_id: categoryId ? parseInt(categoryId, 10) : null,
                date: localIso,
            };

            const response = await api.post("/expenses", payload);

            if (response.status === 201) {
                const newExpense = response.data?.data || null;
                if (newExpense) handleExpenseAdded(newExpense);
            }
        } catch (err) {
            console.error("Expense save error:", err);
            if (err.response?.status === 422) {
                setValidationErrors(err.response.data.errors || {});
                setError("Please correct the form errors.");
            } else {
                setError(err.response?.data?.message || "An unexpected error occurred.");
            }
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        setDeletingId(expenseId);
        try {
            const response = await api.delete(`/expenses/${expenseId}`);
            if (response.status === 200) handleExpenseDeleted(expenseId);
        } catch (err) {
            console.error('Error deleting expense:', err);
            alert("Failed to delete expense. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    // --- Formatting ---
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

    const getCategoryColor = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.color || '#374151';
    };

    // --- UI ---
    if (loading) {
        return <p className="text-center mt-10">Loading expense data...</p>;
    }

    if (error && loading) {
        return <p className="p-4 bg-red-100 text-red-700 rounded mt-10">Error: {error}</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">Expense Management</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Add Expense Form */}
                <div className="md:col-span-1">
                    <ExpenseForm />
                </div>

                {/* Expenses Table */}
                <div className="md:col-span-2">
                    <ExpenseList/>
                </div>
            </div>
        </div>
    );
}
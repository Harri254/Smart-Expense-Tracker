import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ExpenseForm = ({ onExpenseAdded }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (mounted) setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        if (mounted) setDataLoading(false);
      }
    };
    fetchCategories();
    return () => { mounted = false; };
  }, [nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);
    window.location.reload();
    try {
      // Use local current date/time (ISO-like) when creating the expense
      const now = new Date();
      // Convert to local ISO without the trailing 'Z' so backend receives local datetime
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' '); // "YYYY-MM-DDTHH:mm:ss"
        console.log(localIso);

      const payload = {
        description: description || null,
        amount: parseFloat(amount),
        category_id: categoryId ? parseInt(categoryId, 10) : null,
        date: localIso,
      };

      const response = await api.post("/expenses", payload);

      if (response.status === 201) {
        const newExpense = response.data?.data || null;
        if (onExpenseAdded && newExpense) onExpenseAdded(newExpense);

        // reset form
        setDescription("");
        setAmount("");
        setCategoryId("");
      } else {
        setError("Failed to save expense. Please try again.");
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
      setLoading(false);
    }
  };

  if (dataLoading) {
    return <div>Loading categories…</div>;
  }

  return (
    <div>
        <h1 className="text-3xl font-bold mb-4">Add New Expense</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600">{error}</div>}

        <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
        />

        <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            type="number"
            step="0.01"
            className="w-full p-2 border rounded"
        />

        <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border rounded"
        >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
            <option key={c.id} value={c.id}>
                {c.category_name || c.name}
            </option>
            ))}
        </select>

        <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded w-[16rem] mx-auto block"
        >
            {loading ? "Saving…" : "Add Expense"}
        </button>
        </form>
    </div>
  );
};

export default ExpenseForm;
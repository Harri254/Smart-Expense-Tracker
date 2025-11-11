// src/components/CategoryManager.jsx

import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null); // Category object for the modal

    // Fetch categories on mount (similar to ExpenseForm)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                // Assuming response.data is the clean array based on your index method
                setCategories(response.data || []); 
            } catch (err) {
                setError("Failed to load categories.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // --- Handlers for CRUD Actions ---

    const handleCategoryUpdate = async (id, newName) => {
        try {
            const response = await api.put(`/categories/${id}`, { name: newName });
            
            // Update the local state with the new category data
            setCategories(prevCats => prevCats.map(cat => 
                cat.id === id ? response.data.data : cat // Use response.data.data if your update method wraps it
            ));
            setEditingCategory(null); // Close modal
            alert("Category updated!");

        } catch (err) {
            alert(err.response?.data?.message || "Failed to update category.");
        }
    };

    const handleCategoryDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        try {
            await api.delete(`/categories/${id}`);
            
            // Remove the category from local state
            setCategories(prevCats => prevCats.filter(cat => cat.id !== id));
            alert("Category deleted!");
            
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete category.");
        }
    };
    
    // --- UI Rendering ---

    if (loading) return <p>Loading category list...</p>;
    if (error) return <p className="text-red-600">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">Manage Categories</h3>
            
            <ul className="divide-y divide-gray-200">
                {categories.map(cat => (
                    <li key={cat.id} className="py-3 flex justify-between items-center">
                        <span className="text-gray-800 font-medium">{cat.name}</span>
                        <div>
                            <button 
                                onClick={() => setEditingCategory(cat)} 
                                className="text-blue-500 hover:text-blue-700 mr-3 text-sm"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleCategoryDelete(cat.id)} 
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Editing Modal (To be implemented below) */}
            {editingCategory && (
                <EditCategoryModal 
                    category={editingCategory} 
                    onSave={handleCategoryUpdate} 
                    onClose={() => setEditingCategory(null)}
                />
            )}
        </div>
    );
};
export default CategoryManager;
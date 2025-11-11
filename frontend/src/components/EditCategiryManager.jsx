// src/components/EditCategoryModal.jsx

import React, { useState } from 'react';

const EditCategoryModal = ({ category, onSave, onClose }) => {
    const [newName, setNewName] = useState(category.name);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newName.trim() && newName !== category.name) {
            onSave(category.id, newName);
        } else {
            onClose();
        }
    };

    return (
        // Simple fixed-overlay modal structure (Tailwind required for styling)
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
                <h4 className="text-lg font-bold mb-4">Edit Category: {category.name}</h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 border rounded">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategoryModal;
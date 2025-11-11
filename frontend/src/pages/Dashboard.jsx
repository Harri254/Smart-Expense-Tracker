import React, { useEffect, useState } from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import SpendingChart from '../components/dashboard/SpendingChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import SavingsTip from '../components/dashboard/SavingsTip';
import api from '../api/axios'; // ⬅️ Import the configured Axios instance

const Dashboard = () => {
    // State for data sections
    const [monthlyExpenses, setMonthlyExpenses] = useState([]); // Data for SpendingChart
    const [categoryExpenses, setCategoryExpenses] = useState([]); // Category breakdown data
    const [recentExpenses, setRecentExpenses] = useState([]); // Data for RecentTransactions
    
    // State for UI control
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!api.defaults.headers.common['Authorization']) {
                // Handle case where user is not logged in (e.g., redirect to login)
                setError("You must be logged in to view the dashboard.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                // 1. Define all concurrent API calls using Promise.all
                const [
                    monthlyRes,
                    categoryRes,
                    recentRes
                ] = await Promise.all([
                    api.get('/analytics/monthly-expenses'), // For SpendingChart
                    api.get('/analytics/category-expenses'), // For Chart breakdown
                    api.get('/analytics/recent-expenses') // For RecentTransactions
                ]);

                // 2. Update state with real data
                setMonthlyExpenses(monthlyRes.data);
                setCategoryExpenses(categoryRes.data);
                setRecentExpenses(recentRes.data);

            } catch (err) {
                console.error("Dashboard data fetch error:", err);
                
                if (err.response && err.response.status === 401) {
                    setError("Session expired or unauthorized. Please log in again.");
                } else {
                    setError("Failed to load dashboard data. Please try refreshing.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Runs once on component mount

    // --- Loading State UI ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh] space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="text-xl font-medium text-gray-600">Loading Dashboard Data...</p>
            </div>
        );
    }
    
    // --- Error State UI ---
    if (error) {
        return (
            <div className="p-8 bg-red-100 text-red-800 border border-red-400 rounded-lg shadow-lg max-w-lg mx-auto mt-10">
                <h2 className="text-xl font-bold mb-4">🚨 Error Loading Data</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {/* Summary Cards */}
            {/* Note: SummaryCards will need its own API call to a route like /analytics/summary or be passed calculated data */}
            <SummaryCards monthlyExpenses={monthlyExpenses} /> 

            {/* Chart and Transactions side by side on large screens */}
            <div className="flex flex-col lg:flex-row lg:space-x-6">
                {/* Chart on the left */}
                <div className="lg:w-2/3">
                    {/* Pass the data needed for charting */}
                    <SpendingChart 
                        monthlyData={monthlyExpenses} 
                        categoryData={categoryExpenses} 
                    />
                </div>

                {/* Latest Transactions on the right */}
                <div className="lg:w-1/3 mt-6 lg:mt-0">
                    {/* Pass the recent expenses data */}
                    <RecentTransactions transactions={recentExpenses} />
                </div>
            </div>

            {/* Savings Tip or other sections */}
            <SavingsTip />
        </div>
    );
};

export default Dashboard;
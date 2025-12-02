import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, Save, Info, AlertCircle } from 'lucide-react';

const BudgetPlanner = ({ transactions }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [userBudgets, setUserBudgets] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentMonthSpends, setCurrentMonthSpends] = useState({});

    useEffect(() => {
        fetchSavedBudgets();
        calculateCurrentMonthSpends();
    }, [transactions]);

    const calculateCurrentMonthSpends = () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const spends = {};

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear && t.amount < 0) {
                const cat = t.category || "Uncategorized";
                spends[cat] = (spends[cat] || 0) + Math.abs(t.amount);
            }
        });
        setCurrentMonthSpends(spends);
    };

    const fetchSavedBudgets = async () => {
        try {
            const response = await axios.get('/budget');
            const budgets = {};
            response.data.forEach(b => {
                budgets[b.category] = b.monthly_limit;
            });
            setUserBudgets(budgets);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    };

    const generateBudgets = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/budget/generate');
            setSuggestions(response.data);

            // Pre-fill user budgets if empty
            const newBudgets = { ...userBudgets };
            response.data.forEach(s => {
                if (!newBudgets[s.category]) {
                    newBudgets[s.category] = s.suggested_limit;
                }
            });
            setUserBudgets(newBudgets);
        } catch (error) {
            console.error("Error generating budgets:", error);
            alert("Failed to generate budget suggestions.");
        } finally {
            setLoading(false);
        }
    };

    const handleBudgetChange = (category, value) => {
        setUserBudgets(prev => ({
            ...prev,
            [category]: parseFloat(value) || 0
        }));
    };

    const saveBudgets = async () => {
        setSaving(true);
        try {
            const promises = Object.entries(userBudgets).map(([category, limit]) =>
                axios.post('/budget', { category, monthly_limit: limit })
            );
            await Promise.all(promises);
            alert("Budgets saved successfully!");
        } catch (error) {
            console.error("Error saving budgets:", error);
            alert("Failed to save budgets.");
        } finally {
            setSaving(false);
        }
    };

    const getProgressBarColor = (spent, limit) => {
        if (!limit) return 'bg-gray-200';
        const percentage = (spent / limit) * 100;
        if (percentage > 100) return 'bg-red-500';
        if (percentage > 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-purple-500" />
                    Smart Budget Planner
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={generateBudgets}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2"
                    >
                        {loading ? "Crunching numbers..." : "Analyze & Generate"}
                    </button>
                    <button
                        onClick={saveBudgets}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Plan"}
                    </button>
                </div>
            </div>

            {suggestions.length === 0 && Object.keys(userBudgets).length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p>Click "Analyze & Generate" to get AI-powered budget suggestions based on your spending history.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3 text-right">6-Mo Avg</th>
                                <th className="px-4 py-3 text-right">AI Suggestion</th>
                                <th className="px-4 py-3 text-right w-32">Your Budget</th>
                                <th className="px-4 py-3 w-1/3">Status (Current Month)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(suggestions.length > 0 ? suggestions : Object.keys(userBudgets).map(cat => ({ category: cat }))).map((item, idx) => {
                                const category = item.category;
                                const suggestion = suggestions.find(s => s.category === category);
                                const budget = userBudgets[category] || 0;
                                const spent = currentMonthSpends[category] || 0;
                                const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

                                return (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{category}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">
                                            {suggestion ? `$${suggestion.historical_avg.toFixed(0)}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {suggestion ? (
                                                <div className="flex items-center justify-end gap-2 group relative">
                                                    <span className="font-medium text-purple-600">${suggestion.suggested_limit.toFixed(0)}</span>
                                                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                        {suggestion.reasoning}
                                                    </div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                <input
                                                    type="number"
                                                    value={userBudgets[category] || ''}
                                                    onChange={(e) => handleBudgetChange(category, e.target.value)}
                                                    className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>${spent.toFixed(0)} spent</span>
                                                    <span>{percentage.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(spent, budget)}`}
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BudgetPlanner;

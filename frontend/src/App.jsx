import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Calculator } from 'lucide-react';
import Dashboard from './components/Dashboard';
import BudgetPlanner from './components/BudgetPlanner';

// Configure axios base URL for development
// In production, this would be handled by Nginx or similar
axios.defaults.baseURL = 'http://localhost:8000';

function AppContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [llmMode, setLlmMode] = useState("LOADING...");
  const location = useLocation();

  // Filter State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = [
    "Food", "Transport", "Utilities", "Salary", "Entertainment", "Shopping", "Health", "Other"
  ];

  useEffect(() => {
    fetchConfig();
    fetchTransactions();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get('/config');
      setLlmMode(response.data.llm_type);
    } catch (error) {
      console.error("Error fetching config:", error);
      setLlmMode("UNKNOWN");
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (vendorFilter) params.vendor = vendorFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await axios.get('/transactions', { params });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchTransactions();
  };

  const handleApplyFilters = () => {
    fetchTransactions();
  };

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to delete ALL transactions? This action cannot be undone.")) {
      try {
        await axios.delete('/transactions');
        fetchTransactions();
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("Failed to clear data.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                FinTrackAI
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/budget"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/budget'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                Budget Planner
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
              Running on: <span className="text-blue-600">{llmMode}</span>
            </div>
            <button
              onClick={handleClearData}
              className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-full text-xs font-medium border border-red-200 transition-colors"
              title="Clear All Data"
            >
              Clear Data
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={
            <Dashboard
              transactions={transactions}
              loading={loading}
              fetchTransactions={fetchTransactions}
              handleUploadSuccess={handleUploadSuccess}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              vendorFilter={vendorFilter}
              setVendorFilter={setVendorFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              handleApplyFilters={handleApplyFilters}
            />
          } />
          <Route path="/budget" element={
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Budget Planner</h2>
                <p className="text-gray-500">Plan your monthly spending and track your progress.</p>
              </div>
              <BudgetPlanner transactions={transactions} />
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

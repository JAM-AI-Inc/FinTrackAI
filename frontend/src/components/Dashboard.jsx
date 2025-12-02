import React from 'react';
import { Upload, CreditCard, RefreshCw, MessageSquare } from 'lucide-react';
import FileUpload from './FileUpload';
import TransactionTable from './TransactionTable';
import ChatInterface from './ChatInterface';
import CategoryManager from './CategoryManager';
import TransferReview from './TransferReview';

const Dashboard = ({
    transactions,
    loading,
    fetchTransactions,
    handleUploadSuccess,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    vendorFilter,
    setVendorFilter,
    categoryFilter,
    setCategoryFilter,
    categories,
    handleApplyFilters
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Upload & Transactions */}
            <div className="lg:col-span-2 space-y-8">

                {/* Upload Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                        Import Data
                    </h2>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                </section>

                {/* Transactions Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-500" />
                            Recent Transactions
                        </h2>
                        <button
                            onClick={fetchTransactions}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                            <input
                                type="date"
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                            <input
                                type="date"
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Vendor</label>
                            <input
                                type="text"
                                placeholder="e.g. Uber"
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={vendorFilter}
                                onChange={(e) => setVendorFilter(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                            <select
                                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleApplyFilters}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>

                    <TransactionTable transactions={transactions} loading={loading} />
                </section>
            </div>

            {/* Right Column: Chat & Insights */}
            <div className="lg:col-span-1 space-y-8">
                <section className="sticky top-24">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        AI Assistant
                    </h2>
                    <ChatInterface />

                    <div className="mt-8">
                        <CategoryManager />
                    </div>

                    <div className="mt-8">
                        <TransferReview />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;

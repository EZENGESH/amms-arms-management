import { NavLink } from 'react-router-dom';
import { useState } from 'react';

// SVG Icons for each menu item
const DashboardIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const InventoryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const AddFirearmIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const RequisitionIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const RequisitionListIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Helper for consistent styling
    const linkClass = ({ isActive }) =>
        `flex items-center p-3 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive
            ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isCollapsed ? 'justify-center' : ''}`;

    return (
        <aside className={`bg-white h-full flex flex-col border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                {!isCollapsed && (
                    <h2 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        AMMS
                    </h2>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isCollapsed ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <NavLink
                    to="/dashboard"
                    className={linkClass}
                    aria-label="Go to Dashboard"
                >
                    <DashboardIcon />
                    {!isCollapsed && <span className="ml-3">Dashboard</span>}
                </NavLink>

                <NavLink
                    to="/inventory"
                    className={linkClass}
                    aria-label="Go to Inventory"
                >
                    <InventoryIcon />
                    {!isCollapsed && <span className="ml-3">Inventory</span>}
                </NavLink>

                <NavLink
                    to="/logfirearm"
                    className={linkClass}
                    aria-label="Add new firearm"
                >
                    <AddFirearmIcon />
                    {!isCollapsed && <span className="ml-3">Add Firearm</span>}
                </NavLink>

                <NavLink
                    to="/requisitions"
                    className={linkClass}
                    aria-label="Submit requisition"
                >
                    <RequisitionIcon />
                    {!isCollapsed && <span className="ml-3">Submit Requisition</span>}
                </NavLink>

                <NavLink
                    to="/requisitionslist"
                    className={linkClass}
                    aria-label="View requisition list"
                >
                    <RequisitionListIcon />
                    {!isCollapsed && <span className="ml-3">Requisition List</span>}
                </NavLink>
            </nav>

            {/* Sidebar Footer */}
            {!isCollapsed && (
                <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
                    <p>AMMS v1.0</p>
                    <p className="mt-1">© 2023 Arms Management System</p>
                </div>
            )}
        </aside>
    );
}
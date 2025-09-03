import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    // Helper for consistent styling
    const linkClass = "block p-2 hover:bg-gray-200 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <aside className="bg-gray-100 w-64 h-full p-4 border-r" aria-label="Sidebar">
            <ul className="space-y-2">
                <li>
                    <NavLink to="/dashboard" className={linkClass} aria-label="Go to Dashboard">
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/inventory" className={linkClass} aria-label="Go to Inventory">
                        Inventory
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/logfirearm" className={linkClass} aria-label="Go to add firearms">
                        Add Firearm
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/requisitions" className={linkClass} aria-label="Go to Requisitions">
                        Submit Requisition
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/requisitionlist" className={linkClass} aria-label="Go to Requisition List">
                        Requisition List
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
}
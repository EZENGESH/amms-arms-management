export default function Sidebar() {
    return (
        <aside className="bg-gray-100 w-64 h-full p-4 border-r" aria-label="Sidebar">
            <ul className="space-y-2">
                <li>
                    <a 
                        href="/dashboard" 
                        className="block p-2 hover:bg-gray-200 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Go to Dashboard"
                    >
                        Dashboard
                    </a>
                </li>
                <li>
                    <a 
                        href="/inventory" 
                        className="block p-2 hover:bg-gray-200 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Go to Inventory"
                    >
                        Inventory
                    </a>
                </li>
                <li>
                    <a 
                        href="/requisitions" 
                        className="block p-2 hover:bg-gray-200 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Go to Requisitions"
                    >
                        Requisitions
                    </a>
                </li>
                <li>
                    <a href="/logfirearm">
                      <div className="flex justify-between mb-4">
                        <h1 className="text-2xl font-bold">Firearms Inventory</h1>
                      
                </div>
                   </a>
                </li>
                
            </ul>
        </aside>
    );
}
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
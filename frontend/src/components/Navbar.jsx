import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold">AMMS</h1>
     
      <nav>
        {user ? (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={logout} className="text-red-600 hover:underline">
              Logout
            </button>
          </>
        ) : (
          <span>logout</span>
        )}
      </nav>
    </header>
  );
}
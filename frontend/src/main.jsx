import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import './styles/index.css';

const routes = [
  {
    path: '/*',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
];

const router = createBrowserRouter(routes); // Create the router

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} /> {/* Pass the router to RouterProvider */}
  </React.StrictMode>
);
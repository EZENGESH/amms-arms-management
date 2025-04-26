import React from 'react';
import Button from '../components/Button';

export default function RegisterForm(props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Register</h1>
        <form className="space-y-4" onSubmit={props.onSubmit}>
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Service Number"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="First Name"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Last Name"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Username"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
          />
          <input
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Confirm Password"
          />
          <Button type="submit">Register</Button>
        </form>
        <p className="text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <a href="/" className="text-blue-500 underline hover:text-blue-700 transition-colors">
        Go back to Home
      </a>
    </motion.div>
  );
}

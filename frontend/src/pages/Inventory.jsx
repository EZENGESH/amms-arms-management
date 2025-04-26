import { useEffect, useState } from 'react';
import AdminLayout from '../layouts/AdminLayout';
import { getInventory } from '../services/inventory';

export default function Inventory() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getInventory();
      setItems(data);
    }
    fetchData();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Inventory</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Item</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Stock</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="p-2 border">{item.name}</td>
              <td className="p-2 border">{item.category}</td>
              <td className="p-2 border">{item.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}

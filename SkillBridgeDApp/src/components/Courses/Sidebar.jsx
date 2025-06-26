// src/components/Courses/Sidebar.jsx
import React from 'react';
import { Filter } from 'lucide-react';

export default function Sidebar({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <aside className="lg:w-64">
      <div className="bg-white border rounded-xl shadow-sm p-6 sticky top-28">
        <h3 className="font-semibold text-white flex items-center mb-4">
          <Filter size={18} className="mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition text-left ${
                selectedCategory === id
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-gray-500 text-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

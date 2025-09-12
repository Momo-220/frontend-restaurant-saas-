export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 z-40 h-full w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🍽️</span>
          </div>
          <span className="text-xl font-bold text-gray-900">NOMO</span>
        </div>
      </div>
      
      <nav className="p-4">
        <div className="space-y-2">
          <a href="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Dashboard
          </a>
          <a href="/dashboard/restaurants" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Restaurants
          </a>
          <a href="/dashboard/menus" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Menus
          </a>
          <a href="/dashboard/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Commandes
          </a>
        </div>
      </nav>
    </div>
  );
} 
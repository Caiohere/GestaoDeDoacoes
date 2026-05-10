import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, HeartHandshake, Trophy } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Doadores', href: '/doadores', icon: Users },
  { name: 'Registrar Doação', href: '/doacoes', icon: HeartHandshake },
  { name: 'Ranking', href: '/ranking', icon: Trophy },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-20 flex items-center px-4 border-b border-gray-100">
        <HeartHandshake className="w-7 h-7 text-primary-600 mr-2" />
        <h1 className="text-[17px] font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent truncate">
          Cesta mais que básica
        </h1>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white shadow-xl flex-col z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <HeartHandshake className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-xl font-bold text-center bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent leading-tight flex-1">
            Cesta<br />mais que básica
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50/50 pt-16 pb-20 md:pt-0 md:pb-0">
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-around items-center px-2 py-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center p-2 rounded-xl min-w-[64px]',
                  isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-6 w-6 mb-1',
                      isActive ? 'text-primary-600 drop-shadow-sm' : ''
                    )}
                  />
                  <span className={cn("text-[10px] font-medium tracking-wide", isActive ? "font-bold" : "")}>
                    {item.name === 'Registrar Doação' ? 'Doar' : item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

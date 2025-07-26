
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';

interface SidebarProps {
  isSidebarOpen: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700`}>
      <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
        <div className="p-4 mb-4">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">BizMitra</h1>
        </div>
        <ul className="space-y-2 font-medium flex-grow">
          {NAV_ITEMS.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-lg group text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    isActive ? 'bg-primary-50 dark:bg-slate-700 text-primary-600 dark:text-primary-300' : ''
                  }`
                }
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="pt-4 mt-4 space-y-2 border-t border-slate-200 dark:border-slate-700">
            <button onClick={handleLogout} className="flex items-center p-2 w-full text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 group">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="ml-3">Logout</span>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

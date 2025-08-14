import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBoxes,
  FaStore,
  FaMoneyBill,
  FaCubes,
  FaSignOutAlt,
  FaArrowCircleUp
} from 'react-icons/fa';
import InstallAppButton from '../components/InstallAppButton';

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const linkClass =
    'flex items-center p-3 gap-2 rounded-lg hover:bg-blue-100 text-gray-700';
  const activeClass = 'bg-blue-100 font-semibold';

  return (
    <div className="w-64 bg-white h-screen shadow-lg p-4 fixed flex flex-col justify-between">
      <div>
        {/* Logo (full-width centered) */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        <nav className="flex flex-col gap-2">
          {role === 'admin' && (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaTachometerAlt /> Dashboard
              </NavLink>
              <NavLink
                to="/inventory"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaBoxes /> Inventory
              </NavLink>
              <NavLink
                to="/branches"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaStore /> Branches
              </NavLink>
              <NavLink
                to="/items"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaCubes /> Items
              </NavLink>
              <NavLink
                to="/sales"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaMoneyBill /> Sales
              </NavLink>
            </>
          )}

          {role !== 'admin' && (
            <>
              <NavLink
                to="/inventory-view"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaBoxes /> Inventory
              </NavLink>
              <NavLink
                to="/branch-pos"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaMoneyBill /> Sales
              </NavLink>
              <NavLink
                to="/stock"
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <FaArrowCircleUp /> Stock Out
              </NavLink>
            </>
          )}
        </nav>
      </div>
       <div className="fixed bottom-6 left-6 z-50">
          <InstallAppButton />
        </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-600 hover:text-red-800 px-3 py-2 mt-4 rounded hover:bg-red-100"
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default Sidebar;

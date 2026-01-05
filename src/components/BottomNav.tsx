import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Plus, Shirt } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/wardrobe', icon: Shirt, label: 'Guarda-Roupa' },
  { path: '/upload', icon: Plus, label: 'Adicionar' },
  { path: '/laundry', icon: ShoppingBag, label: 'Lavanderia' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-2 px-4 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

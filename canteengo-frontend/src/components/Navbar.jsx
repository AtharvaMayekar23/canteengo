import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CookingPot,
  ClipboardList,
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPinned,
  Menu as MenuIcon,
  ShoppingBasket,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const studentLinks = [
    { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
    { label: 'Cart', path: '/cart', icon: ShoppingBasket },
    { label: 'My Orders', path: '/orders', aliases: ['/my-orders'], icon: ClipboardList },
    { label: 'Tracking', path: '/tracking', aliases: ['/order-tracking'], icon: MapPinned },
  ];
  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Food', path: '/admin/food', icon: UtensilsCrossed },
    { label: 'Manage Orders', path: '/admin/orders', icon: ClipboardList },
  ];
  const links = user?.role === 'ADMIN' ? adminLinks : user?.role === 'STUDENT' ? studentLinks : [];
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CG';

  const renderLinks = (mobile = false) => links.map(({ label, path, aliases = [], icon: Icon }) => {
    const active = [path, ...aliases].includes(location.pathname);
    return (
      <Link
        key={path}
        to={path}
        aria-current={active ? 'page' : undefined}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center gap-2 rounded-xl font-bold transition ${mobile ? 'min-h-11 px-3 text-sm' : 'px-3 py-2.5 text-[13px]'} ${
          active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-950'
        }`}
      >
        <Icon size={16} className={active ? 'text-amber-400' : 'text-slate-400'} aria-hidden="true" />
        {label}
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-[0_3px_16px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-sm">
            <CookingPot size={21} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="text-[19px] font-black leading-none text-slate-950">
            Canteen<span className="text-amber-600">Go</span>
            <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">Campus food, made easy</span>
          </span>
        </Link>

        {links.length > 0 && (
          <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 lg:flex">
            {renderLinks()}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-900 ring-1 ring-amber-200">
                  {initials}
                </span>
                <span className="hidden max-w-32 xl:block">
                  <span className="block truncate text-xs font-extrabold text-slate-900">{user.name}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {user.role === 'ADMIN' ? 'Canteen admin' : 'Student account'}
                  </span>
                </span>
              </div>
              <button
                type="button"
                title="Sign out"
                aria-label="Sign out"
                onClick={() => { logout(); setMenuOpen(false); navigate('/login', { replace: true }); }}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut size={16} aria-hidden="true" />
                <span className="hidden text-xs font-bold sm:inline">Sign out</span>
              </button>
              {links.length > 0 && (
                <button
                  type="button"
                  aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 lg:hidden"
                >
                  {menuOpen ? <X size={19} /> : <MenuIcon size={19} />}
                </button>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100">
                <LogIn size={15} aria-hidden="true" />
                Sign in
              </Link>
              <Link to="/register" className="flex h-10 items-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-amber-500 hover:text-slate-950">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {user && menuOpen && links.length > 0 && (
        <nav aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-4 py-3 shadow-lg lg:hidden sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-1.5">{renderLinks(true)}</div>
        </nav>
      )}
    </header>
  );
}
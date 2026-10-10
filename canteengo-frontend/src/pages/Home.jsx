import { ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Clock3, CookingPot, MapPin, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=2200&q=90';

const features = [
  {
    number: '01',
    icon: UtensilsCrossed,
    title: 'Pick what you love',
    description: 'Browse the canteen menu and choose your meal before the rush.',
  },
  {
    number: '02',
    icon: Clock3,
    title: 'Order on your time',
    description: 'Send your order in a few taps, wherever your day takes you on campus.',
  },
  {
    number: '03',
    icon: MapPin,
    title: 'Know when it is ready',
    description: 'Follow each order as it moves from pending to ready for pickup.',
  },
];

const trustPoints = [
  { icon: BadgeCheck, title: 'Clear order status', detail: 'See every update as it happens.' },
  { icon: ShieldCheck, title: 'Your account, yours', detail: 'Student and admin access stay separate.' },
  { icon: Clock3, title: 'Less waiting around', detail: 'Order ahead and plan your break.' },
];

export default function Home() {
  const { user } = useAuth();
  const accountPath = user?.role === 'ADMIN' ? '/admin/dashboard' : '/menu';

  return (
    <div className="overflow-hidden bg-[#fbfaf7] text-slate-950">
      <main>
        <section className="relative isolate flex min-h-[610px] items-end bg-slate-950 text-white sm:min-h-[660px] lg:min-h-[710px]">
          <img
            src={HERO_IMAGE}
            alt="Freshly prepared colorful meal served in a bowl"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/15" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/10" />
          <div className="mx-auto w-full max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
            <div className="max-w-3xl animate-[homeRise_.7s_ease-out_both]">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-200 backdrop-blur-sm">
                <Sparkles size={14} aria-hidden="true" /> Your campus canteen, reimagined
              </p>
              <h1 className="max-w-2xl text-5xl font-black leading-[0.98] sm:text-6xl lg:text-7xl">
                Good food.
                <span className="block text-amber-300">Less waiting.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/80 sm:text-lg">
                Your favorite campus meals, ready when you are. Browse the menu, place your order, and pick it up without losing your whole break.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {user ? (
                  <Link to={accountPath} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                    Go to your canteen <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                      Create student account <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                    <Link to="/login" className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/45 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20">
                      Sign in <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </>
                )}
              </div>
            </div>
            <a href="#how-it-works" className="mt-14 inline-flex items-center gap-2 text-xs font-bold text-white/75 transition hover:text-white">
              Explore CanteenGo <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="absolute bottom-8 right-6 hidden items-center gap-3 text-right sm:flex lg:right-12">
            <span className="h-px w-10 bg-amber-300" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/75">Made for campus days</span>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-b border-slate-200 bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
            <div className="max-w-md">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">A better lunch break</p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Good food should fit your day.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                CanteenGo connects your campus menu to a simpler way to order. Spend less time in line and more time enjoying the break you earned.
              </p>
            </div>
            <div className="grid gap-7 sm:grid-cols-3">
              {features.map(({ number, icon: Icon, title, description }) => (
                <article key={number} className="border-t-2 border-amber-400 pt-5">
                  <div className="flex items-center justify-between">
                    <Icon size={21} className="text-slate-800" aria-hidden="true" />
                    <span className="text-xs font-black text-slate-300">{number}</span>
                  </div>
                  <h3 className="mt-7 text-base font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f1f3ed] py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:items-center lg:px-12">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Made for real campus routines</p>
              <h2 className="mt-4 max-w-sm text-3xl font-black leading-tight sm:text-4xl">A smoother meal, from first tap to pickup.</h2>
            </div>
            <div className="grid gap-0 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex gap-4 border-t border-slate-300 py-5 sm:border-l sm:border-t-0 sm:px-5 sm:first:border-l-0 sm:first:pl-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-amber-700 ring-1 ring-slate-200">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">{detail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-2 md:items-center lg:gap-20 lg:px-12">
            <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-slate-200 sm:min-h-[390px]">
              <img src={HERO_IMAGE} alt="A freshly prepared meal ready for a campus break" className="absolute inset-0 h-full w-full object-cover object-[center_60%]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 text-xs font-bold text-white"><CookingPot size={16} aria-hidden="true" /> A little more time for what matters</span>
            </div>
            <div className="max-w-lg">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">The CanteenGo story</p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Campus food. A little less complicated.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                Between classes, projects, and everything else, your break matters. We built CanteenGo to make ordering from your campus canteen feel straightforward, clear, and easy to follow.
              </p>
              <Link to={user ? accountPath : '/register'} className="mt-7 inline-flex items-center gap-2 border-b-2 border-amber-400 pb-1 text-sm font-extrabold text-slate-900 transition hover:text-amber-800">
                {user ? 'Open your canteen' : 'Get started with CanteenGo'} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white sm:py-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Your next break starts here</p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Ready when you are.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Join CanteenGo and make your next campus meal an easier one.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              {user ? (
                <Link to={accountPath} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                  Go to your canteen <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-amber-400 px-5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                    Create account <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link to="/login" className="inline-flex min-h-12 items-center rounded-lg border border-slate-600 px-5 text-sm font-bold text-white transition hover:bg-slate-800">Sign in</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#111a1a] py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-12">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-black">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950"><CookingPot size={17} aria-hidden="true" /></span>
              Canteen<span className="text-amber-400">Go</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">A simpler way to order your campus favorites and make the most of your break.</p>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Explore</h2>
            <div className="mt-4 grid justify-start gap-3 text-sm font-medium text-slate-400">
              <a href="#how-it-works" className="transition hover:text-amber-300">How it works</a>
              <Link to={user ? accountPath : '/login'} className="transition hover:text-amber-300">{user ? 'Open canteen' : 'Sign in'}</Link>
              <Link to={user ? accountPath : '/register'} className="transition hover:text-amber-300">{user ? 'Your account' : 'Create account'}</Link>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Your account</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">Students can create an account to browse the menu, place orders, and follow pickup status.</p>
            <Link to={user ? accountPath : '/login'} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-amber-300 hover:text-amber-200">
              {user ? 'Continue' : 'Sign in'} <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/10 px-5 pt-5 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
          <span>© {new Date().getFullYear()} CanteenGo</span>
          <span>Made for better campus breaks.</span>
        </div>
      </footer>
      <style>{`@keyframes homeRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

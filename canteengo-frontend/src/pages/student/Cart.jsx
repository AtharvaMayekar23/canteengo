import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { createOrder } from '../../services/api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('canteengo_cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const updateCartStorage = (newCart) => {
    setCartItems(newCart);
    if (newCart.length === 0) {
      localStorage.removeItem('canteengo_cart');
    } else {
      localStorage.setItem('canteengo_cart', JSON.stringify(newCart));
    }
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleIncreaseQuantity = (index) => {
    const updatedCart = [...cartItems];
    updatedCart[index].quantity += 1;
    updateCartStorage(updatedCart);
  };

  const handleDecreaseQuantity = (index) => {
    const updatedCart = [...cartItems];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      updateCartStorage(updatedCart);
    } else {
      handleRemoveItem(index);
    }
  };

  const handleRemoveItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    updateCartStorage(updatedCart);
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || placing) return;

    setPlacing(true);
    try {
      const orderPayload = {
        items: cartItems.map((item) => `${item.name} (${item.quantity})`).join(', '),
        total: totalAmount,
      };

      // POST /api/orders
      const response = await createOrder(orderPayload);
      const createdOrder = response.data;

      // Local storage backup for offline sync
      const existingOrders = JSON.parse(localStorage.getItem('canteengo_orders') || '[]');
      localStorage.setItem('canteengo_orders', JSON.stringify([createdOrder, ...existingOrders]));

      // Clear local cart
      setCartItems([]);
      localStorage.removeItem('canteengo_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      // Created Order object pass kiya state me
      navigate('/order-confirmation', { state: { order: createdOrder } });
    } catch (error) {
      console.error('Failed to place order on backend:', error);
      alert('Order place karne me error aaya. Check Spring Boot server!');
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-16 px-6 flex items-center justify-center">
        <div className="max-w-[500px] w-full bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShoppingCart size={34} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-slate-500 font-medium text-sm">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/menu"
            className="inline-block bg-slate-900 hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-2xl transition shadow-md"
          >
            Explore Menu →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[900px] mx-auto space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Your Cart</h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Review & modify your items</p>
          </div>
          <Link to="/menu" className="text-sm font-bold text-amber-600 hover:underline">
            + Add More Items
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-extrabold text-slate-900 pb-4 border-b border-slate-100">
            Selected Items ({cartItems.length})
          </h3>

          <div className="divide-y divide-slate-100">
            {cartItems.map((item, index) => (
              <div key={index} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">₹{item.price} per item</p>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  <div className="flex items-center bg-slate-100 rounded-2xl border border-slate-200 p-1">
                    <button
                      onClick={() => handleDecreaseQuantity(index)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-slate-900 font-black text-base shadow-sm hover:bg-slate-200 transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-black text-slate-900 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncreaseQuantity(index)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-slate-900 font-black text-base shadow-sm hover:bg-slate-200 transition"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-black text-slate-900 text-lg min-w-[70px] text-right">
                    ₹{item.price * item.quantity}
                  </span>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm p-2 rounded-xl hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-600">Total Payable Amount:</span>
            <span className="text-3xl font-black text-amber-600">₹{totalAmount}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-lg py-4 rounded-2xl transition shadow-lg shadow-amber-500/20 cursor-pointer text-center block disabled:opacity-50"
          >
            {placing ? 'Placing Order...' : 'Place Order Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
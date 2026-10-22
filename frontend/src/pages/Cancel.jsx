import { useNavigate } from "react-router-dom";

function Cancel(){
  const navigate = useNavigate();
  return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="bg-[#0f172a] p-8 rounded-2xl border border-white/10">
        <h2 className="text-2xl font-black mb-2">Payment Cancelled</h2>
        <p className="text-sm text-gray-400">Your payment was not completed. You can try again from your cart.</p>
        <div className="mt-4">
          <button onClick={() => navigate('/cart')} className="px-4 py-2 bg-cyan-600 rounded font-bold">Return to Cart</button>
        </div>
      </div>
    </div>
  );
}
export default Cancel;

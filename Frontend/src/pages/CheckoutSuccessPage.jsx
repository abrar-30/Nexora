import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import { orderService } from "../api/orderService";


export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl">
            ✓
          </div>

          <div>
            <p className="text-sm font-medium text-green-700 uppercase tracking-wide">
              Payment successful
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Your order is confirmed
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-lg">
              Stripe has completed the payment and your order has been placed.
              You can review the details below and continue shopping.
            </p>
          </div>

          <div className="w-full grid md:grid-cols-3 gap-4 mt-4">
            <InfoCard label="Order Number" value={"CONFIRMED"} />
            <InfoCard label="Payment Status" value={"PAID"} />
          </div>
        </div>


        <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">What happens next</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• The warehouse can process the order based on its status.</li>
            <li>• You can find it later in your orders page.</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-white font-medium hover:bg-indigo-700 transition"
          >
            View Orders
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900 break-all">{value}</p>
    </div>
  );
}

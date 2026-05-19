import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const productsRes = await api.get("/Product");
      const customersRes = await api.get("/Customer");
      const billsRes = await api.get("/Bill/Bills");

      setProducts(productsRes.data);
      setCustomers(customersRes.data);
      setBills(billsRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  const parseDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;

    const parts = value
      .replace(/\s+/g, " ")
      .trim()
      .split(/[\/\-\s:]+/);
    if (parts.length < 3) return null;
    const [year, month, day] =
      parts[0].length === 4
        ? parts
        : [parts[2], parts[1], parts[0]];
    const parsed = new Date(`${year}-${month}-${day}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const totalSales = bills.reduce(
    (sum, bill) => sum + Number(bill.totalAmount || 0),
    0
  );

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock || 0) < 5
  );

  const salesByDay = {};
  const salesByMonth = {};
  const productSalesThisMonth = {};

  bills.forEach((bill) => {
    const billDate = parseDate(bill.date);
    if (!billDate) return;

    const amount = Number(bill.totalAmount || 0);
    const dayKey = `${billDate.getFullYear()}-${billDate.getMonth()}-${billDate.getDate()}`;
    const monthKey = `${billDate.getFullYear()}-${billDate.getMonth()}`;

    salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + amount;

    if (
      billDate.getFullYear() === currentYear &&
      billDate.getMonth() === currentMonth
    ) {
      salesByDay[dayKey] = (salesByDay[dayKey] || 0) + amount;

      (bill.items || []).forEach((item) => {
        const productId =
          item.productId || item.product?.id || item.id || item.ProductId;
        const quantity = Number(item.quantity || 0);
        if (!productId) return;
        productSalesThisMonth[productId] =
          (productSalesThisMonth[productId] || 0) + quantity;
      });
    }
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dailySalesData = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const key = `${currentYear}-${currentMonth}-${day}`;
    return {
      name: `${day}/${currentMonth + 1}`,
      sales: salesByDay[key] || 0,
    };
  });

  const recentMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(currentYear, currentMonth - 5 + index, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    return {
      name: date.toLocaleString("en-US", { month: "short" }),
      sales: salesByMonth[key] || 0,
    };
  });

  const productRows = products.map((product) => ({
    ...product,
    soldThisMonth:
      productSalesThisMonth[product.id] ||
      productSalesThisMonth[product.productId] ||
      0,
  }));

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />
      <div className="ml-64 w-full p-6">
        <Navbar />

        <div className="grid gap-5 xl:grid-cols-5">
          <div className="xl:col-span-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">إجمالي المبيعات</p>
              <h2 className="mt-4 text-4xl font-bold text-white">${totalSales.toLocaleString()}</h2>
              <p className="mt-2 text-sm text-slate-400">إجمالي الإيرادات من الفواتير.</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">كمية المخزون</p>
              <h2 className="mt-4 text-4xl font-bold text-white">{totalStock.toLocaleString()}</h2>
              <p className="mt-2 text-sm text-slate-400">إجمالي وحدات المخزون المتاحة.</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">العملاء</p>
              <h2 className="mt-4 text-4xl font-bold text-white">{customers.length}</h2>
              <p className="mt-2 text-sm text-slate-400">العملاء المسجلين في النظام.</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">المنتجات</p>
              <h2 className="mt-4 text-4xl font-bold text-white">{products.length}</h2>
              <p className="mt-2 text-sm text-slate-400">عدد المنتجات المتاحة للبيع.</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">الفواتير</p>
              <h2 className="mt-4 text-4xl font-bold text-white">{bills.length}</h2>
              <p className="mt-2 text-sm text-slate-400">إجمالي الفواتير المسجلة في النظام.</p>
            </div>
          </div>

          <div className="xl:col-span-3 rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">أداء المنتجات الشهري</p>
                <h2 className="mt-2 text-2xl font-bold text-white">نظرة عامة على المبيعات</h2>
              </div>
              <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">
                {currentDate.toLocaleString("ar-EG", { month: "long", year: "numeric" })}
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="h-72 rounded-3xl bg-slate-950 p-4">
                <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">المبيعات اليومية</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailySalesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#cbd5e1" }} />
                    <YAxis tick={{ fill: "#cbd5e1" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, border: "1px solid #334155" }} />
                    <Line type="monotone" dataKey="sales" stroke="#60a5fa" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-72 rounded-3xl bg-slate-950 p-4">
                <p className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">المبيعات الشهرية</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentMonths} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fill: "#cbd5e1" }} />
                    <YAxis tick={{ fill: "#cbd5e1" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: 12, border: "1px solid #334155" }} />
                    <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                    <Line type="monotone" dataKey="sales" stroke="#34d399" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3 mt-6">
          <div className="xl:col-span-2 rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">جميع المنتجات</p>
                <h2 className="mt-2 text-2xl font-bold text-white">المخزون والمبيعات الشهرية</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700 text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="px-4 py-3">المنتج</th>
                    <th className="px-4 py-3">المخزون</th>
                    <th className="px-4 py-3">المبيعات هذا الشهر</th>
                    <th className="px-4 py-3">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {productRows.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/80">
                      <td className="px-4 py-4 text-slate-100">{product.name}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          Number(product.stock) < 5
                            ? "bg-rose-500/20 text-rose-300"
                            : "bg-slate-700 text-slate-200"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-100">{product.soldThisMonth}</td>
                      <td className="px-4 py-4 text-slate-100">{product.price?.toLocaleString()} ج</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
            <div className="mb-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">تنبيهات المخزون المنخفض</p>
              <h2 className="mt-2 text-2xl font-bold text-white">المنتجات أقل من 5 قطع</h2>
            </div>

            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <div className="rounded-3xl bg-slate-950 p-5 text-slate-300">جميع المنتجات لديها مخزون كافٍ.</div>
              ) : (
                lowStockProducts.map((product) => (
                  <div key={product.id} className="rounded-3xl bg-slate-950 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{product.name}</p>
                        <p className="text-sm text-slate-400">الرقم: {product.id}</p>
                      </div>
                      <span className="rounded-full bg-rose-500/20 px-3 py-1 text-sm font-semibold text-rose-300">
                        تبقى {product.stock}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import Swal from "sweetalert2";
import { useReactToPrint } from "react-to-print";

function Bills() {

  const [bills, setBills] = useState([]);
  const [showBills, setShowBills] = useState(true);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [customerId, setCustomerId] = useState("");

  const [newCustomerName, setNewCustomerName] =
    useState("");

  const [newCustomerPhone, setNewCustomerPhone] =
    useState("");

  const [newCustomerAddress, setNewCustomerAddress] =
    useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState([]);

  const [discount, setDiscount] = useState(0);

  const [searchId, setSearchId] = useState("");

  const [selectedBill, setSelectedBill] =
    useState(null);
  const [printPending, setPrintPending] =
    useState(false);

  const printRef = useRef();

  useEffect(() => {

    getCustomers();
    getProducts();
    getBills();

  }, []);

  useEffect(() => {
    if (!printPending || !selectedBill) return;
    handlePrint();
    setPrintPending(false);
  }, [printPending, selectedBill]);

  // GET BILLS

  const getBills = async () => {

    try {

      const response =
        await api.get("/Bill/Bills");

      setBills(response.data);
      return response.data;

    } catch (error) {

      console.log(error);
      return [];

    }

  };

  // GET CUSTOMERS

  const getCustomers = async () => {

    try {

      const response =
        await api.get("/Customer");

      setCustomers(response.data);

    } catch {}

  };

  // GET PRODUCTS

  const getProducts = async () => {

    try {

      const response =
        await api.get("/Product");

      setProducts(response.data);

    } catch {}

  };

  // CREATE CUSTOMER

  const createCustomer = async () => {

    if (!newCustomerName) {

      Swal.fire({
        icon: "error",
        title: "اكتب اسم العميل",
      });

      return;

    }

    try {

      const response =
        await api.post("/Customer", {

          name: newCustomerName,
          phone: newCustomerPhone,
          notes: newCustomerAddress,

        });

      Swal.fire({
        icon: "success",
        title: "تم إضافة العميل",
      });

      setCustomerId(response.data.id);

      getCustomers();

      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerAddress("");

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل إضافة العميل",
      });

    }

  };

  // ADD ITEM

  const addItem = () => {

    if (!productId || !quantity) {

      Swal.fire({
        icon: "error",
        title: "اختر المنتج والكمية",
      });

      return;

    }

    const qty = Number(quantity);

    const product = products.find(
      (x) => x.id == productId
    );

    if (!product) return;

    if (qty <= 0) {

      Swal.fire({
        icon: "error",
        title: "كمية غير صحيحة",
      });

      return;

    }

    if (product.stock < qty) {

      Swal.fire({
        icon: "error",
        title: "لا يوجد مخزون كافي",
      });

      return;

    }

    const updatedProducts =
      products.map((p) => {

        if (p.id == productId) {

          return {
            ...p,
            stock: p.stock - qty,
          };

        }

        return p;

      });

    setProducts(updatedProducts);

    const existingItem = items.find(
      (x) =>
        x.productId === Number(productId)
    );

    if (existingItem) {

      const updatedItems =
        items.map((item) => {

          if (
            item.productId ===
            Number(productId)
          ) {

            return {
              ...item,
              quantity:
                item.quantity + qty,
            };

          }

          return item;

        });

      setItems(updatedItems);

    } else {

      const newItem = {

        productId: Number(productId),
        quantity: qty,
        name: product.name,
        price: product.price,

      };

      setItems([...items, newItem]);

    }

    setProductId("");
    setQuantity("");

  };

  // REMOVE ITEM

  const removeItem = (index) => {

    const item = items[index];

    const updatedProducts =
      products.map((p) => {

        if (p.id === item.productId) {

          return {
            ...p,
            stock:
              p.stock + item.quantity,
          };

        }

        return p;

      });

    setProducts(updatedProducts);

    const newItems = items.filter(
      (_, i) => i !== index
    );

    setItems(newItems);

  };

  // TOTALS

  const subtotal = items.reduce(
    (x, y) =>
      x + y.price * y.quantity,
    0
  );

  const discountValue =
    subtotal *
    (Number(discount || 0) / 100);

  const total =
    subtotal - discountValue;

  // CREATE BILL

  const createBill = async () => {

    if (!customerId) {

      Swal.fire({
        icon: "error",
        title: "اختر العميل",
      });

      return;

    }

    if (items.length === 0) {

      Swal.fire({
        icon: "error",
        title: "أضف منتجات",
      });

      return;

    }

    try {

      await api.post("/Bill", {

        customerId,
        discount,
        items,

      });

      Swal.fire({
        icon: "success",
        title: "تم إنشاء الفاتورة",
      });

      setCustomerId("");
      setItems([]);
      setDiscount(0);

      getProducts();

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "فشل",
        text:
          error.response?.data ||
          "خطأ",
      });

    }

  };

  // DELETE BILL

  const deleteBill = async (id) => {

    const result = await Swal.fire({

      title: "حذف الفاتورة؟",
      text:
        "سيتم إعادة المنتجات للمخزن",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم",
      cancelButtonText: "إلغاء",

    });

    if (!result.isConfirmed) return;

    try {

      await api.delete(`/Bill/${id}`);

      Swal.fire({
        icon: "success",
        title: "تم الحذف",
      });

      getBills();
      getProducts();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل الحذف",
      });

    }

  };

  // SEARCH

  const searchBill = async () => {

    if (searchId === "") {

      getBills();
      setShowBills(true);

      return;

    }

    try {

      const response =
        await api.get(
          `/Bill/Bills/${searchId}`
        );

      setBills([response.data]);
      setShowBills(true);

    } catch {

      Swal.fire({
        icon: "error",
        title: "الفاتورة غير موجودة",
      });

    }

  };

  // PRINT

  const handlePrint =
    useReactToPrint({
      contentRef: printRef,
      documentTitle: "فاتورة",
      pageStyle: `@page { size: A4 portrait; margin: 20mm; }
        body { direction: rtl; text-align: right; background: #f3f4f6; color: #111827; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin: 0; }
        .invoice-print-container { max-width: 800px; margin: 0 auto; padding: 28px; background: #ffffff; color: #111827; border-radius: 16px; }
        .invoice-print-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 28px; }
        .invoice-print-company { text-align: center; font-size: 32px; font-weight: 800; line-height: 1.05; }
        .invoice-print-phone { text-align: center; color: #6b7280; font-size: 15px; margin-top: 6px; }
        .invoice-print-meta { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 4px; }
        .invoice-print-meta-item { min-width: 140px; text-align: right; }
        .invoice-print-meta-label { display: block; color: #6b7280; font-size: 13px; margin-bottom: 4px; }
        .invoice-print-meta-value { font-size: 16px; font-weight: 700; color: #111827; }
        .invoice-print-title { font-size: 28px; font-weight: 800; color: #111827; }
        .invoice-print-customer { border: 1px solid #e5e7eb; border-radius: 16px; padding: 22px; background: #f8fafc; margin-bottom: 28px; }
        .invoice-print-customer-header { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 14px; }
        .invoice-print-customer-row { display: flex; justify-content: flex-end; align-items: center; gap: 12px; flex-wrap: wrap; }
        .invoice-print-customer-row p { margin: 0; font-size: 14px; color: #1f2937; }
        .invoice-print-customer-row strong { min-width: 80px; text-align: right; display: inline-block; }
        .invoice-print-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
        .invoice-print-table th, .invoice-print-table td { border: 1px solid #d1d5db; padding: 14px 12px; }
        .invoice-print-table th { background: #f8fafc; font-weight: 700; color: #111827; }
        .invoice-print-table td { text-align: center; font-size: 14px; color: #1f2937; }
        .invoice-print-table td:first-child { text-align: right; }
        .invoice-print-table tbody tr { background: #ffffff; }
        .invoice-print-table tbody tr:not(:last-child) td { border-bottom: 1px solid #e5e7eb; }
        .invoice-total-section { display: flex; justify-content: flex-end; margin-top: 12px; }
        .invoice-total-card { width: min(380px, 100%); background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; }
        .invoice-total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #4b5563; }
        .invoice-total-row span:first-child { font-weight: 600; }
        .invoice-total-row span:last-child { font-weight: 700; color: #111827; }
        .invoice-total-value { display: block; margin-top: 12px; font-size: 30px; font-weight: 800; color: #111827; text-align: right; }
        @media print { body { margin: 0; background: #ffffff; } .invoice-print-container { box-shadow: none; margin: 0; border-radius: 0; }
          .invoice-print-container * { -webkit-print-color-adjust: exact; color-adjust: exact; }
        }
      `,
    });

  return (

    <div className="flex bg-gray-900 text-white min-h-screen">

      <Sidebar />

      <div className="ml-64 p-5 w-full">

        <Navbar />

        {/* CREATE BILL */}

        <div className="bg-gray-800 p-5 rounded-3xl mb-5">

          <h1 className="text-3xl font-bold mb-5">
            إنشاء فاتورة
          </h1>

          {/* CUSTOMER */}

          <select
            value={customerId}
            onChange={(e) =>
              setCustomerId(
                e.target.value
              )
            }
            className="w-full p-3 rounded-xl bg-gray-700 mb-5"
          >

            <option value="">
              اختر العميل
            </option>

            {customers.map((customer) => (

              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name}
              </option>

            ))}

          </select>

          {/* NEW CUSTOMER */}

          <div className="bg-gray-700 p-4 rounded-2xl mb-5">

            <h2 className="text-xl font-bold mb-4">
              إضافة عميل جديد
            </h2>

            <div className="grid grid-cols-3 gap-3">

              <input
                type="text"
                placeholder="اسم العميل"
                value={newCustomerName}
                onChange={(e) =>
                  setNewCustomerName(
                    e.target.value
                  )
                }
                className="p-3 rounded-xl bg-gray-800"
              />

              <input
                type="text"
                placeholder="رقم الهاتف"
                value={newCustomerPhone}
                onChange={(e) =>
                  setNewCustomerPhone(
                    e.target.value
                  )
                }
                className="p-3 rounded-xl bg-gray-800"
              />

              <input
                type="text"
                placeholder="العنوان"
                value={newCustomerAddress}
                onChange={(e) =>
                  setNewCustomerAddress(
                    e.target.value
                  )
                }
                className="p-3 rounded-xl bg-gray-800"
              />

            </div>

            <button
              onClick={createCustomer}
              className="bg-green-600 px-5 py-3 rounded-xl mt-4"
            >
              إضافة العميل
            </button>

          </div>

          {/* PRODUCTS */}

          <div className="grid grid-cols-3 gap-4">

            <select
              value={productId}
              onChange={(e) =>
                setProductId(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-gray-700"
            >

              <option value="">
                اختر المنتج
              </option>

              {products.map((product) => (

                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name}
                  {" | "}
                  المخزون:
                  {product.stock}
                </option>

              ))}

            </select>

            <input
              type="number"
              placeholder="الكمية"
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-gray-700"
            />

            <button
              onClick={addItem}
              className="bg-blue-600 rounded-xl"
            >
              إضافة
            </button>

          </div>

          {/* DISCOUNT */}

          <div className="mt-5">

            <label className="block mb-2">
              نسبة الخصم %
            </label>

            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) =>
                setDiscount(
                  Math.max(
                    0,
                    Number(
                      e.target.value
                    )
                  )
                )
              }
              className="p-3 rounded-xl bg-gray-700 w-64"
            />

          </div>

          {/* ITEMS */}

          <div className="mt-5 overflow-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-gray-700">

                  <th className="p-3 text-right">
                    المنتج
                  </th>

                  <th className="p-3 text-right">
                    الكمية
                  </th>

                  <th className="p-3 text-right">
                    السعر
                  </th>

                  <th className="p-3 text-right">
                    الإجمالي
                  </th>

                  <th className="p-3 text-right">
                    حذف
                  </th>

                </tr>

              </thead>

              <tbody>

                {items.map(
                  (item, index) => (

                    <tr
                      key={index}
                      className="border-b border-gray-700"
                    >

                      <td className="p-3">
                        {item.name}
                      </td>

                      <td className="p-3">
                        {item.quantity}
                      </td>

                      <td className="p-3">
                        {item.price} ج
                      </td>

                      <td className="p-3">
                        {item.price *
                          item.quantity} ج
                      </td>

                      <td className="p-3">

                        <button
                          onClick={() =>
                            removeItem(index)
                          }
                          className="bg-red-600 px-3 py-1 rounded-lg"
                        >
                          حذف
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* TOTAL */}

          <div className="mt-5 text-2xl font-bold">

            الإجمالي:
            {" "}
            {total.toFixed(2)}
            {" "}
            ج

          </div>

          {/* ACTIONS */}

          <div className="flex gap-4 mt-5">

            <button
              onClick={createBill}
              className="bg-green-600 px-5 py-3 rounded-xl"
            >
              إنشاء الفاتورة
            </button>

            <button
              onClick={() => {
                setSelectedBill({

                  customer: {

                    name:
                      customers.find(
                        (x) => x.id == customerId
                      )?.name || "",

                    phone:
                      customers.find(
                        (x) => x.id == customerId
                      )?.phone || "",

                    notes:
                      customers.find(
                        (x) => x.id == customerId
                      )?.notes || "",

                  },

                  items: items.map((item) => ({

                    ...item,

                    product: {
                      name: item.name,
                    },

                  })),

                  totalAmount: total,

                  discount: discount,

                  date:
                    new Date().toLocaleDateString(),

                });

                setPrintPending(true);

              }}
              className="bg-purple-600 px-5 py-3 rounded-xl"
            >
              طباعة الفاتورة
            </button>

          </div>

        </div>

        {/* BILL LIST */}

        <div className="bg-gray-800 p-5 rounded-3xl mt-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={async () => {
                  await getBills();
                  setShowBills(true);
                }}
                className="bg-blue-600 px-5 py-3 rounded-xl"
              >
                عرض الفواتير
              </button>

              <button
                onClick={() => setShowBills(false)}
                className="bg-gray-600 px-5 py-3 rounded-xl"
              >
                إخفاء الفواتير
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="ابحث برقم الفاتورة"
                value={searchId}
                onChange={(e) =>
                  setSearchId(e.target.value)
                }
                className="p-3 rounded-xl bg-gray-700"
              />

              <button
                onClick={searchBill}
                className="bg-green-600 px-5 py-3 rounded-xl"
              >
                بحث
              </button>
            </div>

          </div>

          {showBills && (
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-right">
                    <th className="p-3">رقم الفاتورة</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">العميل</th>
                    <th className="p-3">الإجمالي</th>
                    <th className="p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-gray-400"
                      >
                        لا توجد فواتير
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr
                        key={bill.id}
                        className="border-b border-gray-700"
                      >
                        <td className="p-3 text-right">
                          {bill.id}
                        </td>
                        <td className="p-3 text-right">
                          {bill.date}
                        </td>
                        <td className="p-3 text-right">
                          {bill.customer?.name}
                        </td>
                        <td className="p-3 text-right">
                          {bill.totalAmount}
                        </td>
                        <td className="p-3 text-right space-x-2 flex flex-col sm:flex-row sm:justify-end">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="bg-blue-600 px-3 py-2 rounded-xl"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBill(bill);
                              setPrintPending(true);
                            }}
                            className="bg-purple-600 px-3 py-2 rounded-xl"
                          >
                            طباعة
                          </button>
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="bg-red-600 px-3 py-2 rounded-xl"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* PRINT AREA */}
        <div
          className={
            selectedBill
              ? "bg-white text-black p-5 rounded-3xl mt-5"
              : "hidden"
          }
          dir="rtl"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            معاينة الفاتورة للطباعة
          </h2>

          <div
            ref={printRef}
            className="invoice-print-container"
            style={{ direction: "rtl", textAlign: "right" }}
          >
            {selectedBill && (
              <div>
                <div className="invoice-print-header">
                  <div>
                    <div className="invoice-print-company">
                      الشيخ احمد زيدان للنجارة
                    </div>
                    <div className="invoice-print-phone">
                      01286626341
                    </div>
                  </div>
                  <div className="invoice-print-meta">
                    <div className="invoice-print-meta-item">
                    </div>
                    <div className="invoice-print-meta-item">
                      <span className="invoice-print-meta-label">التاريخ</span>
                      <span className="invoice-print-meta-value">{selectedBill.date}</span>
                    </div>
                    <div className="invoice-print-meta-item">
                      <span className="invoice-print-title">فاتورة</span>
                    </div>
                  </div>
                </div>

                <div className="invoice-print-customer">
                  <div className="invoice-print-customer-header">
                    بيانات العميل
                  </div>
                  <div className="invoice-print-customer-row">
                    <p>
                      <strong>الاسم:</strong> {selectedBill.customer?.name}
                    </p>
                    <p>
                      <strong>الهاتف:</strong> {selectedBill.customer?.phone}
                    </p>
                    <p>
                      <strong>العنوان:</strong> {selectedBill.customer?.notes}
                    </p>
                  </div>
                </div>

                <table className="invoice-print-table">
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedBill.items || []).map((item, index) => (
                      <tr key={index}>
                        <td>{item.product?.name || item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price} ج</td>
                        <td>{item.price * item.quantity} ج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="invoice-total-section">
                  <div className="invoice-total-card">
                    
                    <div className="invoice-total-row">
                      <span>الإجمالي</span>
                      <span>{selectedBill.totalAmount} ج</span>
                    </div>
                    <span className="invoice-total-value">
                      {selectedBill.totalAmount} ج
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bills;
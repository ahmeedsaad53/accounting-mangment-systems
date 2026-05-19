import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import Swal from "sweetalert2";

function Customers() {

  const [customers, setCustomers] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [searchId, setSearchId] = useState("");

  const [editId, setEditId] = useState(null);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {

    getCustomers();

  }, []);

  const getCustomers = async () => {

    try {

      const response = await api.get("/Customer");

      setCustomers(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  const addCustomer = async () => {

    try {

      await api.post("/Customer", {
        name,
        phone,
        notes,
      });

      Swal.fire({
        icon: "success",
        title: "تم إضافة العميل",
      });

      setName("");
      setPhone("");
      setNotes("");

      getCustomers();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل",
      });

    }

  };

  const deleteCustomer = async (id) => {

    try {

      await api.delete(`/Customer/${id}`);

      Swal.fire({
        icon: "success",
        title: "تم الحذف",
      });

      getCustomers();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل الحذف",
      });

    }

  };

  const searchCustomer = async () => {

    if (searchId === "") {

      getCustomers();

      return;

    }

    try {

      const response = await api.get(`/Customer/${searchId}`);

      setCustomers([response.data]);

    } catch {

      Swal.fire({
        icon: "error",
        title: "العميل غير موجود",
      });

    }

  };

  const openEdit = (customer) => {

    setEditId(customer.id);

    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditNotes(customer.notes);

  };

  const updateCustomer = async () => {

    try {

      await api.put(`/Customer/${editId}`, {
        name: editName,
        phone: editPhone,
        notes: editNotes,
      });

      Swal.fire({
        icon: "success",
        title: "تم التحديث",
      });

      setEditId(null);

      getCustomers();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل التحديث",
      });

    }

  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 p-5 w-full">

        <Navbar />

        {/* ADD CUSTOMER */}

        <div className="bg-gray-800 p-5 rounded-3xl mb-5">

          <h1 className="text-3xl font-bold mb-5">
            إضافة عميل
          </h1>

          <div className="grid grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

            <input
              type="text"
              placeholder="الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

            <input
              type="text"
              placeholder="الملاحظات"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

          </div>

          <button
            onClick={addCustomer}
            className="bg-blue-600 px-5 py-3 rounded-xl mt-5"
          >
            إضافة عميل
          </button>

        </div>

        {/* SEARCH */}

        <div className="bg-gray-800 p-5 rounded-3xl mb-5">

          <h1 className="text-2xl font-bold mb-5">
            البحث عن العميل بالرقم
          </h1>

          <div className="flex gap-3">

            <input
              type="number"
              placeholder="رقم العميل"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="p-3 rounded-xl bg-gray-700 w-64"
            />

            <button
              onClick={searchCustomer}
              className="bg-green-600 px-5 py-3 rounded-xl"
            >
              بحث
            </button>

            <button
              onClick={getCustomers}
              className="bg-gray-600 px-5 py-3 rounded-xl"
            >
              إعادة تحميل
            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-gray-800 p-5 rounded-3xl">

          <h1 className="text-3xl font-bold mb-5">
            العملاء
          </h1>

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-700">

                <th className="p-3 text-left">الرقم</th>
                <th className="p-3 text-left">الاسم</th>
                <th className="p-3 text-left">الهاتف</th>
                <th className="p-3 text-left">الملاحظات</th>
                <th className="p-3 text-left">الإجراءات</th>

              </tr>

            </thead>

            <tbody>

              {customers.map((customer) => (

                <tr
                  key={customer.id}
                  className="border-b border-gray-700"
                >

                  <td className="p-3">{customer.id}</td>
                  <td className="p-3">{customer.name}</td>
                  <td className="p-3">{customer.phone}</td>
                  <td className="p-3">{customer.notes}</td>

                  <td className="p-3 flex gap-2">

                    <button
                      onClick={() => openEdit(customer)}
                      className="bg-yellow-600 px-4 py-2 rounded-xl"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="bg-red-600 px-4 py-2 rounded-xl"
                    >
                      حذف
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* EDIT MODAL */}

        {editId && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

            <div className="bg-gray-900 p-10 rounded-3xl w-[500px]">

              <h1 className="text-3xl font-bold mb-5">
                تعديل العميل
              </h1>

              <div className="flex flex-col gap-4">

                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="p-3 rounded-xl bg-gray-700"
                />

                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="p-3 rounded-xl bg-gray-700"
                />

                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="p-3 rounded-xl bg-gray-700"
                />

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={updateCustomer}
                  className="bg-blue-600 px-5 py-3 rounded-xl"
                >
                  حفظ
                </button>

                <button
                  onClick={() => setEditId(null)}
                  className="bg-gray-600 px-5 py-3 rounded-xl"
                >
                  إلغاء
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default Customers;
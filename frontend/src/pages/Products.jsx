import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";
import Swal from "sweetalert2";

function Products() {

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [editId, setEditId] = useState(null);

  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");

  const [stockId, setStockId] = useState(null);
  const [newStock, setNewStock] = useState("");

  useEffect(() => {

    getProducts();

  }, []);

  const getProducts = async () => {

    try {

      const response = await api.get("/Product");

      setProducts(response.data);

    } catch (error) {

      console.log(error);

    }

  };

  const addProduct = async () => {

    try {

      await api.post("/Product", {
        name,
        type,
        price,
        stock,
      });

      Swal.fire({
        icon: "success",
        title: "تم إضافة المنتج",
      });

      setName("");
      setType("");
      setPrice("");
      setStock("");

      getProducts();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل",
      });

    }

  };

  const deleteProduct = async (id) => {

    try {

      await api.delete(`/Product/${id}`);

      Swal.fire({
        icon: "success",
        title: "تم الحذف",
      });

      getProducts();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل الحذف",
      });

    }

  };

  const openEdit = (product) => {

    setEditId(product.id);

    setEditName(product.name);
    setEditType(product.type);
    setEditPrice(product.price);
    setEditStock(product.stock);

  };

  const updateProduct = async () => {

    try {

      await api.put(`/Product/${editId}`, {
        id: editId,
        name: editName,
        type: editType,
        price: editPrice,
        stock: editStock,
      });

      Swal.fire({
        icon: "success",
        title: "تم التحديث",
      });

      setEditId(null);

      getProducts();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل التحديث",
      });

    }

  };

  const addStock = async () => {

    try {

      const product = products.find(
        (x) => x.id === stockId
      );

      await api.put(`/Product/add-stock/${stockId}`, {
        ...product,
        stock: newStock,
      });

      Swal.fire({
        icon: "success",
        title: "تم تحديث المخزون",
      });

      setStockId(null);

      getProducts();

    } catch {

      Swal.fire({
        icon: "error",
        title: "فشل",
      });

    }

  };

  return (
    <div className="flex">

      <Sidebar />

      <div className="ml-64 p-5 w-full">

        <Navbar />

        {/* ADD PRODUCT */}

        <div className="bg-gray-800 p-5 rounded-3xl mb-5">

          <h1 className="text-3xl font-bold mb-5">
            إضافة منتج
          </h1>

          <div className="grid grid-cols-4 gap-4">

            <input
              type="text"
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

            <input
              type="text"
              placeholder="النوع"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

            <input
              type="number"
              placeholder="السعر"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

            <input
              type="number"
              placeholder="المخزون"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="p-3 rounded-xl bg-gray-700"
            />

          </div>

          <button
            onClick={addProduct}
            className="bg-blue-600 px-5 py-3 rounded-xl mt-5"
          >
            إضافة منتج
          </button>

        </div>

        {/* PRODUCTS TABLE */}

        <div className="bg-gray-800 p-5 rounded-3xl">

          <h1 className="text-3xl font-bold mb-5">
            المنتجات
          </h1>

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-700">

                <th className="p-3 text-left">الرقم</th>
                <th className="p-3 text-left">الاسم</th>
                <th className="p-3 text-left">النوع</th>
                <th className="p-3 text-left">السعر</th>
                <th className="p-3 text-left">المخزون</th>
                <th className="p-3 text-left">الإجراءات</th>

              </tr>

            </thead>

            <tbody>

              {products.map((product) => (

                <tr
                  key={product.id}
                  className="border-b border-gray-700"
                >

                  <td className="p-3">{product.id}</td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.type}</td>
                  <td className="p-3">${product.price}</td>
                  <td className="p-3">{product.stock}</td>

                  <td className="p-3 flex gap-2">

                    <button
                      onClick={() => openEdit(product)}
                      className="bg-yellow-600 px-4 py-2 rounded-xl"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => {
                        setStockId(product.id);
                        setNewStock(product.stock);
                      }}
                      className="bg-green-600 px-4 py-2 rounded-xl"
                    >
                      المخزون
                    </button>

                    <button
                      onClick={() => deleteProduct(product.id)}
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
                تعديل المنتج
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
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="p-3 rounded-xl bg-gray-700"
                />

                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="p-3 rounded-xl bg-gray-700"
                />

                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="p-3 rounded-xl bg-gray-700"
                />

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={updateProduct}
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

        {/* STOCK MODAL */}

        {stockId && (

          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

            <div className="bg-gray-900 p-10 rounded-3xl w-[400px]">

              <h1 className="text-3xl font-bold mb-5">
                تحديث المخزون
              </h1>

              <input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-700"
              />

              <div className="flex gap-3 mt-5">

                <button
                  onClick={addStock}
                  className="bg-green-600 px-5 py-3 rounded-xl"
                >
                  تحديث
                </button>

                <button
                  onClick={() => setStockId(null)}
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

export default Products;
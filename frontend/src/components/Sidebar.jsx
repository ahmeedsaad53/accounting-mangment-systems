import { Link } from "react-router-dom";
import { FaBox, FaUsers, FaFileInvoice } from "react-icons/fa";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 fixed left-0 top-0 right-auto p-5">

      <h1 className="text-3xl font-bold mb-10 text-blue-400 text-left">
        الشيخ احمد زيدان
      </h1>

      <div className="flex flex-col gap-5 text-lg">

        <Link
          to="/dashboard"
          className="hover:bg-gray-700 p-3 rounded-xl"
        >
          لوحة التحكم
        </Link>

        <Link
          to="/products"
          className="hover:bg-gray-700 p-3 rounded-xl flex items-center gap-2"
        >
          <FaBox />
          المنتجات
        </Link>

        <Link
          to="/customers"
          className="hover:bg-gray-700 p-3 rounded-xl flex items-center gap-2"
        >
          <FaUsers />
          العملاء
        </Link>

        <Link
          to="/bills"
          className="hover:bg-gray-700 p-3 rounded-xl flex items-center gap-2"
        >
          <FaFileInvoice />
          الفواتير
        </Link>

      </div>
    </div>
  );
}

export default Sidebar;
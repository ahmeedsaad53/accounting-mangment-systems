function Navbar() {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 mb-5 flex justify-between">

      <h1 className="text-2xl font-bold">
        لوحة التحكم
      </h1>

      <button
        className="bg-red-600 px-4 py-2 rounded-xl"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        تسجيل الخروج
      </button>

    </div>
  );
}

export default Navbar;
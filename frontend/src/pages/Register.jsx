import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {

  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {

    try {

      await api.post("/Account/register", {
        userName,
        email,
        password,
      });

      alert("تم إنشاء الحساب");

      navigate("/");

    } catch (error) {

      alert("فشل التسجيل");

    }

  };

  return (
    <div className="h-screen flex items-center justify-center">

      <div className="bg-gray-800 p-10 rounded-3xl w-96">

        <h1 className="text-4xl font-bold mb-8 text-center">
          التسجيل
        </h1>

        <input
          type="text"
          placeholder="اسم المستخدم"
          className="w-full p-3 rounded-xl bg-gray-700 mb-4"
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full p-3 rounded-xl bg-gray-700 mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full p-3 rounded-xl bg-gray-700 mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={register}
          className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl"
        >
          تسجيل
        </button>

        <p className="mt-5 text-center">

          لديك حساب بالفعل؟

          <Link
            to="/"
            className="text-blue-400 mr-2"
          >
            تسجيل الدخول
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Register;
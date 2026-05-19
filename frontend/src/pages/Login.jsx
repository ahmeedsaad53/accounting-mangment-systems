import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    try {

      const response = await api.post("/Account/login", {
        userName,
        password,
      });

      localStorage.setItem("token", response.data.token);

      navigate("/dashboard");

    } catch (error) {

      alert("اسم المستخدم أو كلمة المرور غير صحيحة");

    }

  };

  return (
    <div className="h-screen flex items-center justify-center">

      <div className="bg-gray-800 p-10 rounded-3xl w-96">

        <h1 className="text-4xl font-bold mb-8 text-center">
          تسجيل الدخول
        </h1>

        <input
          type="text"
          placeholder="اسم المستخدم"
          className="w-full p-3 rounded-xl bg-gray-700 mb-4"
          onChange={(e) => setUserName(e.target.value)}
        />

        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full p-3 rounded-xl bg-gray-700 mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl"
        >
          تسجيل الدخول
        </button>

        <p className="mt-5 text-center">

          لا تملك حساب؟

          <Link
            to="/register"
            className="text-blue-400 mr-2"
          >
            تسجيل
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login; 
 
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Customers from "./pages/Customers.jsx";
import Products from "./pages/Products.jsx";
import Bills from "./pages/Bills.jsx";
import Dashboard from "./pages/Dashboard.jsx";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/products" element={<Products />} />
      <Route path="/bills" element={<Bills />} />
    </Routes>
  );
}

export default App;
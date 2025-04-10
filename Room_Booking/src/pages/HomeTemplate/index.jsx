import { Outlet } from "react-router-dom";
import Header from "./_Component/Header";
import Footer from "./_Component/Footer";

export default function HomeTemplate() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

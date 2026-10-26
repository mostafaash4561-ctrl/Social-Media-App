import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";

export default function Layout() {
  const { userLogin } = useContext(AuthContext);

  return (
    <div>
      {/* only for logged-in users: login / register have their own switch */}
      {userLogin && <Navbar />}
      <div className="container mx-auto min-h-screen w-[92%] xl:w-[90%]">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

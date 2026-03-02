import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MaskImage from "../components/MaskImage";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function DashboardLayout() {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const { pathname } = useLocation();
    const mainRef = useRef(null);
    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo({
                top: 0,
                behavior: "smooth", // use smooth if you want drama
            });
        }
    }, [pathname]);

    return (
        <div className="flex h-[100vh] overflow-hidden">
            <Sidebar MobileMenuActive={mobileMenuActive} setMobileMenuActive={setMobileMenuActive} />
            <main ref={mainRef} className="flex-1 w-full main-section-wrapper ">
                <Header setMobileMenuActive={setMobileMenuActive} />
                <Outlet />
                <div className="h-[200px]"></div>
            </main>


        </div>
    );
}
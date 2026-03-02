import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MaskImage from "../components/MaskImage";
import { useState, useEffect, useRef } from "react";

export default function DashboardLayout() {
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    return (
        <div className="flex h-[100vh] overflow-hidden">
            {/* <div className="theme-setting-wrapper text-[16px] fixed top-[50%] right-0 bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] pb-5 w-[400px] z-[9999]" >
                <div className="px-6 py-4 border-b border-[var(--hover)]">
                    <h5 className="text-[var(--text-dark)] font-semibold">Colour Settings</h5>
                    <p className="text-[var(--text-dark)] text-[.8em]">Change Your Color in Real Time</p>
                </div>
            </div>
            <div className="theme-setting-icon-wrapper fixed bg-[var(--primary-color)] rounded-tl-[5px] rounded-bl-[5px] p-2 z-10 text-[20px]">
                <MaskImage url="/icons/settings.svg" w="1.2em" h="1.2em" bg="white" />
            </div> */}
            <Sidebar MobileMenuActive={mobileMenuActive} setMobileMenuActive={setMobileMenuActive} />
            <main className="flex-1 w-full main-section-wrapper ">
                <Header setMobileMenuActive={setMobileMenuActive} />
                <Outlet />
                <div className="h-[1000px]"></div>
            </main>


        </div>
    );
}

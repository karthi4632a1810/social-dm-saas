import { NavLink } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { sideMenu } from "../data/SideMenuData.jsx";


export default function Sidebar({ MobileMenuActive, setMobileMenuActive }) {
    const location = useLocation();
    const [menuActive, setMenuActive] = useState(() => {
        const saved = localStorage.getItem("menuStatus");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [hoverEnabled, setHoverEnabled] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [activeLink, setActiveLink] = useState(null);

    const [openMenu, setOpenMenu] = useState(null);
    const [lastOpenMenu, setLastOpenMenu] = useState(null);
    const isExpanded = menuActive || hoverEnabled;

    const submenuRefs = useRef({});
    const toggleMenu = (name) => {
        setOpenMenu(prev => {
            if (prev === name) {
                setLastOpenMenu(null);
                // setActiveMenu(null);
                return null;
            } else {
                setLastOpenMenu(name);
                return name;
            }
        });
    };


    const handleClick = () => {

        setMenuActive(prev => {
            const next = !prev;

            if (!next) {
                setOpenMenu(null);
            } else {
                setOpenMenu(lastOpenMenu);
            }

            return next;

        });



        setHoverEnabled(false);
    };

    useEffect(() => {
        if (hoverEnabled && !menuActive && lastOpenMenu) {
            setOpenMenu(lastOpenMenu);
        }
    }, [hoverEnabled, menuActive, lastOpenMenu]);

    useEffect(() => {
        let matched = false;

        sideMenu.forEach(menu => {
            if (menu.submenu) {
                menu.submenu.forEach(sub => {
                    if (sub.link === location.pathname) {
                        setActiveMenu(menu.id);
                        setActiveSubMenu(sub.title);
                        setActiveLink(null);
                        setOpenMenu(menu.id);
                        setLastOpenMenu(menu.id);
                        matched = true;
                    }
                });
            } else if (menu.link === location.pathname) {
                setActiveLink(menu.id);
                setActiveMenu(null);
                setActiveSubMenu(null);
                setOpenMenu(null);
                matched = true;
            }
        });

        if (!matched) {
            setActiveMenu(null);
            setActiveSubMenu(null);
            setActiveLink(null);
        }
    }, [location.pathname]);

    useEffect(() => {
        localStorage.setItem("menuStatus", JSON.stringify(menuActive));
    }, [menuActive]);



    return (

        <aside id="sideBar"
            onMouseEnter={() => {
                if (!menuActive) setHoverEnabled(true);
            }}
            onMouseLeave={() => {
                if (!menuActive) setHoverEnabled(false);
            }} className={`bg-[var(--side-bar)]  min-h-screen  ${menuActive ? "w-[260px] expanded " : hoverEnabled ? "w-[70px] hover:w-[260px] collapsed hover-expanded" : "w-[70px] collapsed"} ${MobileMenuActive ? "mobile_expanded" : ""} overflow-hidden  transition-all lg:duration-300 duration-600 ease-in-out flex flex-col`}>

            <div className="side-bar-header flex items-center justify-between relative z-[4] px-5 h-[65px] text-[20px] top-0">
                <div className="flex items-center gap-3">
                    {/* <img
                        className="block w-[34px] h-auto"
                        src="/icons/logo.svg"
                        alt=""
                    /> */}
                    <MaskImage url="/icons/logo.svg" w="1.8em" h="1.8em" bg="var(--primary-color)" />
                    <span className="font-bold text-[var(--menu-lint-text)] text-[1em] side-bar-name">ClickMyChat</span>
                </div>
                <div onClick={handleClick} className="items-center justify-center hidden lg:flex">
                    <MaskImage
                        url={menuActive ? "/icons/menu-1.svg" : "/icons/menu-2.svg"}
                        w="1em"
                        h="1em"
                        bg="var(--menu-lint-text)"
                    />
                </div>
                <div onClick={() => setMobileMenuActive(prev => !prev)} className="flex items-center justify-center lg:hidden">
                    <MaskImage
                        url="/icons/close.svg"
                        w="1.2em"
                        h="1.2em"
                        bg="var(--menu-lint-text)"
                    />
                </div>
                <div className="absolute down-gradient"></div>
            </div>
            <div className="side-bar-nav-link-wrapper px-3 text-[15px] pt-4">
                {sideMenu.map((menu, index) => (
                    <ul key={"sub-parent-" + menu.id} className={index < 1 ? "" : "mt-[10px]"}>

                        {/* MAIN ITEM */}
                        <li
                            className={`side-bar-nav-link ${menu.submenu
                                ? activeMenu === menu.id
                                    ? "active"
                                    : ""
                                : activeLink === menu.id
                                    ? "active"
                                    : ""
                                } ${menu.submenu ? "" : "bg-different"}  text-[var(--menu-lint-text)] rounded-[7px] relative`}
                        >

                            {menu.submenu ? (
                                <button
                                    onClick={() => {
                                        toggleMenu(menu.id);
                                        setActiveMenu(menu.id);
                                    }}
                                    className="flex items-center px-3 h-[40px] gap-2 w-full text-left relative cursor-pointer"
                                >
                                    <div className="w-[22px] flex items-center justify-center">
                                        <MaskImage url={menu.icon} w="1.5em" h="1.5em" bg="var(--menu-lint-text)" />
                                    </div>

                                    <span className="font-medium side-bar-name">{menu.title}</span>

                                    <div className={`absolute right-[10px] top-1/2 -translate-y-1/2 side-bar-name  ${isExpanded && openMenu === menu.id ? "rotate-[90deg]" : ""}`}>
                                        <MaskImage url="/icons/r-arrow.svg" w="1.2em" h="1.2em" bg="var(--menu-lint-text)" />
                                    </div>
                                </button>
                            ) : (
                                <Link

                                    to={menu.link}
                                    onClick={() => {
                                        setActiveLink(menu.id);
                                        setActiveMenu(null);
                                        setActiveSubMenu(null);
                                        setOpenMenu(null);
                                        setMobileMenuActive(false);
                                    }}

                                    className="flex items-center px-3 h-[40px] gap-2 w-full "
                                >
                                    <div className="w-[22px] flex items-center justify-center">
                                        <MaskImage url={menu.icon} w="1.5em" h="1.5em" bg="var(--menu-lint-text)" />
                                    </div>
                                    <span className="font-medium side-bar-name">{menu.title}</span>
                                </Link>
                            )}
                        </li>

                        {/* SUBMENU – SAME FORMAT */}
                        {
                            menu.submenu && (
                                <ul
                                    ref={(el) => (submenuRefs.current[menu.id] = el)}
                                    style={{
                                        height:
                                            isExpanded && openMenu === menu.id
                                                ? submenuRefs.current[menu.id]?.scrollHeight + "px"
                                                : "0px",
                                    }}
                                    className="side-bar-submenu flex flex-col 
  overflow-hidden transition-[height] duration-300"
                                >
                                    {menu.submenu.map((sub, i) => (
                                        <li
                                            onClick={() => {
                                                setActiveMenu(menu.id);
                                                setActiveSubMenu(sub.title);
                                                setActiveLink(null);
                                                setMobileMenuActive(false);
                                            }}

                                            key={i}
                                            className={`side-bar-nav-link text-[var(--menu-lint-text)] mt-[7px] bg-different ${activeSubMenu == sub.title ? "active" : ""}  rounded-[7px]`}
                                        >
                                            <Link to={sub.link} className="flex items-center px-3  h-[40px] gap-2 w-full">
                                                <div className="w-[22px] flex items-center justify-center">
                                                    <MaskImage
                                                        url={sub.icon}
                                                        w=".86em"
                                                        h=".86em"
                                                        bg="var(--menu-lint-text)"
                                                    />
                                                </div>
                                                <span className="font-medium side-bar-name">{sub.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )
                        }
                    </ul>
                ))}
            </div>
        </aside >
    );
}

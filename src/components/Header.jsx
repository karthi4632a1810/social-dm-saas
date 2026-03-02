import "../assets/css/header.css";
import MaskImage from "../components/MaskImage";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { sideMenu } from "../data/SideMenuData.jsx";
import { authAPI, getUser, notificationAPI, formatRelativeTime, capitalizeWords } from "../utils/api";
import { buildNotificationUI } from "../utils/notificationUI";

function Header({ setMobileMenuActive }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(getUser());
    const [notifyData, setNotifyData] = useState([])
    const [name, setName] = useState(user?.name || "");
    const [role, setRole] = useState(user?.role || "");
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? "/server/" + user.avatar : "");

    useEffect(() => {
        setUser(getUser());
    }, []);
    useEffect(() => {
        fetchLinks();
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        navigate('/login');
    };
    const modes = [
        { name: 'light', icon: '/icons/light.svg' },
        { name: 'dark', icon: '/icons/dark.svg' }
    ]
    const colorSet = [
        { title: "c1", color: "#7367f0" },
        { title: "c2", color: "#0D9394" },
        { title: "c3", color: "#FFAB1D" },
        { title: "c4", color: "#EB3D63" },
        { title: "c5", color: "#2092EC" },
        { title: "c6", color: "#ff4c51" },
    ]

    const fetchLinks = async () => {
        try {
            const response = await notificationAPI.getAll();
            console.log(response)
            if (response.success) {
                console.log(response.data);
                setNotifyData((response.data || []).filter(d => d.isRead == false));
            } else {
                showToast(response.message || "Failed to fetch Notification", "error");
            }
        } catch (err) {
            console.error("Error fetching links:", err);
            showToast("An error occurred while fetching links", "error");
        } finally {

        }
    };

    // notification
    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);

            // update UI state
            setNotifyData(prev =>
                prev.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                )
            );
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };
    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();

            // update UI: set all to read
            setNotifyData(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };
    const removeNotification = (id) => {
        // just remove from UI (optional: also call delete API if you add it)
        setNotifyData(prev => prev.filter(n => n._id !== id));
    };

    const [colorData, setColorData] = useState("c1")
    useEffect(() => {
        const savedColor = localStorage.getItem("main-color");

        if (!savedColor) return;

        const matched = colorSet.find(c => c.color === savedColor);
        if (matched) {
            setColorData(matched.title);
        }
    }, []);

    useEffect(() => {
        const activeColor = colorSet.find(c => c.title === colorData);
        if (activeColor) {
            document.documentElement.style.setProperty(
                "--main-color",
                activeColor.color
            );
        }
        localStorage.setItem("main-color", activeColor.color)
    }, [colorData]);


    const [isMobile, setIsMobile] = useState(false);
    const [filteredMenu, setFilteredMenu] = useState([]);

    const modeRef = useRef(null);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);
    const searchRef = useRef(null);

    const [openDropdown, setOpenDropdown] = useState(null);
    const [modeSet, setModeSet] = useState(() => {
        return localStorage.getItem("theme") || "light";
    });

    const modesActiveIcon = modes.find(mode => mode.name === modeSet);
    useEffect(() => {
        const root = document.documentElement; // <html>

        root.classList.remove("light", "dark");

        if (modeSet === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.classList.add(prefersDark ? "dark" : "light");
        } else {
            root.classList.add(modeSet);
        }

        localStorage.setItem("theme", modeSet);
    }, [modeSet]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                openDropdown === "mode" &&
                modeRef.current &&
                !modeRef.current.contains(event.target)
            ) {
                setOpenDropdown(null);
            }

            if (
                openDropdown === "profile" &&
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setOpenDropdown(null);
            }

            if (
                openDropdown === "notification" &&
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setOpenDropdown(null);
            }
            if (
                openDropdown === "search" &&
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdown]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault(); // stop browser search / link focus nonsense
                setOpenDropdown("search");

                // focus the input after dropdown opens
                setTimeout(() => {
                    searchRef.current?.querySelector("input")?.focus();
                }, 0);
            }

            // ESC closes search (because sanity)
            if (e.key === "Escape") {
                setOpenDropdown(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 600); // Tailwind md breakpoint
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const searchFilter = (input) => {
        const query = input.toLowerCase();

        if (!query) {
            setFilteredMenu([]);
            return;
        }

        const results = [];

        sideMenu.forEach(menu => {
            if (menu.link && menu.title.toLowerCase().includes(query)) {
                results.push(menu);
            }

            if (menu.submenu) {
                menu.submenu.forEach(sub => {
                    if (sub.title.toLowerCase().includes(query)) {
                        results.push({
                            ...sub,
                            parent: menu.title,
                        });
                    }
                });
            }
        });
        console.log(results)
        setFilteredMenu(results);
    };

    return (
        <div className="header-sec-wrapper px-4 pt-5">
            <header id="header-sec" className=" flex w-full max-w-[1400px] bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] rounded-[5px] mx-auto py-2 px-3 sm:px-5 relative">
                <div onClick={() => setMobileMenuActive(true)} className="header-menu-icon-wrapper me-auto flex items-center text-[20px] lg:hidden cursor-pointer ">
                    <MaskImage url="/icons/menu.svg" w="1.5em" h="1.5em" bg="var(--text-dark-1)" />
                </div>
                <div ref={searchRef} className="header-search-wrapper flex items-center text-[18px] sm:text-[20px] gap-2 md:relative lg:mx-0 lg:me-auto mx-auto">
                    <label htmlFor="search-header" className=" hidden items-center sm:flex cursor-pointer ">
                        <MaskImage url="/icons/search.svg" w="1em" h="1em" bg="var(--text-2)" />
                    </label>
                    <input id="search-header" onFocus={() => setOpenDropdown(prev => prev === 'search' ? null : 'search')} onChange={(e) => searchFilter(e.target.value)} type="text" placeholder={isMobile ? "Search here..." : "Search  [CTRL + K]"} className="header-search-input font-medium ms-2 outline-none bg-[var(--bg-w)] text-[var(--text-dark)] text-[.8em] w-full" />
                    <div className={`${openDropdown === 'search' ? 'block' : 'hidden'} shadow-[0px_0px_10px_rgba(0,0,0,0.1)]  text-[17px] search-result-wrapper md:w-[320px] p-3 rounded-[5px] bg-[var(--bg-w)] w-full absolute left-0 top-[120%] md:top-[150%]`}>
                        {filteredMenu.length > 0 ? (
                            filteredMenu.map((data, index) => (
                                <a
                                    key={index}
                                    href={data.link}
                                    className="search-result flex items-center gap-3 py-2 px-4 text-[var(--text-dark)] hover:text-[var(--primary-color)] cursor-pointer bg-[var(--bg-w)] hover:bg-[var(--hover)] hover:shadow-[0px_0px_1px_rgba(0,0,0,0.1)] rounded-[6px]"
                                >
                                    <MaskImage
                                        url={data.icon || "/icons/home.svg"}
                                        w="1em"
                                        h="1em"
                                        bg="var(--text-dark)"
                                        hBg="var(--primary-color)"
                                        hL="2"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-[.8em]">{data.title}</span>
                                        {data.parent && (
                                            <span className="text-[.7em] opacity-60">
                                                {data.parent}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            ))

                        ) : (
                            <a

                                className="search-result flex items-center gap-3 py-2 px-4 text-[var(--text-dark)] bg-[var(--bg-w)]   rounded-[6px]"
                            >
                                <MaskImage
                                    url={"/icons/home.svg"}
                                    w="1em"
                                    h="1em"
                                    bg="var(--text-dark)"

                                />
                                <div className="flex flex-col">
                                    <span className="text-[.8em]">No Result</span>

                                </div>
                            </a>
                        )}
                    </div>
                </div>
                <div className="header-data-wrapper w-max flex items-center gap-1">
                    <div ref={modeRef} className="mode-change-wrapper text-[16px] md:relative">
                        <div onClick={() => setOpenDropdown(prev => prev === 'mode' ? null : 'mode')} className={`relative flex items-center ${openDropdown === 'mode' ? 'bg-[var(--hover)] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]' : 'bg-[var(--bg-w)]'} justify-center  hover:bg-[var(--hover)] hover:shadow-[0px_0px_1px_rgba(0,0,0,0.1)] w-[37px] h-[37px] rounded-full cursor-pointer`}>
                            <MaskImage url={modesActiveIcon.icon} w="1.5em" h="1.5em" bg="var(--text-dark-1)" />
                        </div>
                        <div className={`mode-change-indicator shadow-[0px_0px_10px_rgba(0,0,0,0.1)] md:w-[300px] w-full bg-[var(--bg-w)] ${openDropdown === 'mode' ? 'block' : 'hidden'} flex flex-col gap-1 absolute right-0 top-[120%] md:top-[150%] rounded-[5px] p-2 pb-3 text-[16px] text-[var(--text-dark)]`}>
                            <div className="flex w-full gap-1">
                                {modes.map((mode, index) => (
                                    <div key={index} onClick={() => { setModeSet(mode.name); setOpenDropdown(null) }} className={`mode-change flex items-center w-[50%] gap-3 py-2 px-4  cursor-pointer ${mode.name === modeSet ? 'active' : 'bg-[var(--bg-w)] hover:bg-[var(--hover)] hover:shadow-[0px_0px_1px_rgba(0,0,0,0.1)]'}  rounded-[6px]`}>
                                        <MaskImage url={mode.icon} w="1.2em" h="1.2em" bg="var(--text-dark-1)" />
                                        <span className="text-[var(--text-dark)]">{mode.name.charAt(0).toUpperCase() + mode.name.slice(1)}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[var(--text-dark)] text-[.7em] mt-4 font-bold">Primary Colors</p>
                            <div className="color-selector-mode grid grid-cols-6 gap-3 md:gap-2">
                                {colorSet.map(color => (
                                    <div onClick={() => setColorData(color.title)}
                                        key={color.title}
                                        className={`color-select ${colorData == color.title ? "selected" : "not-selected"} flex cursor-pointer aspect-square p-[3px] border-[2px] hover:border-[var(--text-dark)] duration-200 rounded-full `}
                                        style={{ borderColor: colorData === color.title ? color.color : "var(--text-3)" }}>
                                        <span className={`rounded-full w-full h-full `} style={{ backgroundColor: color.color }}></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div ref={notificationRef} className="notification-wrapper text-[16px] md:relative">
                        <div onClick={() => setOpenDropdown(prev => prev === 'notification' ? null : 'notification')} className={`notification-icon-wrapper relative flex items-center justify-center ${openDropdown === 'notification' ? 'bg-[var(--hover)] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]' : 'bg-[var(--bg-w)]'} hover:bg-[var(--hover)] w-[37px] h-[37px] rounded-full cursor-pointer`}>
                            <MaskImage url="/icons/notification.svg" w="1.5em" h="1.5em" bg="var(--text-dark-1)" />
                        </div>
                        <div className={`notification-sec-wrapper shadow-[0px_0px_10px_rgba(0,0,0,0.1)] md:w-[320px] w-full bg-[var(--bg-w)] ${openDropdown === 'notification' ? 'block' : 'hidden'}  flex flex-col  absolute right-0 top-[120%] md:top-[150%] rounded-[5px]  text-[15px] text-[var(--text-dark)]`}>
                            <div className="border-b border-[var(--hover)] py-4 px-4 flex items-center gap-3">
                                <p className="m-0 text-[var(--text-dark)] font-medium text-[.95em]">Notification</p>
                                <span className="ms-auto notification-count text-[.8em] font-semibold text-[var(--primary-color)] px-3 py-1 rounded-[5px]">{notifyData.length} New</span>
                                <div onClick={markAllAsRead}>
                                    <MaskImage url="/icons/message.svg" w="1.4em" h="1.4em" bg="var(--text-dark-1)" />
                                </div>

                            </div>
                            <div className="notification-content-wrapper-parent flex flex-col ">
                                {notifyData.map((data) => {
                                    const ui = buildNotificationUI(data);
                                    return (
                                        <div className="relative notification-content-wrapper" key={data._id}>
                                            <a href={ui.link} onClick={() => markAsRead(data._id)} className={`notification-content ${data.isRead == true ? "" : "new"} relative border-b border-[var(--hover)] bg-[var(--bg-w)] hover:bg-[var(--hover)] flex gap-3 px-4 py-3`}>
                                                <div className="profile-image-wrapper w-[35px] h-[35px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]  rounded-full  relative cursor-pointer">
                                                    <img src={ui.image} className="absolute w-full h-full left-0 top-0 object-cover rounded-full" alt="" />
                                                </div>
                                                <div className="profile-content">
                                                    <h2 className="text-[var(--text-dark)] text-[.8em] font-bold">{ui.title ? ui.title.charAt(0).toUpperCase() + ui.title.slice(1) : ""}</h2>
                                                    <p className="text-[var(--text-dark-2)] opacity-70 font-medium text-[.75em]">{ui.message}</p>
                                                    <p className="text-[var(--text-2)] opacity-80 font-medium text-[.6em] mt-2">{formatRelativeTime(data.createdAt)}</p>
                                                </div>
                                            </a>
                                            <div
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    markAsRead(data._id);
                                                    removeNotification(data._id);
                                                }}
                                                className="notification-cut absolute top-[50%] right-[12px] translate-y-[-50%] cursor-pointer rounded-full">
                                                <MaskImage url="/icons/close.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="px-2 py-3">
                                <Link to={"/profile?tab=notification"} className={`flex items-center justify-center gap-3 py-2 px-4  cursor-pointer bg-[var(--primary-color)]  shadow-[0px_0px_10px_rgba(0,0,0,0.3)] hover:shadow-[0px_0px_10px_rgba(0,0,0,0.4)] duration-300  rounded-[4px]`}>
                                    <span className="text-[var(--text-light)] text-[.8em]">View All Notifications</span>
                                    <MaskImage url="/icons/notification.svg" w=".8em" h=".8em" bg="var(--text-light)" />
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div ref={profileRef} className="profiler-wrapper md:relative rounded-full ms-1 text-[16px]">
                        <div onClick={() => setOpenDropdown(prev => prev === 'profile' ? null : 'profile')} className="profile-image-wrapper w-[40px] h-[40px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] bg-[var(--bg-w)] rounded-full  relative cursor-pointer">
                            <img src={avatarPreview || "server/uploads/default-avatar.jpg"} className="absolute w-full h-full left-0 top-0 object-cover rounded-full" alt="" />
                        </div>
                        <div className={`${openDropdown === 'profile' ? 'block' : 'hidden'} profile-sec-wrapper shadow-[0px_0px_10px_rgba(0,0,0,0.1)] md:w-[220px] w-full bg-[var(--bg-w)]  flex flex-col gap-1 absolute right-0 top-[120%] md:top-[150%] rounded-[5px] py-2 text-[16px] text-[var(--text-dark)]`}>
                            <div className="px-2">
                                <div className={`profile-content-wrapper flex items-center gap-3 py-2 px-4  cursor-pointer  rounded-[6px] bg-[var(--bg-w)] hover:bg-[var(--hover)] hover:shadow-[0px_0px_1px_rgba(0,0,0,0.1)]`}>
                                    <div className="profile-image-wrapper w-[45px] h-[45px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] bg-[var(--bg-w)] rounded-full  relative cursor-pointer">
                                        <img src={avatarPreview || "server/uploads/default-avatar.jpg"} className="absolute w-full h-full left-0 top-0 object-cover rounded-full" alt="" />
                                    </div>
                                    <div className="profile-content dd">
                                        <h2 className="text-[var(--text-dark)] font-semibold">{capitalizeWords(name)}</h2>
                                        <p className="text-[var(--text-2)] font-semibold text-[.88em]">{capitalizeWords(role)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-y border-[var(--hover)] py-2">
                                <div className="px-2">
                                    <Link to={"/profile?tab=profile"} className={`flex items-center gap-3 py-2 px-4  cursor-pointer bg-[var(--bg-w)] hover:bg-[var(--hover)] hover:shadow-[0px_0px_1px_rgba(0,0,0,0.1)]  rounded-[6px]`}>
                                        <MaskImage url="/icons/user.svg" w="1.4em" h="1.4em" bg="var(--text-dark)" />
                                        <span className="text-[var(--text-dark)] text-[.95em]">My Profile</span>
                                    </Link>
                                    <Link to={"/profile?tab=notification"} className={`flex items-center gap-3 py-2 px-4  cursor-pointer bg-[var(--bg-w)] hover:bg-[var(--hover)] hover:shadow-[0px_0px_1px_rgba(0,0,0,0.1)]  rounded-[6px]`}>
                                        <MaskImage url="/icons/notification.svg" w="1.4em" h="1.4em" bg="var(--text-dark)" />
                                        <span className="text-[var(--text-dark)] text-[.95em]">Notification</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="px-2 pt-3">
                                <button
                                    onClick={handleLogout}
                                    className={`flex items-center justify-center gap-3 py-[5px] px-4 w-full cursor-pointer bg-[var(--acc-1)]  shadow-[0px_0px_10px_rgba(255,76,81,0.4)] hover:shadow-[0px_0px_10px_rgba(255,76,81,0.5)] duration-300  rounded-[4px]`}
                                >
                                    <span className="text-[var(--text-light)] text-[.9em]">Logout</span>
                                    <MaskImage url="/icons/logout.svg" w="1em" h="1em" bg="var(--text-light)" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>

    )
}
export default Header;
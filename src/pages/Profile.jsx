import { Link } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import { useState, useEffect, useRef } from "react";
import { authAPI, getUser, notificationAPI, formatMonthYear, formatRelativeTime, capitalizeWords } from "../utils/api";
import { buildNotificationUI } from "../utils/notificationUI";
import { useSearchParams } from "react-router-dom";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";



export default function Profile() {
    const navigate = useNavigate();

    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab") || "profile";
    const [tab, setTab] = useState(tabFromUrl);
    useEffect(() => {
        const t = searchParams.get("tab") || "profile";
        setTab(t);
    }, [searchParams]);

    const changeTab = (newTab) => {
        setSearchParams({ tab: newTab });
    };


    // user update
    const formRef = useRef(null);
    const user = getUser(); // from your utils

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(user?.role || "");
    const [createdAt, setCreatedAt] = useState(user?.createdAt || "");
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            setLoadingUpdate(true);

            const payload = {
                name,
                email,
                phone
            };

            // only send password if user typed something
            if (password && password.trim() !== "" && password.length >= "6" || password.length == "0") {
                payload.password = password;
            }
            else {
                showToast("Password Must have 6 Character", "error");
                return;
            }

            const res = await authAPI.updateProfile(payload);

            if (res.success) {
                showToast("Profile updated successfully", "success");
                setPassword(""); // clear password field
            } else {
                showToast(res.message || "Failed to update profile", "error");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            showToast("Something went wrong while updating profile", "error");
        } finally {
            setLoadingUpdate(false);
        }
    };
    const handleCancelProfile = () => {
        formRef.current?.reset();
        const user = getUser(); // re-read from storage
        setName(user?.name || "");
        setEmail(user?.email || "");
        setPhone(user?.phone || "");
        setPassword(""); // always clear password
    };
    const handleDeactivateAccount = async (e) => {
        e.preventDefault();

        if (!accDelete) {
            showToast("Please confirm account deactivation", "error");
            return;
        }

        try {
            setLoadingUpdate(true);
            const payload = {
                isActive: false
            };

            const res = await authAPI.updateProfile(payload);
            if (res.success) {
                showToast("Account deactivated successfully", "success");
                authAPI.logout();
                navigate("/login");
            } else {
                showToast(res.message || "Failed to deactivate account", "error");
            }
        } catch (err) {
            console.error("Deactivate error:", err);
            showToast("Something went wrong while deactivating account", "error");
        } finally {
            setLoadingUpdate(false);
        }
    };


    const [accDelete, setAccDelete] = useState(false);
    const [notifyData, setNotifyData] = useState([])


    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage
            };
            const response = await notificationAPI.getAll(params);
            console.log(response)
            if (response.success) {
                console.log(response.data);
                setNotifyData(response.data || []);
                if (response.pagination) {
                    setPagination(response.pagination);
                }

                setLoading(false);
            } else {
                showToast(response.message || "Failed to fetch Notification", "error");
                setLoading(false);
            }
        } catch (err) {
            console.error("Error fetching links:", err);
            showToast("An error occurred while fetching links", "error");
        } finally {
            setLoadingUpdate(false);
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
    // user notification
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });


    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.pages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchNotifications();
    }, [currentPage, itemsPerPage]);



    // profile image
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? "/server" + user.avatar : "");

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file)); // instant preview

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            setLoadingUpdate(true);

            const res = await authAPI.uploadAvatar(formData);

            if (res.success) {
                showToast("Profile photo updated", "success");

                // update local user
                const updatedUser = { ...getUser(), avatar: res.data.avatar };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                setAvatarPreview("server/" + res.data.avatar);
                window.location.reload();
            } else {
                showToast(res.message || "Upload failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Upload error", "error");
        } finally {
            setLoadingUpdate(false);
        }
    };

    const handleRemoveImage = async () => {
        try {
            setLoadingUpdate(true);

            const formData = new FormData(); // empty

            const res = await authAPI.uploadAvatar(formData);

            if (res.success) {
                showToast("Profile photo removed", "success");

                const updatedUser = { ...getUser(), avatar: null };
                localStorage.setItem("user", JSON.stringify(updatedUser));

                setAvatarPreview(null);
                window.location.reload();
            } else {
                showToast(res.message || "Failed", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Remove error", "error");
        } finally {
            setLoadingUpdate(false);
        }
    };




    return (
        <div className="px-4 mt-6">
            <div className="flex-1 mt-5 w-full max-w-[1400px] mx-auto ">
                <div className="grid grid-cols-12 gap-6">
                    <div className="min-h-[350px] col-span-12  rounded-[6px] isolate relative gap-10 flex md:flex-row flex-col md:items-end justify-end md:justify-between p-5 overflow-hidden w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px] md:text-[18px]  lg:text-[17px] xl:text-[20px]">
                        <div className="profile-banner z-[-1] absolute w-full md:h-[240px] sm:h-[130px] h-[100px] left-0 top-0">
                            <img className="absolute w-full h-full left-0 top-0 object-cover" src="/header/profile-banner.png" alt="img" />
                        </div>
                        <div className="flex gap-4 sm:items-end w-full sm:flex-row flex-col">
                            <div className="flex  flex-col w-[130px] shrink-0 aspect-square relative border-[5px] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] border-[var(--bg-w)] rounded-[5px]">
                                <img
                                    src={avatarPreview
                                        ? avatarPreview
                                        : "server/uploads/default-avatar.jpg"}
                                    className="absolute w-full h-full left-0 top-0 object-cover"
                                    alt="avatar"
                                />
                            </div>
                            <div className="flex  flex-col gap-3">
                                <h2 className=" text-[1.2em] text-[var(--text-dark)] capitalize font-medium ">{capitalizeWords(name)}</h2>
                                <div className="flex lg:gap-5 gap-2 flex-wrap text-[1em] lg:text-[1em]">
                                    <div className="flex opacity-80 gap-2 items-center">
                                        <span className="">
                                            <MaskImage url="/icons/user-1.svg" w="1.1em" h="1.1em" bg="var(--text-dark)" />
                                        </span>
                                        <span className="text-[var(--text-dark)] text-[.8em]  capitalize">{capitalizeWords(role)}</span>
                                    </div>
                                    <div className="flex opacity-80 gap-2 items-center">
                                        <span className="">
                                            <MaskImage url="/icons/call.svg" w="1em" h="1em" bg="var(--text-dark)" />
                                        </span>
                                        <span className="text-[var(--text-dark)] text-[.75em]  capitalize">{phone}</span>
                                    </div>
                                    <div className="flex opacity-80 gap-2 items-center">
                                        <span className="">
                                            <MaskImage url="/icons/d-t.svg" w="1em" h="1em" bg="var(--text-dark)" />
                                        </span>
                                        <span className="text-[var(--text-dark)] text-[.8em]  capitalize">
                                            Joined {formatMonthYear(createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    id="avatarInput"
                                />
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("avatarInput").click()}
                                    disabled={loadingUpdate}
                                    className="flex text-[.7em] cursor-pointer capitalize w-max text-[var(--text-light)] font-semibold  items-center justify-center bg-[var(--primary-color)] py-2 px-5 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300">
                                    {loadingUpdate ? "Uploading..." : "Upload new photo"}
                                </button>
                                <button
                                    onClick={() => handleRemoveImage()}
                                    type="submit"
                                    className="flex text-[.7em] cursor-pointer capitalize w-max text-[var(--text-2)] font-bold  items-center justify-center bg-[var(--text-3)] py-2 px-5 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--text-3)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--text-2)_10%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300">
                                    reset
                                </button>
                            </div>
                            <span className="text-[.58em] font-semibold text-[var(--text-dark)]">Allowed JPG, GIF or PNG. Max size of 800K</span>
                        </div>
                    </div>
                </div>
                <div className="flex my-6 gap-4 text-[20px]">
                    <button
                        onClick={() => changeTab("profile")}
                        type="submit"
                        className={`flex text-[.7em] gap-2 cursor-pointer capitalize w-max ${tab == "profile" ? "text-[var(--text-light)] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))]" : "text-[var(--text-dark)] opacity-80 hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--text-dark)_10%,rgba(255,255,255,0))]"}  font-semibold  items-center justify-center ] py-2 px-5 rounded-[5px]  hover:translate-y-[-2px] duration-300`}>
                        <span className="">
                            <MaskImage url="/icons/user-1.svg" w="1.45em" h="1.45em" bg={tab == "profile" ? "var(--text-light)" : "var(--text-dark)"} />
                        </span>
                        <span className="text-[1.1em]">profile</span>
                    </button>
                    <button
                        onClick={() => changeTab("notification")}
                        type="submit"
                        className={`flex text-[.7em] gap-2 cursor-pointer capitalize w-max ${tab == "notification" ? "text-[var(--text-light)] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))]" : "text-[var(--text-dark)] opacity-80 hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--text-dark)_10%,rgba(255,255,255,0))]"}  font-semibold  items-center justify-center ] py-2 px-5 rounded-[5px]  hover:translate-y-[-2px] duration-300`}>
                        <span className="">
                            <MaskImage url="/icons/notification.svg" w="1.45em" h="1.45em" bg={tab == "notification" ? "var(--text-light)" : "var(--text-dark)"} />
                        </span>
                        <span className="text-[1.1em]">notification</span>
                    </button>

                </div>
                <div className={`grid grid-cols-12 ${tab == "profile" ? "" : "hidden"} gap-6`}>
                    <div className="create-short-link-form-wrapper col-span-12 md:col-span-6 bg-[var(--bg-w)] w-full  rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-6 text-[20px]">
                        <h2 className="text-[var(--text-dark)] text-[1em] font-semibold capitalize">profile settings</h2>
                        <p className="text-[var(--text-dark)] text-[.6em] capitalize">Change profile settings here</p>
                        <form ref={formRef} className="grid grid-cols-1 mt-8 gap-6" onSubmit={handleUpdateProfile}>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] text-[.85em]">
                                        <MaskImage url="/icons/user-1.svg" w="1.2em" h="1.2em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="name" className="text-[.66em] text-[var(--text-dark)] font-semibold capitalize">Name</label>
                                </div>
                                <input type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    id="name"
                                    value={name}
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input  placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 flex items-center justify-center "
                                    placeholder={name == "" ? "Name" : name} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] text-[.85em]">
                                        <MaskImage url="/icons/call.svg" w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="phone" className="text-[.66em] text-[var(--text-dark)] font-semibold capitalize">phone number</label>
                                </div>
                                <input type="number"
                                    onChange={(e) => setPhone(e.target.value)}
                                    id="phone"
                                    value={phone}
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input  placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 flex items-center justify-center "
                                    placeholder={phone == "" ? "Phone" : phone} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] text-[.85em]">
                                        <MaskImage url="/icons/mail.svg" w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="email" className="text-[.66em] text-[var(--text-dark)] font-semibold capitalize">email address</label>
                                </div>
                                <input type="email"
                                    id="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input  placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 flex items-center justify-center "
                                    placeholder={email == "" ? "Email Address" : email} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] text-[.85em]">
                                        <MaskImage url="/icons/password.svg" w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="password" className="text-[.66em] text-[var(--text-dark)] font-semibold capitalize">password</label>
                                </div>
                                <input type="text"
                                    id="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input  placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 flex items-center justify-center "
                                    placeholder="Leave it blank for previous password" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    disabled={loadingUpdate}
                                    type="submit"
                                    className="flex text-[.7em] cursor-pointer capitalize w-max text-[var(--text-light)] font-semibold  items-center justify-center bg-[var(--primary-color)] py-2 px-5 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300">
                                    {loadingUpdate ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    disabled={loadingUpdate}
                                    onClick={handleCancelProfile}
                                    className="flex text-[.7em] cursor-pointer capitalize w-max text-[var(--text-2)] font-bold  items-center justify-center bg-[var(--text-3)] py-2 px-5 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--text-3)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--text-2)_10%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300">
                                    cancel
                                </button>
                            </div>
                        </form>
                    </div >
                    <div className="create-short-link-form-wrapper col-span-12 md:col-span-6 h-max bg-[var(--bg-w)] w-full  rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-6 text-[20px]">
                        <h2 className="text-[var(--text-dark)] text-[1em] font-semibold capitalize">Delete Account</h2>
                        <div className="bg-[#ff9f4330] p-4 rounded-[8px] flex flex-col mt-5">
                            <h2 className="text-[#ff9f43] text-[.8em] font-semibold">Are you sure you want to delete your account?</h2>
                            <p className="text-[#ff9f43] text-[.6em] font-semibold">Once you delete your account, there is no going back. Please be certain.</p>
                        </div>
                        <form className="grid grid-cols-1 mt-5 gap-6">
                            <div className="flex  gap-2">
                                <input
                                    checked={accDelete}
                                    onChange={(e) => setAccDelete(e.target.checked)}
                                    type="checkbox"
                                    id="password"
                                    style={{ accentColor: "#ff4c51", border: "#ff4c51 !important" }} />
                                <span className="text-[#ff4c51] text-[.8em]">I confirm my account deactivation</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDeactivateAccount}
                                    type="button"
                                    className={`flex text-[.7em]  cursor-pointer capitalize w-max text-[var(--text-light)] font-semibold  items-center justify-center bg-[#ff4c51] py-2 px-5 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,#ff4c51_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,#ff4c51_70%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300`}>
                                    {loadingUpdate ? "Deactivating..." : "Deactivate Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {loading ?
                    <div className="px-4 mt-6">
                        <div className="flex-1 w-full max-w-[1400px] mx-auto">
                            <div className="flex items-center justify-center h-[60vh]">
                                <div className="text-center">
                                    <div className="text-[var(--text-dark)] text-[1.2em] mb-4">Loading dashboard...</div>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    :
                    <div className={`grid grid-cols-12 ${tab == "notification" ? "" : "hidden"} gap-6`}>
                        <div className="col-span-12 bg-[var(--bg-w)] flex flex-col  w-full  rounded-[8px] overflow-hidden shadow-[0px_0px_10px_rgba(0,0,0,0.1)] text-[20px]">
                            <div className="flex shadow-[0px_0px_10px_rgba(0,0,0,0.1)] relative z-[10] p-5 px-6 justify-between items-center">
                                <h2 className="text-[var(--text-dark)] text-[1em] font-semibold capitalize">Notifications</h2>
                                <button
                                    type="submit"
                                    className={`flex text-[.7em] gap-2 cursor-pointer capitalize w-max text-[var(--text-light)] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))]  font-semibold  items-center justify-center ] py-2 px-5 rounded-[5px]  hover:translate-y-[-2px] duration-300`}>
                                    <span className="">
                                        <MaskImage url="/icons/mark-as-read.svg" w="1.45em" h="1.45em" bg="var(--text-light)" />
                                    </span>
                                    <span onClick={markAllAsRead} className="text-[1.1em] hidden sm:flex">Marks all as read</span>
                                </button>
                            </div>
                            <div className="notification-content-wrapper-parent flex flex-col text-[18px]">
                                {notifyData.map((data, idx) => {
                                    const ui = buildNotificationUI(data);
                                    return (
                                        <div className="relative notification-content-wrapper" key={data._id}>
                                            <a href={ui.link} onClick={() => markAsRead(data._id)} className={`notification-content ${data.isRead == true ? "" : "new"} relative border-b border-[var(--hover)] bg-[var(--bg-w)] hover:bg-[var(--hover)] flex gap-3 px-6 py-3`}>
                                                <div className="profile-image-wrapper w-[35px] h-[35px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]  rounded-full  relative cursor-pointer">
                                                    <img src={ui.image} className="absolute w-full h-full left-0 top-0 object-cover rounded-full" alt="" />
                                                </div>
                                                <div className="profile-content">
                                                    <h2 className="text-[var(--text-dark)] text-[.8em] font-bold">{ui.title ? ui.title.charAt(0).toUpperCase() + ui.title.slice(1) : ""}</h2>
                                                    <p className="text-[var(--text-dark-2)] opacity-70 font-medium text-[.75em]">{ui.message}</p>
                                                    <p className="text-[var(--text-2)] opacity-80 font-medium text-[.7em] mt-2">{formatRelativeTime(data.createdAt)}</p>
                                                </div>
                                            </a>
                                            {data.isRead
                                                ?
                                                <div className="notification-cut absolute top-[50%] right-[12px] translate-y-[-50%] cursor-pointer rounded-full">
                                                    <MaskImage url={"/icons/read.svg"} w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                                </div>
                                                :
                                                <div className="notification-cut absolute top-[50%] right-[12px] translate-y-[-50%] cursor-pointer rounded-full">
                                                    <MaskImage url={"/icons/unread.svg"} w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                                </div>
                                            }

                                        </div>
                                    )
                                })}
                                {/* Pagination */}

                            </div>
                            {notifyData.length > 0 && (
                                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 lg:p-5 p-3 py-4  border-t border-[var(--border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[var(--text-dark-1)] text-[.7em]">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} entries
                                        </span>
                                    </div>
                                    <div className="flex sm:flex-row flex-col md:items-center   md:justify-between   gap-6 md:gap-4">
                                        {/* Items per page selector */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-[var(--text-dark)] text-[.75em]">Show:</label>
                                            <div className="relative w-[100px]">
                                                <select
                                                    value={itemsPerPage}
                                                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                                                    className="appearance-none bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] create-input rounded-[6px] p-[6px] px-2 border border-[var(--border)] w-full"
                                                >
                                                    <option value="6">6</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                                    <MaskImage
                                                        url="/icons/arrow-down.svg"
                                                        w="1em"
                                                        h="1em"
                                                        bg="var(--text-dark-1)"
                                                    />
                                                </span>
                                            </div>
                                            <span className="text-[var(--text-dark)] text-[.7em]">per page</span>
                                        </div>

                                        {/* Pagination buttons */}
                                        <div className="flex items-center gap-2 mx-auto">
                                            <button
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                                className={`w-[30px] h-[30px] rounded-[5px] text-[.85em] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover-2)_60%,#ffffff00)]`}
                                                style={{
                                                    backgroundColor: currentPage === 1 ? 'var(--hover)' : 'var(--primary-color)',
                                                    color: currentPage === 1 ? 'var(--text-dark)' : 'var(--text-light)'
                                                }}
                                            >
                                                &laquo;
                                            </button>

                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className={`w-[30px] h-[30px] rounded-[5px] text-[.85em] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover-2)_60%,#ffffff00)]`}
                                                style={{
                                                    backgroundColor: currentPage === 1 ? 'var(--hover)' : 'var(--primary-color)',
                                                    color: currentPage === 1 ? 'var(--text-dark)' : 'var(--text-light)'
                                                }}
                                            >
                                                &lsaquo;
                                            </button>

                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(3, pagination.pages) }, (_, i) => {
                                                let pageNum;
                                                if (pagination.pages <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 2) {
                                                    // near the start
                                                    pageNum = i + 1;
                                                } else if (currentPage >= pagination.pages - 1) {
                                                    // near the end
                                                    pageNum = pagination.pages - (3 - 1) + i;
                                                } else {
                                                    // in the middle, center current page
                                                    pageNum = currentPage - 1 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`w-[30px] h-[30px] rounded-[5px] text-[.80em]  transition-all ${currentPage === pageNum
                                                            ? 'text-[var(--text-light)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_60%,#ffffff00)]'
                                                            : 'text-[var(--text-dark)] bg-[var(--hover)] hover:bg-[var(--border)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover)_60%,#ffffff00)]'
                                                            }`}
                                                        style={{
                                                            backgroundColor: currentPage === pageNum ? 'var(--primary-color)' : 'var(--hover)'
                                                        }}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === pagination.pages}
                                                className={`w-[30px] h-[30px] rounded-[5px] text-[.85em] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover-2)_60%,#ffffff00)]`}
                                                style={{
                                                    backgroundColor: currentPage === pagination.pages ? 'var(--hover)' : 'var(--primary-color)',
                                                    color: currentPage === pagination.pages ? 'var(--text-dark)' : 'var(--text-light)'
                                                }}
                                            >
                                                &rsaquo;
                                            </button>

                                            <button
                                                onClick={() => handlePageChange(pagination.pages)}
                                                disabled={currentPage === pagination.pages}
                                                className={`w-[30px] h-[30px] rounded-[5px] text-[.85em] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover-2)_60%,#ffffff00)]`}
                                                style={{
                                                    backgroundColor: currentPage === pagination.pages ? 'var(--hover)' : 'var(--primary-color)',
                                                    color: currentPage === pagination.pages ? 'var(--text-dark)' : 'var(--text-light)'
                                                }}
                                            >
                                                &raquo;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
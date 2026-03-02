import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import { formAPI, capitalizeWords } from "../utils/api";
import { showToast } from "../utils/toast";
import { DatePicker, Grid } from "antd";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
import { useSearchParams } from "react-router-dom";

export default function ManageForms() {
    const [openMenuId, setOpenMenuId] = useState(null);
    useEffect(() => {
        const close = () => setOpenMenuId(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    // url params
    const [searchParams, setSearchParams] = useSearchParams();

    const navigate = useNavigate();
    const location = useLocation();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
    const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");
    const [dateRange, setDateRange] = useState(searchParams.get("startDate") && searchParams.get("endDate")
        ? [dayjs(searchParams.get("startDate")), dayjs(searchParams.get("endDate"))]
        : null);
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(parseInt(newItemsPerPage));
        setCurrentPage(1);
    };

    const presets = [
        {
            label: "Today",
            value: [dayjs(), dayjs()],
        },
        {
            label: "Yesterday",
            value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
        },
        {
            label: "Last 7 Days",
            value: [dayjs().subtract(6, "day"), dayjs()],
        },
        {
            label: "Last 30 Days",
            value: [dayjs().subtract(29, "day"), dayjs()],
        },
        {
            label: "This Month",
            value: [dayjs().startOf("month"), dayjs().endOf("month")],
        },
        {
            label: "Last Month",
            value: [
                dayjs().subtract(1, "month").startOf("month"),
                dayjs().subtract(1, "month").endOf("month"),
            ],
        },
        {
            label: "All Time",
            value: [dayjs("1926-01-16"), dayjs("2126-01-16")],
        },
    ];

    const urlPramsData = () => {
        const params = {};

        if (filterStatus !== "all") params.status = filterStatus;
        if (searchTerm.trim() !== "") params.search = searchTerm.trim();
        if (dateRange) {
            params.startDate = dateRange[0].toISOString();
            params.endDate = dateRange[1].toISOString();
        }
        params.page = currentPage;
        setSearchParams(params);
    }

    useEffect(() => {
        urlPramsData();
    }, [searchTerm, filterStatus, dateRange, currentPage]);

    useEffect(() => {
        fetchForms();
    }, []);

    // Refetch forms when navigating to this page
    useEffect(() => {
        if (location.pathname === "/manage-forms") {
            fetchForms();
        }
    }, [location.pathname]);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                trash: "no",
                startDate: dateRange?.[0]?.toISOString(),
                endDate: dateRange?.[1]?.toISOString(),
            };

            if (filterStatus === "all") {
            } else {
                params.isActive = filterStatus === "active" ? "true" : "false";
            }

            if (dateRange && dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].toISOString();
                params.endDate = dateRange[1].toISOString();
            }

            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm.trim();
            }

            // Remove undefined values
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

            console.log("Fetching forms with params:", params);
            const response = await formAPI.getAll(params);
            console.log("Forms API response:", response);

            if (response.success) {
                const formsData = response.data || [];
                console.log("Forms received:", formsData.length);
                setForms(formsData.filter(f => f.inTrash == "no"));
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else {
                showToast(response.message || "Failed to fetch forms", "error");
            }
        } catch (err) {
            console.error("Error fetching forms:", err);
            showToast("An error occurred while fetching forms", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, [searchTerm, filterStatus, dateRange, currentPage, itemsPerPage]);

    const handleDelete = async (formId) => {
        if (!window.confirm("Are you sure you want to delete this form? It will be moved to Deleted Forms.")) {
            return;
        }

        try {
            const response = await formAPI.delete(formId);
            if (response.success) {
                setForms(forms.filter(form => form._id !== formId));
                showToast("Form deleted successfully! You can restore it from Deleted Forms.", "success");
            } else {
                showToast(response.message || "Failed to delete form", "error");
            }
        } catch (err) {
            console.error("Error deleting form:", err);
            showToast("An error occurred while deleting the form", "error");
        }
    };

    const handleToggleStatus = async (formId, currentValue, type) => {
        try {
            let updateData = {};
            let successMessage = "";

            if (type === "active") {
                updateData = { isActive: !currentValue };
                successMessage = !currentValue ? "activated" : "deactivated";
            }

            if (type === "trash") {
                updateData = { inTrash: currentValue === "yes" ? "no" : "yes" };
                successMessage = "deleted";
            }

            const response = await formAPI.update(formId, updateData);

            if (response.success) {
                showToast(`Form ${successMessage} successfully!`, "success");
                fetchForms();
            } else {
                showToast(response.message || "Failed to update form", "error");
            }
        } catch (err) {
            console.error("Error updating form:", err);
            showToast("An error occurred while updating the form", "error");
        }
    };

    return (
        <div className="px-4 mt-6">
            <div className="flex-1 w-full max-w-[1400px] mx-auto">
                <div className="flex md:flex-row flex-col justify-between md:items-center mb-6 gap-5">
                    <div>
                        <h1 className="text-[var(--text-dark)] text-[1.5em] font-semibold mb-1">Manage Forms</h1>
                        <p className="text-[var(--text-dark)] text-[.85em] opacity-75">View and manage all your forms</p>
                    </div>
                    <Link
                        to="/create-form"
                        className="flex gap-2 w-max text-[1em]  cursor-pointer text-[var(--text-light)] font-semibold  items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                    >
                        <MaskImage url="/icons/create-link.svg" w="1.5em" h="1.5em" bg="var(--text-light)" />
                        Create New Form
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-[var(--bg-w)] rounded-[6px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] text-[20px] overflow-hidden">
                    <form className="flex flex-col shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-5 relative z-2" onSubmit={(e) => { e.preventDefault(); fetchForms(); }}>
                        <div className="flex md:flex-row flex-col justify-between gap-2 md:items-center">
                            <h2 className="text-[.75em] text-[var(--text-dark)] font-semibold uppercase">RECENT FORM DETAILS</h2>
                            <div className="search-input-wrapper flex w-full md:max-w-[350px] justify-between p-1 ps-4 rounded-[10px]">
                                <input
                                    type="text"
                                    id="input-search"
                                    placeholder="e.g search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="md:w-[80%] w-full border-none shadow-none outline-none text-[.8em] text-[var(--primary-color)] placeholder:font-medium placeholder:text-[color-mix(in_srgb,var(--text-dark)_35%,rgba(255,255,255,0))]"
                                />
                                <label htmlFor="input-search" className="rounded-full cursor-pointer hover:bg-[var(--hover)] p-2">
                                    <MaskImage url="/icons/search.svg" w=".9em" h=".9em" bg="var(--primary-color)" />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-8 xl:grid-cols-10 gap-4 mt-5 items-end pb-3">
                            <div className="col-span-12 md:col-span-2">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-end gap-1">
                                        <label htmlFor="" className="text-[.58em] text-[var(--text-dark)] font-bold uppercase leading-4">STATUS</label>
                                    </div>
                                    <div className="flex w-full gap-2">
                                        <div className="relative w-full">
                                            <select
                                                id="social-media-status"
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="appearance-none select-wrapper border-none shadow-none outline-none bg-[var(--bg-w)] create-input w-full rounded-[8px] p-[9px] px-3 text-[.7em] text-[var(--text-dark-1)]"
                                            >
                                                <option value="all">All</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                                <MaskImage
                                                    url="/icons/arrow-down.svg"
                                                    w="1.2em"
                                                    h="1.2em"
                                                    bg="var(--primary-color)"
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-2 translate-y-[-1px]">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-end gap-1">
                                        <label htmlFor="" className="text-[.58em] text-[var(--text-dark)] font-bold uppercase leading-4">Date</label>
                                    </div>
                                    <div className="flex w-full gap-2">
                                        <RangePicker
                                            presets={presets}
                                            format="DD MMM, YYYY"
                                            allowClear={false}
                                            showNow={false}
                                            value={dateRange}
                                            onChange={(dates) => setDateRange(dates)}
                                            className="w-full date-range-wrapper p-[9px] px-3"
                                            dropdownClassName={isMobile ? "single-calendar" : ""}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-1">
                                <button
                                    type="button"
                                    onClick={() => urlPramsData()}
                                    className="flex w-full text-[.85em] uppercase cursor-pointer text-[var(--text-light)] font-semibold tracking-[1px] items-center justify-center bg-[var(--primary-color)] py-[6px] rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Forms List */}
                    <div className="bg-[var(--bg-w)]  p-3 lg:px-6 lg:pt-6 pb-0">
                        {loading ? (
                            <div className="flex items-center justify-center h-[60vh]">
                                <div className="text-center">
                                    <div className="text-[var(--text-dark)] text-[1.2em] mb-4">Loading links...</div>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                                </div>
                            </div>
                        ) : forms.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center">
                                <p className="text-[var(--text-dark)] text-[1em] mb-4">No forms found</p>
                                <Link
                                    to="/create-form"
                                    className="flex gap-2 w-max text-[.8em] cursor-pointer text-[var(--text-light)] font-semibold  items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                                >
                                    Create Your First Form
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid grid-cols-12 gap-4 text-[16px]">
                                    {forms.map((form) => (
                                        <div
                                            key={form._id}
                                            className={`border border-[var(--border)] 2xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12 m-0 rounded-[8px]   md:text-[15px] text-[14px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] transition-all duration-300 ${!form.isActive
                                                ? 'opacity-70'
                                                : ''
                                                }`}
                                        >
                                            <div className="flex flex-col min-w-0">
                                                <div className="link-platform-logo-wrapper shadow-[0px_3px_10px_rgba(0,0,0,0.2)] font-semibold text-[var(--text-light)] h-[40px]  flex px-3 items-center bg-[var(--primary-color)] text-[.9em]  rounded-tl-[8px] rounded-tr-[8px] ">
                                                    <p className="whitespace-nowrap overflow-hidden text-ellipsis w-[50%]">ID: {form._id} </p>
                                                </div>
                                                <div className="link-content-wrapper p-4 w-full">
                                                    <div className="flex justify-between items-center">
                                                        <h1 className="text-[var(-text-dark)] font-semibold text-[1.2em]">{capitalizeWords(form.name)}</h1>
                                                        <p className={`text-[var(-text-dark)] text-[.8em] font-semibold p-1 px-3  rounded-[8px] ${form.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}>{form.isActive ? "Active" : "Deactive"}</p>

                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-[var(--text-light)] bg-white-color-mix">
                                                            <MaskImage url={`/icons/field.svg`} w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                                        </span>
                                                        <div className="text-[.8em] text-[var(--text-dark)] flex items-center  font-semibold">
                                                            <span>{form.fields?.length > 1 ? form.fields?.length + " Fields" : form.fields?.length + " Field"}</span>
                                                            <span className="text-[var(--text-light)] bg-white-color-mix ">
                                                                <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                            </span>
                                                            <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                                                            <span className="text-[var(--text-light)] bg-white-color-mix ">
                                                                <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                            </span>
                                                            <span>{form.isActive ? "Active" : "Deactive"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-5 flex-wrap text-[14px]">
                                                        <div
                                                            onClick={() => window.open(`/form/${form._id}`, '_blank')}
                                                            title="View Form"
                                                            className="text-[var(-text-dark)]  cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[.85em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                            <MaskImage url="/icons/view.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                            View
                                                        </div>
                                                        <div
                                                            onClick={() => navigate(`/create-form?edit=${form._id}`)}
                                                            title="Edit Form"
                                                            className="text-[var(-text-dark)]  cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[.85em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                            <MaskImage url="/icons/edit.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                            Edit
                                                        </div>

                                                        <div className="flex items-center justify-center  relative">
                                                            <div onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === form._id ? null : form._id);
                                                            }}
                                                                className="text-[var(-text-dark)] cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[1em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px]"
                                                            >
                                                                <MaskImage url="/icons/three-dot.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                            </div>
                                                            {openMenuId === form._id && (
                                                                <div

                                                                    className={`flex flex-col gap-2 item-center rounded-[5px] p-2 w-[150px] top-0 right-0  translate-y-[-105%] absolute bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]`}>

                                                                    <div
                                                                        onClick={() => handleToggleStatus(form._id, form.isActive, "active")}
                                                                        title={form.isActive ? 'Deactivate Form' : 'Activate Form'}
                                                                        className="text-[var(-text-dark)] cursor-pointer w-full  flex items-center  gap-2 shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[.85em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                                        <MaskImage url="/icons/unread.svg" w="1.3em" h="1.3em" bg={form.isActive ? "#e81224" : "#16c60c"} />
                                                                        {form.isActive ? "Deactivate" : "Activate"}
                                                                    </div>
                                                                    <div
                                                                        onClick={() => handleToggleStatus(form._id, form.isDeleted, "trash")}
                                                                        title="Delete Form"
                                                                        className="text-[#ff4c51] cursor-pointer w-full  flex items-center  gap-2 shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[#ff4c5236] text-[.85em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,#ff4c51_10%,rgba(255,255,255,0))] rounded-[5px] ">
                                                                        <MaskImage url="/icons/delete.svg" w="1.3em" h="1.3em" bg="#ff4c51" />
                                                                        Delete
                                                                    </div>

                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination */}
                                {forms.length > 0 && (
                                    <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 lg:p-5 p-2 py-4  border-t border-[var(--border)]">
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
                                                        <option value="10">10</option>
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
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

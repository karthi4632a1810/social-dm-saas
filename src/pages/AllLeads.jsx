import MaskImage from "../components/MaskImage";
import { DatePicker, Grid } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { leadAPI, formatDate } from "../utils/api";
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
import { useSearchParams } from "react-router-dom";




export default function AllLeads() {
    // url params
    const [searchParams, setSearchParams] = useSearchParams();


    const [detailsBox, setDetailsBox] = useState(false)
    const [leadData, setLeadData] = useState(null)
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        platform: searchParams.get("platform") || "all",
        dateRange: searchParams.get("startDate") && searchParams.get("endDate")
            ? [dayjs(searchParams.get("startDate")), dayjs(searchParams.get("endDate"))]
            : null
    });

    const [selectedRows, setSelectedRows] = useState([]);
    const capitalize = str =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    const screens = useBreakpoint();
    const isMobile = !screens.md;

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
    const columns = [
        { key: "id", label: "ID", width: "70px" },
        { key: "name", label: "Name", icon: "/icons/user-1.svg", color: "#28c76f" },
        { key: "number", label: "Number", icon: "/icons/call.svg", color: "#00bad1" },
        { key: "link", label: "Link Name", icon: "/icons/link.svg", color: "#7367f0" },
        { key: "status", label: "Status", icon: "/icons/status.svg", color: "#ff4c51" },
        { key: "email", label: "E-mail", icon: "/icons/mail.svg", color: "#007bff" },
        { key: "platform", label: "Platform", icon: "/icons/platform.svg", color: "#20c997" },
        { key: "location", label: "Location", icon: "/icons/location.svg", color: "#2092EC" },
        { key: "createdAt", label: "Created at", icon: "/icons/d-t.svg", color: "#fd7e14" }
    ];

    const [itemsPerPage, setItemsPerPage] = useState(3);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });


    useEffect(() => {
        fetchLeads();
    }, [filters, search, currentPage, itemsPerPage]);



    const urlPramsData = () => {
        const params = {};

        if (filters.status !== "all") params.status = filters.status;
        if (filters.platform !== "all") params.platform = filters.platform;
        if (search.trim() !== "") params.search = search.trim();

        if (filters.dateRange) {
            params.startDate = filters.dateRange[0].toISOString();
            params.endDate = filters.dateRange[1].toISOString();
        }

        params.page = currentPage;

        setSearchParams(params);
    }

    useEffect(() => {
        urlPramsData();
    }, [filters, search, currentPage]);

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

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedRows.length} leads?`)) return;

        const res = await leadAPI.bulkDelete(selectedRows);

        if (res.success) {
            setSelectedRows([]);
            fetchLeads();
        }
    };

    const fetchLeads = async () => {
        try {
            setLoading(true);

            const params = {
                status: filters.status !== 'all' ? filters.status : undefined,
                platform: filters.platform !== 'all' ? filters.platform : undefined,
                startDate: filters.dateRange?.[0]?.toISOString(),
                endDate: filters.dateRange?.[1]?.toISOString(),
                search: search.trim() !== "" ? search.trim() : undefined,
                page: currentPage,
                limit: itemsPerPage
            };

            Object.keys(params).forEach(
                key => params[key] === undefined && delete params[key]
            );

            const response = await leadAPI.getAll(params);

            if (response.success) {
                console.log(response.data);
                setRows(
                    response.data.map(lead => ({
                        id: lead._id,
                        name: lead.name,
                        number: lead.number,
                        link: lead.link,
                        linkName: lead.linkId ? lead.linkId.link_name : "Deleted link",
                        status: lead.status,
                        email: lead.email,
                        platform: lead.platform,
                        location: lead.location,
                        createdAt: formatDate(lead.createdAt)
                    }))
                );

                if (response.pagination) {
                    setPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    const handleDateRangeChange = (dates) => {
        setFilters(prev => ({ ...prev, dateRange: dates }));
        setCurrentPage(1);
    };

    const handleLeadClick = async (leadId) => {
        setDetailsBox(true);
        setLeadData(leadId);
        try {
            const response = await leadAPI.getById(leadId);
            if (response.success) {
                console.log(response.data)
                setSelectedLead(response.data);
            }
        } catch (error) {
            console.error('Error fetching lead details:', error);
        }
    };
    const statuses = [
        "pending",
        "contacted",
        "qualified",
        "working",
        "proposal sent",
        "not interested",
        "closed"
    ];

    const handleExportCSV = async () => {
        try {
            const params = {
                status: filters.status !== 'all' ? filters.status : undefined,
                platform: filters.platform !== 'all' ? filters.platform : undefined,
                startDate: filters.dateRange?.[0]?.toISOString(),
                endDate: filters.dateRange?.[1]?.toISOString(),
                search: search.trim() !== "" ? search.trim() : undefined,
                page: 1,
                limit: 100000 // export everything
            };

            Object.keys(params).forEach(
                key => params[key] === undefined && delete params[key]
            );

            const response = await leadAPI.getAll(params);

            if (!response.success || !response.data.length) {
                alert("No data to export");
                return;
            }

            const leads = response.data;

            // CSV Headers
            const headers = [
                "ID",
                "Name",
                "Number",
                "Email",
                "Platform",
                "Status",
                "Location",
                "Link Name",
                "Created At"
            ];

            // CSV Rows
            const rows = leads.map(lead => [
                lead._id,
                lead.name,
                lead.number,
                lead.email,
                lead.platform,
                lead.status,
                lead.location,
                lead.linkId?.link_name || "Deleted link",
                formatDate(lead.createdAt)
            ]);

            const csvContent =
                [headers, ...rows]
                    .map(e => e.map(v => `"${v || ""}"`).join(","))
                    .join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "leads_export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    return (
        <div className="px-4 mt-6">
            <div className="flex-1 w-full max-w-[1400px] mx-auto mt-10">
                <div className={`absolute full-details-wrapper ${detailsBox == true ? "active" : ""}  inset-0 z-50  isolate flex items-center justify-center`}>
                    <div
                        onClick={() => { setDetailsBox(false); setLeadData(null) }}
                        className="absolute inset-0 z-50  bg-black/40 z-[-1]"></div>
                    <div className="bg-[var(--bg-w)] max-w-[500px] z-3  w-full rounded-[8px] overflow-hidden shadow-[0px_0px_10px_rgba(0,0,0,0.1)]  text-[22px] ">
                        <div className="flex gap-2 border-b  border-[var(--hover)]">
                            <div className="flex gap-2 items-center py-4 px-5 bg-[var(--hover)] ">
                                <span
                                    style={{ backgroundColor: `#28c76f30` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/user-1.svg" w="1em" h="1em" bg="#28c76f" />
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-3  w-full px-3">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-dark)] text-[.9em] font-semibold">{selectedLead?.name || 'Loading...'}</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] "> Lead Full Details</p>
                                </div>
                                <div className="flex gap-2 items-center w-[60%] py-[10px] px-5 min-w-0 text-[.7em]">
                                    <div className="relative w-full">
                                        <select
                                            id="social-media"
                                            value={selectedLead?.status || ''}
                                            onChange={async (e) => {
                                                if (selectedLead) {
                                                    await leadAPI.update(selectedLead._id, { status: e.target.value });
                                                    fetchLeads();
                                                    const updated = await leadAPI.getById(selectedLead._id);
                                                    if (updated.success) setSelectedLead(updated.data);
                                                }
                                            }}
                                            className="appearance-none w-full select-wrapper border-none shadow-none  outline-none bg-[var(--bg-w)] create-input  w-full rounded-[8px] p-[5px] px-3  text-[var(--text-dark-1)]"
                                        >
                                            {statuses && statuses.map(status => (
                                                <option key={status} value={status}>{capitalize(status)}</option>
                                            ))}
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
                        <div className="flex gap-2">
                            <div className="flex gap-2 items-center py-4  px-5 bg-[var(--hover)]">
                                <span
                                    style={{ backgroundColor: `#00bad130` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/call.svg" w="1em" h="1em" bg="#00bad1" />
                                </span>
                            </div>
                            <div className="flex justify-between  items-center w-full px-3">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-black)] text-[.5em] font-semibold uppercase">phone</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] "> {selectedLead?.number || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex gap-2 items-center py-4 px-5 bg-[var(--hover)]">
                                <span
                                    style={{ backgroundColor: `#7367f030` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/link.svg" w="1em" h="1em" bg="#7367f0" />
                                </span>
                            </div>
                            <div className="flex justify-between  items-center w-full px-3">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-black)] text-[.5em] font-semibold uppercase">link name</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] ">{selectedLead?.linkId.link_name || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex gap-2 items-center py-4 px-5 bg-[var(--hover)]">
                                <span
                                    style={{ backgroundColor: `#007bff30` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/mail.svg" w="1em" h="1em" bg="#007bff" />
                                </span>
                            </div>
                            <div className="flex justify-between  items-center w-full px-3">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-black)] text-[.5em] font-semibold uppercase">email</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] ">{selectedLead?.email || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex gap-2 items-center py-4 px-5 bg-[var(--hover)]">
                                <span
                                    style={{ backgroundColor: `#20c99730` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/platform.svg" w="1em" h="1em" bg="#20c997" />
                                </span>
                            </div>
                            <div className="flex justify-between  items-center w-full px-3">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-black)] text-[.5em] font-semibold uppercase">platform</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] ">{selectedLead?.platform || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex gap-2 items-center py-4 px-5 bg-[var(--hover)]">
                                <span
                                    style={{ backgroundColor: `#2092EC30` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/location.svg" w="1em" h="1em" bg="#2092EC" />
                                </span>
                            </div>
                            <div className="flex justify-between  items-center w-full px-3">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-black)] text-[.5em] font-semibold uppercase">location</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] ">{selectedLead?.location || ''}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 ">
                            <div className="flex gap-2 items-center py-3 pb-8   px-5 bg-[var(--hover)]">
                                <span
                                    style={{ backgroundColor: `#fd7e1430` }}
                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                    <MaskImage url="/icons/d-t.svg" w="1em" h="1em" bg="#fd7e14" />
                                </span>
                            </div>
                            <div className="flex justify-between  items-center w-full px-3 pb-4">
                                <div className="flex flex-col">
                                    <h2 className="text-[var(--text-black)] text-[.5em] font-semibold uppercase">created At</h2>
                                    <p className="text-[var(--text-dark)] text-[.55em] ">{selectedLead ? formatDate(selectedLead.createdAt) : ''}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex md:flex-row flex-col justify-between md:items-center mb-6 gap-5">
                    <div>
                        <h1 className="text-[var(--text-dark)] text-[1.5em] font-semibold mb-1">Manage Leads</h1>
                        <p className="text-[var(--text-dark)] text-[.85em] opacity-75">View and manage all your Leads</p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="flex gap-2 w-max text-[1em]  cursor-pointer text-[var(--text-light)] font-semibold  items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                    >
                        <MaskImage url="/icons/leads.svg" w="1.5em" h="1.5em" bg="var(--text-light)" />
                        Export Lead
                    </button>
                </div>
                <div id="all-leads" className="all-leads-wrapper bg-[var(--bg-w)] w-full rounded-[6px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]  text-[20px]">
                    <form className="flex flex-col shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-5">
                        <div className="flex md:flex-row flex-col justify-between gap-2 md:items-center">
                            <h2 className="text-[.75em] text-[var(--text-dark)] font-semibold uppercase">RECENT Lead DETAILS</h2>
                            <div className="search-input-wrapper flex  w-full md:max-w-[350px] justify-between p-1 ps-4 rounded-[10px] ">
                                <input
                                    type="text"
                                    id="input-search"
                                    placeholder="e.g search"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value), setCurrentPage(1); }}
                                    className=" w-[80%] border-none shadow-none  outline-none text-[.8em] text-[var(--primary-color)]  placeholder:font-medium placeholder:text-[color-mix(in_srgb,var(--text-dark)_35%,rgba(255,255,255,0))]" />
                                <label htmlFor="input-search" className="rounded-full cursor-pointer hover:bg-[var(--hover)] p-2">
                                    <MaskImage url="/icons/search.svg" w=".9em" h=".9em" bg="var(--primary-color)" />
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-10 gap-4 mt-5 items-end pb-3 ">
                            <div className="col-span-12 md:col-span-2">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-end gap-1">
                                        <label htmlFor="" className="text-[.58em] text-[var(--text-dark)] font-bold uppercase leading-4">STATUS</label>
                                    </div>
                                    <div className="flex w-full gap-2 ">
                                        <div className="relative w-full">
                                            <select
                                                id="social-media-status"
                                                value={filters.status}
                                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                                className="appearance-none select-wrapper border-none shadow-none  outline-none bg-[var(--bg-w)] create-input  w-full rounded-[8px] p-[9px] px-3 text-[.7em] text-[var(--text-dark-1)]"
                                            >
                                                <option value="all">All</option>
                                                <option value="pending">Pending</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="working">Working</option>
                                                <option value="proposal sent">Proposal Sent</option>
                                                <option value="not interested">Not Interested</option>
                                                <option value="closed">Closed</option>
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
                            <div className="col-span-12 md:col-span-2">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-end gap-1">
                                        <label htmlFor="" className="text-[.58em] text-[var(--text-dark)] font-bold uppercase leading-4">Platforms</label>
                                    </div>
                                    <div className="flex w-full gap-2 ">
                                        <div className="relative w-full">
                                            <select
                                                id="social-media-platform"
                                                value={filters.platform}
                                                onChange={(e) => handleFilterChange('platform', e.target.value)}
                                                className="appearance-none select-wrapper border-none shadow-none  outline-none bg-[var(--bg-w)] create-input  w-full rounded-[8px] p-[9px] px-3 text-[.7em] text-[var(--text-dark-1)]"
                                            >
                                                <option value="all">All</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="WhatsApp">WhatsApp</option>
                                                <option value="YouTube">YouTube</option>
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
                                    <div className="flex w-full gap-2 ">
                                        <RangePicker
                                            presets={presets}
                                            format="DD MMM, YYYY"
                                            allowClear={false}
                                            showNow={false}
                                            value={filters.dateRange}
                                            onChange={handleDateRangeChange}
                                            className="w-full date-range-wrapper p-[9px] px-3 "
                                            dropdownClassName={isMobile ? "single-calendar" : ""}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-1 ">
                                <button
                                    type="button"
                                    onClick={() => urlPramsData()}
                                    className="flex w-full text-[.85em] uppercase cursor-pointer text-[var(--text-light)] font-semibold tracking-[1px] items-center justify-center bg-[var(--primary-color)] py-[6px] rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px]  duration-300">
                                    Filter
                                </button>
                            </div>
                        </div>
                        <div className={` ${selectedRows.length > 0 ? "grid grid-cols-12 mt-5" : "hidden"}`}>
                            <div className="col-span-12 md:col-span-2">
                                <div
                                    onClick={handleBulkDelete}
                                    className="flex w-full text-[.80em] uppercase cursor-pointer text-[var(--text-light)] font-semibold tracking-[1px] items-center justify-center bg-[var(--primary-color)] py-[6px] rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px]  duration-300">
                                    Delete {selectedRows.length} Leads
                                </div>

                            </div>
                        </div>
                    </form>
                    <div className="lead-data-content-wrapper text-[15px] overflow-x-auto w-full ">
                        <div className="heading grid grid-cols-[48px_70px_150px_repeat(7,180px)] items-center min-w-[1400px] w-max border-t border-[var(--hover)]">
                            <div className="sticky left-0 bg-[var(--bg-w)] z-10">
                                <div className="flex gap-2 items-center py-4 px-5 bg-[var(--bg-w)]">
                                    <input
                                        type="checkbox"
                                        checked={rows.length > 0 && selectedRows.length === rows.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRows(rows.map(r => r.id));
                                            } else {
                                                setSelectedRows([]);
                                            }
                                        }}
                                        className="m-0 form-check-input"
                                    />
                                </div>
                            </div>
                            {columns.map(col => (
                                <div key={col.key} className="">
                                    <div className="flex gap-2 items-center py-4 px-5">
                                        {col.icon &&
                                            <span
                                                style={{ backgroundColor: `${col.color}30` }}
                                                className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                                <MaskImage url={col.icon} w="1em" h="1em" bg={col.color} />
                                            </span>
                                        }
                                        <span className="text-[var(--text-dark)] text-[.8em] uppercase">{col.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {rows.map(data => (
                            <div
                                onClick={(e) => { handleLeadClick(data.id); }}
                                className={`grid grid-cols-[48px_70px_150px_repeat(7,180px)] relative items-center min-w-[1400px] w-max pe-5 cursor-pointer ${leadData == data.id ? "bg-[color-mix(in_srgb,var(--primary-color)_5%,#ffffff00)]" : ""}  hover:bg-[color-mix(in_srgb,var(--primary-color)_5%,#ffffff00)]`}>

                                <div className="sticky left-0 bg-[var(--bg-w)] z-10 h-full">
                                    <div className="flex gap-2 items-center py-4 px-5 ">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(data.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRows(prev => [...prev, data.id]);
                                                } else {
                                                    setSelectedRows(prev => prev.filter(id => id !== data.id));
                                                }
                                            }}
                                            className="m-0 form-check-input"
                                        />
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5  min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em] ca truncate" title={data.id}>{data.id}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.name}>{data.name}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.number}>{data.number}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em]  truncate" title={data.linkName}>{data.linkName}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-[10px] px-5 min-w-0 text-[.85em]">
                                        <div className="relative w-full">
                                            <select
                                                id="social-media"
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={async (e) => {
                                                    e.stopPropagation();
                                                    await leadAPI.update(data.id, { status: e.target.value });
                                                    fetchLeads();
                                                }}
                                                className="appearance-none select-wrapper border-none shadow-none  outline-none bg-[var(--bg-w)] create-input  w-full rounded-[8px] p-[5px] px-3  text-[var(--text-dark-1)]"
                                            >
                                                <option value={data.status} >{capitalize(data.status)}</option>
                                                {statuses && statuses.filter(s => s !== data.status).map(status => (
                                                    <option key={status} value={status}>{capitalize(status)}</option>
                                                ))}
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
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em] truncate" title={data.email}>{data.email}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-3 px-5 min-w-0">
                                        <span className="text-[var(--text-light)] py-1 w-full flex items-center justify-center rounded-full text-[.85em] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] capitalize truncate" title={data.platform}>{data.platform}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.location}>{data.location}</span>
                                    </div>
                                </div>
                                <div className="border-t border-[var(--hover)]">
                                    <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                        <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.createdAt}>{data.createdAt}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination */}
                    {rows.length > 0 && (
                        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5 px-5 border-t border-[var(--border)]">
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
                </div>
            </div>
        </div>
    );
}

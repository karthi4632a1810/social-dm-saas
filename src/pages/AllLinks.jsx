import MaskImage from "../components/MaskImage";
import { DatePicker, Grid } from "antd";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import LinkCreate from "../components/LinkCreate";
import { linkAPI, formatDate } from "../utils/api";
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;


export default function AllLinks() {
    const [createBox, setCreateBox] = useState(false)
    const [leadData, setLeadData] = useState(null)
    const [linkData, setLinkData] = useState({
        ln: "",
        url: "",
        pf: "",
        cs: "",
        id: "",
        destinationType: "",
        formId: "",
        whatsappNumber: "",
        whatsappMessage: ""
    })
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        platform: 'all',
        dateRange: null
    });

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
        { key: "id", label: "ID" },
        { key: "link_name", label: "Link Name", icon: "/icons/link.svg", color: "#28c76f" },
        { key: "clicks", label: "Clicks", icon: "/icons/click.svg", color: "#7367f0" },
        { key: "status", label: "Status", icon: "/icons/status.svg", color: "#ff4c51" },
        { key: "platform", label: "Platform", icon: "/icons/platform.svg", color: "#00bad1" },
        { key: "link", label: "link", icon: "/icons/url.svg", color: "#007bff" },
        { key: "action", label: "Action", icon: "/icons/mail.svg", color: "#20c997" },
        { key: "slug", label: "Slug", icon: "/icons/slug.svg", color: "#ff4c51" },
        { key: "createdAt", label: "Created at", icon: "/icons/d-t.svg", color: "#fd7e14" },
    ];
    useEffect(() => {
        fetchLinks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const params = {
                status: filters.status !== 'all' ? filters.status : undefined,
                platform: filters.platform !== 'all' ? filters.platform : undefined,
                startDate: filters.dateRange?.[0]?.toISOString(),
                endDate: filters.dateRange?.[1]?.toISOString(),
                limit: 10
            };
            
            // Remove undefined params
            Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
            
            const response = await linkAPI.getAll(params);
            if (response.success) {
                setRows(response.data.map(link => ({
                    id: link._id,
                    link_name: link.link_name,
                    clicks: link.clicks.toString(),
                    status: link.status,
                    slug: link.slug,
                    link: link.link || (link.destinationType === 'whatsapp' ? `wa.me/${link.whatsappNumber}` : link.formId?.name || ''),
                    platform: link.platform,
                    action: "copy",
                    createdAt: formatDate(link.createdAt),
                    destinationType: link.destinationType || 'url',
                    formId: link.formId?._id || link.formId || '',
                    whatsappNumber: link.whatsappNumber || '',
                    whatsappMessage: link.whatsappMessage || ''
                })));
            }
        } catch (error) {
            console.error('Error fetching links:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDateRangeChange = (dates) => {
        setFilters(prev => ({ ...prev, dateRange: dates }));
    };

    const statuses = [
        "active",
        "paused"
    ];

    return (
        <div className="flex-1 w-full max-w-[1400px] mx-auto mt-10">

            <button
                onClick={() => {
                    setCreateBox(prev => !prev)
                    setLinkData({
                        ln: "",
                        url: "",
                        pf: "",
                        cs: "",
                        id: "",
                        destinationType: "",
                        formId: "",
                        whatsappNumber: "",
                        whatsappMessage: ""
                    });
                    fetchLinks();
                }}
                type="submit"
                className="flex gap-2 mb-3 w-max text-[16x] p-3 uppercase cursor-pointer text-[var(--text-light)] font-semibold items-center justify-center bg-[var(--primary-color)]  rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px]  duration-300">
                <span className="">
                    <MaskImage url="/icons/create-link.svg" w="1.5em" h="1.5em" bg="var(--text-light)" />
                </span>
                <div className="flex flex-col">
                    <span className="text-[var(--text-light)] text-[.9em] font-semibold">Create Link</span>
                </div>
            </button>
            <div className={`flex create-l-wrapper fixed ${createBox == true ? "active" : ""} w-full z-2 inset-0 items-center justify-center`}>
                <div
                    onClick={() => {
                        setCreateBox(prev => !prev);
                    }}

                    className="absolute inset-0 z-50  bg-black/40 z-[-1]"></div>
                <LinkCreate
                    ln={linkData.ln}
                    url={linkData.url}
                    pf={linkData.pf}
                    cs={linkData.cs}
                    id={linkData.id}
                    destinationType={linkData.destinationType}
                />
            </div>
            <div id="all-leads" className="all-leads-wrapper bg-[var(--bg-w)] w-full rounded-[6px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)]  text-[20px]">
                <form className="flex flex-col shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-5">
                    <div className="flex justify-between items-center">
                        <h2 className="text-[.75em] text-[var(--text-dark)] font-semibold uppercase">All links</h2>
                        <div className="search-input-wrapper flex  w-full max-w-[350px] justify-between p-1 ps-4 rounded-[10px] ">
                            <input
                                type="text"
                                id="input-search"
                                placeholder="e.g search"
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
                                            id="social-media"
                                            value={filters.status}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="appearance-none select-wrapper border-none shadow-none  outline-none bg-[var(--bg-w)] create-input  w-full rounded-[8px] p-[9px] px-3 text-[.7em] text-[var(--text-dark-1)]"
                                        >
                                            <option value="all">All</option>
                                            <option value="active">Active</option>
                                            <option value="paused">Paused</option>

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
                                            id="social-media"
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
                                type="submit"
                                className="flex w-full text-[.85em] uppercase cursor-pointer text-[var(--text-light)] font-semibold tracking-[1px] items-center justify-center bg-[var(--primary-color)] py-[6px] rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px]  duration-300">
                                Filter
                            </button>
                        </div>
                    </div>
                </form>
                <div className="lead-data-content-wrapper text-[15px] overflow-x-auto w-full ">
                    <div className="heading grid grid-cols-[48px_70px_150px_repeat(7,180px)] items-center min-w-[1400px] w-max border-t border-[var(--hover)]">
                        <div className="">
                            <div className="flex gap-2 items-center py-4 px-5 ">
                                <input type="checkbox" className="m-0 form-check-input" />
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
                            onClick={() => {
                                setCreateBox(prev => !prev);
                                setLinkData({
                                    ln: data.link_name,
                                    url: data.link || "",
                                    pf: data.platform,
                                    cs: data.slug,
                                    id: data.id,
                                    destinationType: data.destinationType || "url",
                                    formId: data.formId || "",
                                    whatsappNumber: data.whatsappNumber || "",
                                    whatsappMessage: data.whatsappMessage || ""
                                });
                                fetchLinks();
                            }}
                            className={`grid grid-cols-[48px_70px_150px_repeat(7,180px)] relative items-center min-w-[1400px] w-max pe-5 cursor-pointer ${leadData == data.id ? "bg-[color-mix(in_srgb,var(--primary-color)_5%,#ffffff00)]" : ""}  hover:bg-[color-mix(in_srgb,var(--primary-color)_5%,#ffffff00)]`}>

                            <div className="">
                                <div className="flex gap-2 items-center py-4 px-5 ">
                                    <input
                                        onClick={(e) => e.stopPropagation()}
                                        type="checkbox"
                                        className="m-0 form-check-input" />
                                </div>
                            </div>
                            <div className="border-t border-[var(--hover)]">
                                <div className="flex gap-2 items-center py-4 px-5  min-w-0">
                                    <span className="text-[var(--text-dark)] text-[.85em] ca truncate" title={data.id}>{data.id}</span>
                                </div>
                            </div>
                            <div className="border-t border-[var(--hover)]">
                                <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                    <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.link_name}>{data.link_name}</span>
                                </div>
                            </div>
                            <div className="border-t border-[var(--hover)]">
                                <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                    <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.clicks}>{data.clicks}</span>
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
                                                await linkAPI.update(data.id, { status: e.target.value });
                                                fetchLinks();
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
                                <div className="flex gap-2 items-center py-3 px-5 min-w-0">
                                    <span className="text-[var(--text-light)] py-1 w-full flex items-center justify-center rounded-full text-[.85em] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] capitalize truncate" title={data.platform}>{data.platform}</span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--hover)]">
                                <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                    <span className="text-[var(--text-dark)] text-[.85em] capitalize truncate" title={data.link}>{data.link}</span>
                                </div>
                            </div>

                            <div className="border-t border-[var(--hover)]">
                                <div className="flex gap-2 items-center py-3 px-5 min-w-0">
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="py-1 cursor-pointer px-5 text-[var(--primary-color)] font-semibold w-full flex items-center justify-center rounded-full text-[.85em] bg-[var(--bg-w)] shadow-[0px_0px_2px_color-mix(in_srgb,var(--primary-color)_30%,#ffffff00)] capitalize truncate" title={data.action}>{data.action} link</button>
                                </div>
                            </div>
                            <div className="border-t border-[var(--hover)]">
                                <div className="flex gap-2 items-center py-4 px-5 min-w-0">
                                    <span className="text-[var(--text-dark)] text-[.85em] truncate" title={data.slug}>{data.slug}</span>
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
                <div className="px-5 flex ">
                    <div className="flex justify-between w-full items-center py-4 gap-2 border-t border-[var(--hover)] mt-3">
                        <p className="text-[var(--text-dark-1)] text-[.7em]">Showing 1 to 10 of 30 entries</p>
                        <div className="flex justify-end items-center gap-2">
                            <span
                                className="bg-[var(--hover)] w-[35px] h-[35px] cursor-pointer flex justify-center items-center rounded-[6px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover)_60%,#ffffff00)]">
                                <MaskImage url="/icons/pag-2.svg" w=".9em" h=".9em" bg="var(--text-dark-1)" />
                            </span>
                            <span
                                className="bg-[var(--primary-color)] w-[35px] h-[35px] cursor-pointer text-[.8em] text-[var(--text-light)] flex justify-center items-center rounded-[6px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_60%,#ffffff00)]">
                                1
                            </span>
                            <span
                                className="bg-[var(--hover)] w-[35px] h-[35px] cursor-pointer text-[.8em] text-[var(--text-dark-1)] flex justify-center items-center rounded-[6px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover)_60%,#ffffff00)]">
                                2
                            </span>
                            <span
                                className="bg-[var(--hover)] w-[35px] h-[35px] cursor-pointer text-[.8em] text-[var(--text-dark-1)] flex justify-center items-center rounded-[6px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover)_60%,#ffffff00)]">
                                3
                            </span>
                            <span
                                className="bg-[var(--hover)] w-[35px] h-[35px] cursor-pointer flex justify-center items-center rounded-[6px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--hover)_60%,#ffffff00)]">
                                <MaskImage url="/icons/pag-1.svg" w=".9em" h=".9em" bg="var(--text-dark-1)" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

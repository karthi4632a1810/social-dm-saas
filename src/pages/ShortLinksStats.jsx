
import { useState, useEffect } from "react";
import PageViewsVisitorsLine from "../components/charts/PageViewsVisitorsLine";
import ClicksLineChart from "../components/charts/ClicksLineChart";
import LeadsAreaChart from "../components/charts/LeadsAreaChart.JSX";
import { DatePicker, Grid } from "antd";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
import { useSearchParams } from "react-router-dom";


export default function SocialMedias() {
    const [searchParams, setSearchParams] = useSearchParams();
    const linkType = searchParams.get("type") || "";
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [filters, setFilters] = useState({
        dateRange: searchParams.get("startDate") && searchParams.get("endDate")
            ? [dayjs(searchParams.get("startDate")), dayjs(searchParams.get("endDate"))]
            : null
    });
    const urlPramsData = () => {
        if (!filters.dateRange || filters.dateRange.length !== 2) return;
        const params = Object.fromEntries(searchParams.entries());

        params.startDate = filters.dateRange[0].toISOString();
        params.endDate = filters.dateRange[1].toISOString();

        setSearchParams(params);
    };

    useEffect(() => {
        if (filters.dateRange) {
            urlPramsData();
        }
    }, [filters.dateRange]);

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

    const handleDateRangeChange = (dates) => {
        setFilters(prev => ({ ...prev, dateRange: dates }));
    };
    console.log(linkType)
    return (
        <div className="flex-1 mt-10 w-full max-w-[1400px] mx-auto ">
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px] gap-5">
                    <div className="flex justify-between  px-6 py-6 items-center shadow-[0px_0px_10px_rgba(0,0,0,0.06)]">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Page View and Visitors Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Page View and Visitors Details data </p>
                        </div>
                        <div className="flex flex-col gap-1 w-[25%]">
                            <div className="flex items-end gap-1">
                                <label htmlFor="" className="text-[.58em] text-[var(--text-dark)] font-bold uppercase leading-4">SELECT Date</label>
                            </div>
                            <div className="flex w-full gap-2 ">
                                <RangePicker
                                    value={filters.dateRange}
                                    presets={presets}
                                    format="DD MMM, YYYY"
                                    allowClear={false}
                                    showNow={false}
                                    onChange={handleDateRangeChange}
                                    className="w-full date-range-wrapper p-[9px] px-3 "
                                    dropdownClassName={isMobile ? "single-calendar" : ""}
                                />
                            </div>
                        </div>
                    </div>
                    <PageViewsVisitorsLine
                        startDate={filters.dateRange?.[0]?.format("YYYY-MM-DD")}
                        endDate={filters.dateRange?.[1]?.format("YYYY-MM-DD")}
                    />
                </div>
                <div className="col-span-12 lg:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 relative z-10 items-center shadow-[0px_0px_10px_rgba(0,0,0,0.06)]">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Click Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Click Details data </p>
                        </div>
                    </div>
                    <ClicksLineChart
                        startDate={filters.dateRange?.[0]?.format("YYYY-MM-DD")}
                        endDate={filters.dateRange?.[1]?.format("YYYY-MM-DD")}
                    />
                </div>
                {linkType == "form"
                    ?
                    <div className="col-span-12 lg:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex justify-between  px-6 py-4 items-center shadow-[0px_0px_10px_rgba(0,0,0,0.06)]">
                            <div className="flex flex-col ">
                                <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Lead Details</h5>
                                <p className="text-[var(--text-2)]  text-[.75em]">See Lead Details data </p>
                            </div>
                        </div>
                        <LeadsAreaChart
                            startDate={filters.dateRange?.[0]?.format("YYYY-MM-DD")}
                            endDate={filters.dateRange?.[1]?.format("YYYY-MM-DD")}
                        />
                    </div>
                    :
                    ""
                }
            </div>
        </div>
    );
}

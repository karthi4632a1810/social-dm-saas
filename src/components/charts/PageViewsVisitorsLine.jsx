import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";
import { linkAPI } from "../../utils/api";
import { showToast } from "../../utils/toast";
import { useSearchParams } from "react-router-dom";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function PageViewsVisitorsLine({ startDate = "", endDate = "" }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [LinkId, SetLinkId] = useState(searchParams.get("id") || "");
    const [links, setLinks] = useState([]);


    const fetchLinks = async () => {
        try {
            const params = {
                startDate: startDate,
                endDate: endDate,
            };

            const response = await linkAPI.getById(LinkId, params);

            if (response.success) {
                setLinks(response.data.stats || []);
                console.log(response.data.stats);
            } else {
                showToast(response.message || "Failed to fetch links", "error");
            }
        } catch (err) {
            console.error("Error fetching links:", err);
            showToast("An error occurred while fetching links", "error");
        }
    };
    const fetchAllLinks = async () => {
        try {
            const params = {
                startDate: startDate,
                endDate: endDate,
            };

            const response = await linkAPI.getAllByDate(params);

            if (response.success) {
                setLinks(response.data || []);
                console.log(response.data);
            } else {
                showToast(response.message || "Failed to fetch links", "error");
            }
        } catch (err) {
            console.error("Error fetching links:", err);
            showToast("An error occurred while fetching links", "error");
        }
    };

    useEffect(() => {
        if (LinkId == "") {
            fetchAllLinks();
        }
        else {
            fetchLinks();
        }
    }, [LinkId, startDate, endDate]);




    const [series, setSeries] = useState([]);
    const [options, setOptions] = useState({});
    const [themeTick, setThemeTick] = useState(0);

    // watch dark / light mode
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setThemeTick(t => t + 1);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const grouped = {};

        links.forEach(d => {
            if (!grouped[d.date]) {
                grouped[d.date] = { pageViews: 0, visitors: 0 };
            }
            grouped[d.date].pageViews += d.pageViews || 0;
            grouped[d.date].visitors += d.uniqueVisitors || 0;
        });

        const dates = Object.keys(grouped).sort(
            (a, b) => new Date(a) - new Date(b)
        );

        setSeries([
            {
                name: "Page Views",
                data: dates.map(d => grouped[d].pageViews)
            },
            {
                name: "Visitors",
                data: dates.map(d => grouped[d].visitors)
            }
        ]);

        setOptions({
            chart: {
                background: "transparent",
                toolbar: { show: false }
            },

            colors: [
                css("--c-16"), // Page Views
                css("--c-15")  // Visitors
            ],

            dataLabels: {
                enabled: false
            },

            stroke: {
                curve: "straight",
                width: 4
            },
            markers: {
                size: 6,
                strokeWidth: 0,
                strokeColors: "#fff",
                hover: { size: 7 }
            },


            grid: {
                show: true,
                borderColor: css("--border"),
                strokeDashArray: 3
            },
            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    shadeIntensity: 0,
                    opacityFrom: 0.7,   // visible near line
                    opacityTo: 0,        // fades to bottom
                    stops: [0, 85, 100]
                }
            },

            xaxis: {
                categories: dates,

                tickAmount: Math.min(dates.length, 10), // 👈 THIS IS KEY

                labels: {
                    hideOverlappingLabels: true,
                    rotate: 0,

                    formatter: (value, index) => {
                        const current = new Date(value);
                        const day = current.getDate();
                        const month = current.toLocaleString("en-US", { month: "short" });

                        if (index === 0) return `${month} ${day}`;

                        const prev = new Date(dates[index - 1]);

                        if (current.getMonth() !== prev.getMonth()) {
                            return `${month} ${day}`;
                        }

                        return String(day);
                    },

                    style: {
                        colors: dates.map(() => css("--text-dark-1"))
                    }
                },

                axisBorder: {
                    show: true,
                    color: css("--border")
                },
                axisTicks: {
                    show: true,
                    color: css("--border")
                }
            },

            yaxis: {
                labels: {
                    style: {
                        colors: css("--text-dark-1")
                    }
                }
            },

            legend: {
                position: "top",
                labels: {
                    colors: css("--text-dark-1")
                }
            },

            tooltip: {
                shared: true,
                theme: document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light"
            }
        });
    }, [links, themeTick]);

    const hasData =
        series.length > 0 &&
        series.some(s => Array.isArray(s.data) && s.data.some(v => v > 0));

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--text-2)] text-[20px]">
                <div className="w-full max-w-[400px] mb-10">
                    <img src="../common/no-data.png" alt="" />
                </div>
                <p className="font-semibold text-[1em] text-[var(--text-dark-1)] opacity-75">There are no data available for this date range (or) for the link</p>
                <p className="text-[var(--text-dark-1)] text-[.8em] opacity-75">Change your date range (or) the link.</p>
            </div>
        );
    }
    return (
        <Chart
            type="area"
            height={400}
            series={series}
            options={options}
        />
    );
}

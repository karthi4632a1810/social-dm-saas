import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";
import { linkAPI } from "../../utils/api";
import { showToast } from "../../utils/toast";
import { useSearchParams } from "react-router-dom";

const getCssVar = (name) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();

export default function ClicksLineChart({ startDate = "", endDate = "" }) {
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

    useEffect(() => {
        if (LinkId == "") {
            setLinks(
                (analyticsData)
            );
        }
        else {
            fetchLinks();
        }
    }, [LinkId, startDate, endDate]);




    const [options, setOptions] = useState({});
    const [series, setSeries] = useState([]);
    const [themeTick, setThemeTick] = useState(0); // forces color refresh

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
            if (!grouped[d.date]) grouped[d.date] = 0;
            grouped[d.date] += d.clicks || 0;
        });

        const dates = Object.keys(grouped).sort(
            (a, b) => new Date(a) - new Date(b)
        );

        setSeries([
            {
                name: "Clicks",
                data: dates.map(d => grouped[d])
            }
        ]);

        setOptions({
            chart: {
                background: getCssVar("--bg-w"),
                toolbar: { show: false }
            },

            grid: {
                show: true,
                borderColor: getCssVar("--border"),
                strokeDashArray: 0, // solid lines = box look
                position: "back",
                xaxis: {
                    lines: {
                        show: true   // vertical lines
                    }
                },
                yaxis: {
                    lines: {
                        show: true   // horizontal lines
                    }
                },
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },

            stroke: {
                curve: "smooth",
                width: 3
            },
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 5,
                strokeWidth: 2,
                strokeColors: "#ffffff",
                fillOpacity: 1,                 // 🔥 REQUIRED
                colors: [
                    getCssVar("--c-1"),
                ],
                hover: {
                    size: 7
                }
            },

            colors: [getCssVar("--c-1")],

            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    shadeIntensity: 0,
                    opacityFrom: 0.7,   // visible near line
                    opacityTo: 0,        // fades to bottom
                    stops: [0, 90, 100]
                }
            },

            xaxis: {
                categories: dates,

                tickAmount: Math.min(dates.length, 10), // same trick, fewer labels

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
                        colors: dates.map(() => getCssVar("--text-dark-1"))
                    }
                },

                axisBorder: {
                    show: true,
                    color: getCssVar("--border")
                },
                axisTicks: {
                    show: true,
                    color: getCssVar("--border")
                }
            },


            yaxis: {
                labels: {
                    style: {
                        colors: getCssVar("--text-dark-1")
                    }
                }
            },

            tooltip: {
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
            <div className="flex flex-col items-center justify-center py-10 text-[var(--text-2)] text-[16px]">
                <div className="w-full max-w-[200px] mb-10">
                    <img src="../common/no-data.png" alt="" />
                </div>
                <p className="font-semibold text-[1em] text-[var(--text-dark-1)] opacity-75">There are no data available for this date range (or) for the link</p>
                <p className="text-[var(--text-dark-1)] text-[.7em] opacity-75">Change your date range (or) the link.</p>
            </div>
        );
    }


    return (
        <Chart
            type="area"
            options={options}
            series={series}
            height={300}
        />
    );
}

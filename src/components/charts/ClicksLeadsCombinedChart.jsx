import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsAPI } from "../../utils/api";
import { showToast } from "../../utils/toast";
import { useSearchParams } from "react-router-dom";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function ClicksLeadsCombinedChart({ startDate = "", endDate = "" }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [LinkId, SetLinkId] = useState(searchParams.get("id") || "");
    const [links, setLinks] = useState([]);


    const fetchLinks = async () => {
        try {
            const statsByDate = await analyticsAPI.getStatsAll();
            if (statsByDate.success) {
                setLinks(statsByDate.data);
                console.log(statsByDate.data)
            } else {
                console.warn('Stats API error:', weeklyRes.message);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, [LinkId, startDate, endDate]);




    const [options, setOptions] = useState({});
    const [series, setSeries] = useState([]);
    const [themeTick, setThemeTick] = useState(0);


    // watch dark/light toggle
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
        const clicksByDate = {};
        const leadsByDate = {};

        links.forEach(d => {
            clicksByDate[d.date] =
                (clicksByDate[d.date] || 0) + d.totalClick;

            leadsByDate[d.date] =
                (leadsByDate[d.date] || 0) + d.totalLead;
        });

        const dates = Object.keys(clicksByDate);

        setSeries([
            {
                name: "Clicks",
                type: "area",
                data: dates.map(d => clicksByDate[d] || 0)
            },
            {
                name: "Leads",
                type: "area",
                data: dates.map(d => leadsByDate[d] || 0)
            }
        ]);

        setOptions({
            chart: {
                background: "transparent",
                toolbar: { show: false }
            },

            colors: [
                css("--c-1"), // Clicks
                css("--c-4")  // Leads
            ],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: "smooth",
                width: 2
            },
            markers: {
                size: 5,
                strokeWidth: 1,
                strokeColors: "#ffffff",
                fillOpacity: 1,                 // 🔥 REQUIRED
                colors: [
                    css("--c-1"),               // Clicks
                    css("--c-4")                // Leads
                ],
                hover: {
                    size: 7
                }
            },

            fill: {
                type: "gradient",
                gradient: {
                    type: "vertical",
                    shadeIntensity: 0,
                    opacityFrom: 0.5,   // visible near line
                    opacityTo: 0,        // fades to bottom
                    stops: [0, 85, 100]
                }
            },

            grid: {
                show: true,
                borderColor: css("--border"),
                strokeDashArray: 0,
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: true } }
            },

            xaxis: {
                categories: dates,
                labels: {
                    formatter: (value, index) => {
                        const current = new Date(value);
                        const day = current.getDate();
                        const month = current.toLocaleString("en-US", { month: "short" });

                        // first label
                        if (index === 0) return `${month} ${day}`;

                        const prev = new Date(dates[index - 1]);

                        // show month when month changes
                        if (current.getMonth() !== prev.getMonth()) {
                            return `${month} ${day}`;
                        }

                        // otherwise, just show day
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
                tickAmount: 6,
                labels: {
                    style: {
                        colors: css("--text-dark-1")
                    }
                }
            },

            legend: {
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

    return (
        <Chart
            type="area"
            height={320}
            series={series}
            options={options}
        />
    );
}

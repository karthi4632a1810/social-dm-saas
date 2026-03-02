import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function PlatformRadarClicksLeads({ data = analyticsData }) {
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
        const clicks = {};
        const leads = {};

        data.forEach(d => {
            if (!d.platform) return;
            clicks[d.platform] = (clicks[d.platform] || 0) + (d.clicks || 0);
            leads[d.platform] = (leads[d.platform] || 0) + (d.leads || 0);
        });

        const categories = Object.keys(clicks);

        setSeries([
            {
                name: "Clicks",
                data: categories.map(p => clicks[p])
            },
            {
                name: "Leads",
                data: categories.map(p => leads[p])
            }
        ]);

        setOptions({
            chart: {
                type: "radar",
                background: "transparent",
                toolbar: { show: false }
            },

            colors: [
                css("--c-3"), // Clicks
                css("--c-4")  // Leads
            ],

            stroke: {
                width: 2
            },

            fill: {
                opacity: [0.25, 0.35] // Leads slightly stronger
            },

            markers: {
                size: 4,
                strokeWidth: 2,
                strokeColors: "#fff"
            },

            xaxis: {
                categories,
                labels: {
                    style: {
                        colors: categories.map(() => css("--text-dark-1")),
                        fontSize: "12px"
                    }
                }
            },

            yaxis: {
                show: false
            },

            plotOptions: {
                radar: {
                    polygons: {
                        strokeColors: css("--border"),
                        connectorColors: css("--border"),
                        fill: {
                            colors: [css("--bg-w"), "transparent"]
                        }
                    }
                }
            },

            legend: {
                position: "bottom",
                labels: {
                    colors: css("--text-dark-1")
                },
                markers: {
                    radius: 10
                }
            },

            tooltip: {
                shared: true,
                theme: document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light"
            }
        });
    }, [data, themeTick]);

    return (
        <Chart
            type="radar"
            height={350}
            series={series}
            options={options}
        />
    );
}

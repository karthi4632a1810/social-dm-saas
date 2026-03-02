import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function PlatformClicksLeadsBar({ data = analyticsData }) {
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

        const platforms = Object.keys(clicks);

        setSeries([
            {
                name: "Clicks",
                data: platforms.map(p => clicks[p])
            },
            {
                name: "Leads",
                data: platforms.map(p => leads[p])
            }
        ]);

        setOptions({
            chart: {
                type: "bar",
                stacked: false,              // 🔥 IMPORTANT
                background: "transparent",
                toolbar: { show: false }
            },

            colors: [
                css("--c-1"), // Clicks
                css("--c-4")  // Leads
            ],

            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: "55%",
                    borderRadius: 2
                }
            },

            dataLabels: {
                enabled: false
            },

            grid: {
                show: true,
                borderColor: css("--border"),
                strokeDashArray: 3
            },

            xaxis: {
                categories: platforms,   // 👈 THIS IS THE KEY
                labels: {
                    style: {
                        colors: css("--text-dark-1"),
                        fontSize: "12px"
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: css("--text-dark-1"),
                        fontSize: "12px"
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
                shared: false,     // ❌ do not share across series
                intersect: true,   // ✅ bind tooltip to hovered bar
                theme: document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light",
                y: {
                    formatter: (val) => val
                }
            },
        });
    }, [data, themeTick]);

    return (
        <Chart
            type="bar"
            height={380}
            series={series}
            options={options}
        />
    );
}

// PlatformLeadsBar.jsx
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function PlatformLeadsBar({ data = analyticsData }) {
    const [series, setSeries] = useState([]);
    const [options, setOptions] = useState({});
    const [themeTick, setThemeTick] = useState(0);

    // 🔥 watch dark / light mode
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

    // 🔁 rebuild chart on data / theme change
    useEffect(() => {
        const totals = {};

        data.forEach(d => {
            if (!d.platform) return;
            totals[d.platform] = (totals[d.platform] || 0) + (d.leads || 0);
        });

        const categories = Object.keys(totals);
        const values = Object.values(totals);

        setSeries([
            {
                name: "Leads",
                data: values
            }
        ]);

        setOptions({
            chart: {
                background: "transparent",
                toolbar: { show: false }
            },

            colors: [css("--c-4")], // Leads color

            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: "45%",
                    distributed: false
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
                categories,
                labels: {
                    style: {
                        colors: categories.map(() => css("--text-dark-1")),
                        fontSize: "12px"
                    }
                },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },

            yaxis: {
                labels: {
                    style: {
                        colors: css("--text-dark-1"),
                        fontSize: "12px"
                    }
                }
            },

            tooltip: {
                theme: document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light",
                y: {
                    formatter: (val) => `${val} leads`
                }
            },

            states: {
                hover: {
                    filter: {
                        type: "lighten",
                        value: 0.1
                    }
                }
            }
        });
    }, [data, themeTick]);

    return (
        <Chart
            type="bar"
            height={320}
            series={series}
            options={options}
        />
    );
}

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function PlatformDonut({ data = analyticsData }) {
    const [series, setSeries] = useState([]);
    const [options, setOptions] = useState({});
    const [themeTick, setThemeTick] = useState(0);

    // 🔥 watch dark / light mode changes
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

    // 🔁 rebuild chart on data or theme change
    useEffect(() => {
        const totals = {};

        data.forEach(d => {
            if (!d.platform) return;
            totals[d.platform] = (totals[d.platform] || 0) + (d.clicks || 0);
        });

        const labels = Object.keys(totals);
        const values = Object.values(totals);
        const totalClicks = values.reduce((a, b) => a + b, 0);

        setSeries(values);

        setOptions({
            labels,

            chart: {
                type: "donut",
                background: "transparent"
            },

            colors: [
                css("--c-1"),
                css("--c-2"),
                css("--c-3"),
                css("--c-4"),
                css("--c-5"),
                css("--c-6")
            ],

            stroke: {
                width: 0
            },

            plotOptions: {
                pie: {
                    donut: {
                        size: "70%",
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: "13px",
                                color: css("--text-dark-1"),
                                offsetY: -4
                            },
                            value: {
                                show: true,
                                fontSize: "20px",
                                fontWeight: 600,
                                color: css("--text-dark")
                            },
                            total: {
                                show: true,
                                label: "Total Clicks",
                                fontSize: "12px",
                                color: css("--text-dark-1"),
                                formatter: () => totalClicks
                            }
                        }
                    }
                }
            },

            legend: {
                position: "bottom",
                fontSize: "13px",
                markers: {
                    width: 10,
                    height: 10,
                    radius: 10
                },
                labels: {
                    colors: css("--text-dark-1")
                }
            },

            dataLabels: {
                enabled: false
            },

            tooltip: {
                theme: document.documentElement.classList.contains("dark")
                    ? "dark"
                    : "light"
            }
        });
    }, [data, themeTick]);

    return (
        <Chart
            type="donut"
            series={series}
            options={options}
            height={320}
        />
    );
}

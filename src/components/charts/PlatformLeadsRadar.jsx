// PlatformLeadsRadar.jsx
import Chart from "react-apexcharts";
import { analyticsData } from "../../data/AnalyticsData.jsx";

const css = (v) =>
    getComputedStyle(document.documentElement)
        .getPropertyValue(v)
        .trim();

export default function PlatformLeadsRadar({ data = analyticsData }) {
    const totals = {};

    data.forEach(d => {
        totals[d.platform] = (totals[d.platform] || 0) + d.leads;
    });

    const categories = Object.keys(totals);
    const values = Object.values(totals);

    return (
        <Chart
            type="radar"
            height={340}
            series={[
                {
                    name: "Leads",
                    data: values
                }
            ]}
            options={{
                chart: {
                    toolbar: { show: false },
                    background: "transparent"
                },

                colors: [css("--c-4")], // Leads color

                stroke: {
                    width: 2
                },

                fill: {
                    opacity: 0.35
                },

                markers: {
                    size: 4,
                    colors: [css("--c-4")],
                    strokeColors: "#fff",
                    strokeWidth: 2
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

                grid: {
                    show: true,
                    strokeDashArray: 2
                },

                plotOptions: {
                    radar: {
                        polygons: {
                            strokeColors: css("--border"),
                            connectorColors: css("--border"),
                            fill: {
                                colors: [
                                    css("--bg-w"),
                                    "transparent"
                                ]
                            }
                        }
                    }
                },

                legend: {
                    show: true,
                    labels: {
                        colors: css("--text-dark-1")
                    }
                },

                tooltip: {
                    theme: document.documentElement.classList.contains("dark")
                        ? "dark"
                        : "light",
                    y: {
                        formatter: (val) => `${val} leads`
                    }
                }
            }}
        />
    );
}

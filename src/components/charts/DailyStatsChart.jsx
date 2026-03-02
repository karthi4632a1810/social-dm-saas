import Chart from "react-apexcharts";

export default function DailyStatsChart() {
    const series = [
        {
            name: "Visitors",
            type: "line",
            data: [7, 6, 8, 3, 3, 2, 1, 3, 6, 5, 2, 2, 2, 3, 0, 1, 6, 6, 1, 3, 0, 1, 1, 1, 3, 7, 5, 16, 5, 5]
        },
        {
            name: "Pageviews",
            type: "area",
            data: [10, 12, 21, 16, 12, 3, 7, 9, 17, 9, 12, 10, 11, 12, 7, 6, 14, 14, 3, 15, 10, 6, 12, 17, 10, 20, 11, 32, 15, 9]
        }
    ];

    const options = {
        chart: {
            height: 380,
            type: "line",
            toolbar: { show: false }
        },

        stroke: {
            curve: "smooth",
            width: [3, 3]
        },

        fill: {
            type: ["solid", "gradient"],
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },

        colors: ["#6B7280", "#14B8A6"], // grey + teal

        markers: {
            size: 5,
            strokeWidth: 0,
            hover: { size: 7 }
        },

        xaxis: {
            categories: [
                "Jan 1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
                "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
                "21", "22", "23", "24", "25", "26", "27", "28", "29", "30"
            ],
            labels: {
                style: { fontSize: "12px" }
            }
        },

        yaxis: {
            labels: {
                style: { fontSize: "12px" }
            }
        },

        grid: {
            borderColor: "#e5e7eb",
            strokeDashArray: 4
        },

        legend: {
            position: "top",
            horizontalAlign: "center"
        },

        tooltip: {
            shared: true,
            intersect: false
        }
    };

    return (
        <Chart
            options={options}
            series={series}
            type="line"
            height={380}
        />
    );
}

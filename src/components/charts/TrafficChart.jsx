import Chart from "react-apexcharts";

export default function TrafficChart() {
    const options = {
        chart: {
            type: "area",
            toolbar: { show: false }
        },
        xaxis: {
            categories: ["Jan 1", "Jan 2", "Jan 3", "Jan 4"]
        },
        stroke: {
            curve: "smooth"
        },
        dataLabels: {
            enabled: false
        }
    };

    const series = [
        {
            name: "Visitors",
            data: [10, 20, 15, 30]
        },
        {
            name: "Pageviews",
            data: [20, 35, 25, 50]
        }
    ];

    return <Chart options={options} series={series} type="area" height={350} />;
}

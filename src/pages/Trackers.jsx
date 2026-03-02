import ClicksLineChart from "../components/charts/ClicksLineChart";
import { Link } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import LeadsAreaChart from "../components/charts/LeadsAreaChart";
import ClicksLeadsCombinedChart from "../components/charts/ClicksLeadsCombinedChart";
import PlatformDonut from "../components/charts/PlatformDonut";
import PlatformLeadsBar from "../components/charts/PlatformLeadsBar";
import PlatformRadarClicksLeads from "../components/charts/PlatformRadarClicksLeads";
import PlatformClicksLeadsBar from "../components/charts/PlatformClicksLeadsBar";
import PageViewsVisitorsLine from "../components/charts/PageViewsVisitorsLine";


export default function Trackers() {

    return (
        <div className="flex-1 mt-10 w-full max-w-[1400px] mx-auto ">
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Clicks and Leads Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Clicks and Leads Details data </p>
                        </div>

                    </div>
                    <ClicksLeadsCombinedChart />
                </div>
                <div className="col-span-12 lg:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Click Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Click Details data </p>
                        </div>
                        <div className="flex h-max">
                            <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                            </Link>
                        </div>
                    </div>
                    <ClicksLineChart />
                </div>
                <div className="col-span-12 lg:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Lead Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Lead Details data </p>
                        </div>
                        <div className="flex h-max">
                            <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                            </Link>
                        </div>
                    </div>
                    <LeadsAreaChart />
                </div>
                <div className="col-span-12 lg:col-span-4 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center shadow-[0px_0px_10px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Platform Radar Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Platform Radar Details data </p>
                        </div>
                        <div className="flex h-max">
                            <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                            </Link>
                        </div>
                    </div>
                    <PlatformRadarClicksLeads />
                </div>
                <div className="col-span-12 lg:col-span-8 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center shadow-[0px_0px_10px_rgba(0,0,0,0.1)]">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Platform Radar Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Platform Radar Details data </p>
                        </div>
                        <div className="flex h-max">
                            <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                            </Link>
                        </div>
                    </div>
                    <PlatformClicksLeadsBar />
                </div>
                <div className="col-span-12 lg:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Platform Donut Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Platform Donut Details data </p>
                        </div>
                        <div className="flex h-max">
                            <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                            </Link>
                        </div>
                    </div>
                    <PlatformDonut />
                </div>
                <div className="col-span-12 lg:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center">
                        <div className="flex flex-col">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Platform Bar Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Platform Bar Details data </p>
                        </div>
                        <div className="flex h-max">
                            <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                            </Link>
                        </div>
                    </div>
                    <PlatformLeadsBar />
                </div>
                <div className="col-span-12 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                    <div className="flex justify-between  px-6 py-4 items-center">
                        <div className="flex flex-col ">
                            <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Page View and Visitors Details</h5>
                            <p className="text-[var(--text-2)]  text-[.75em]">See Page View and Visitors Details data </p>
                        </div>

                    </div>
                    <PageViewsVisitorsLine />
                </div>
            </div>

        </div>
    );
}

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import { useRef, useState, useEffect } from "react";
import MaskImage from "../components/MaskImage";
import ClicksLeadsCombinedChart from "../components/charts/ClicksLeadsCombinedChart";
import PageViewsVisitorsLine from "../components/charts/PageViewsVisitorsLine";
import { analyticsAPI, linkAPI, leadAPI, formatDate } from "../utils/api";

export default function Dashboard() {
    const firstSwiper = useRef(null)
    const paginationRef = useRef(null);

    const [stats, setStats] = useState({
        totalClicks: 0,
        totalLeads: 0,
        totalLinks: 0,
        totalChats: 0
    });
    const [statsWeekly, setStatsWeekly] = useState({
        summary: null,
        platforms: [],
        week: []
    });
    const [statsOverview, setStatsOverview] = useState({
        linkOverview: [],
        monthlyAnalytics: []
    });
    const [sliderData, setSliderData] = useState([]);
    const [linkRows, setLinkRows] = useState([]);
    const [leadRows, setLeadRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch weekly
            try {
                const weeklyRes = await analyticsAPI.getWeekly();
                if (weeklyRes.success) {
                    setStatsWeekly({
                        summary: weeklyRes.summary,
                        platforms: weeklyRes.platforms,
                        week: weeklyRes.week
                    });
                } else {
                    console.warn('Stats API error:', weeklyRes.message);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }

            // Fetch monthly
            try {
                const overViewRes = await analyticsAPI.getStatsOverview();
                if (overViewRes.success) {
                    setStatsOverview({
                        linkOverview: overViewRes.linkOverview,
                        monthlyAnalytics: overViewRes.monthlyAnalytics
                    })
                    console.log(overViewRes.linkOverview)
                    console.log(overViewRes.monthlyAnalytics)
                } else {
                    console.warn('Stats API error:', overViewRes.message);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }

            // Fetch stats
            try {
                const statsRes = await analyticsAPI.getStats();
                if (statsRes.success) {
                    console.log(statsRes.data)
                    setStats(statsRes.data);
                } else {
                    console.warn('Stats API error:', statsRes.message);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            }

            // Fetch platform analytics for slider
            try {
                const platformsRes = await analyticsAPI.getPlatforms();
                if (platformsRes.success && platformsRes.data) {
                    const topPlatforms = platformsRes.data.slice(0, 3);
                    setSliderData(topPlatforms.map((p, idx) => ({
                        id: (idx + 1).toString(),
                        platform: p.platform?.toLowerCase() || 'unknown',
                        count: (p.clicks || 0).toString(),
                        leads: (p.leads || 0).toString()
                    })));
                } else {
                    // Set default slider data if API fails
                    setSliderData([
                        { id: "1", platform: "facebook", count: "0", leads: "0" },
                        { id: "2", platform: "instagram", count: "0", leads: "0" },
                        { id: "3", platform: "youtube", count: "0", leads: "0" }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching platforms:', err);
                setSliderData([
                    { id: "1", platform: "facebook", count: "0", leads: "0" },
                    { id: "2", platform: "instagram", count: "0", leads: "0" },
                    { id: "3", platform: "youtube", count: "0", leads: "0" }
                ]);
            }

            // Fetch recent links
            try {
                const params = {
                    limit: "5",
                    trash: "no"
                };
                const linksRes = await linkAPI.getAll(params);
                console.log(linksRes.data)
                if (linksRes.success && linksRes.data) {
                    setLinkRows(linksRes.data.map(link => ({
                        id: link._id,
                        link_name: link.link_name,
                        clicks: (link.clicks || 0).toString(),
                        status: link.status,
                        slug: link.slug,
                        link: link.link,
                        platform: link.platform,
                        action: "copy",
                        createdAt: formatDate(link.createdAt)
                    })));
                } else {
                    setLinkRows([]);
                }
            } catch (err) {
                console.error('Error fetching links:', err);
                setLinkRows([]);
            }

            // Fetch recent leads
            try {
                const leadsRes = await leadAPI.getAll({ limit: 5 });
                if (leadsRes.success && leadsRes.data) {
                    setLeadRows(leadsRes.data.map(lead => ({
                        id: lead._id,
                        name: lead.name,
                        number: lead.number,
                        link: lead.link,
                        status: lead.status,
                        email: lead.email,
                        platform: lead.platform,
                        location: lead.location,
                        createdAt: formatDate(lead.createdAt)
                    })));
                } else {
                    setLeadRows([]);
                }
            } catch (err) {
                console.error('Error fetching leads:', err);
                setLeadRows([]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data. Please check if the server is running.');
        } finally {
            setLoading(false);
        }
    };
    const LinkColumns = [
        { key: "link_name", label: "Link Name", icon: "/icons/link.svg", color: "#28c76f" },
        { key: "clicks", label: "Clicks", icon: "/icons/click.svg", color: "#7367f0" },
        { key: "platform", label: "Platform", icon: "/icons/platform.svg", color: "#00bad1" },
        { key: "createdAt", label: "Created at", icon: "/icons/d-t.svg", color: "#fd7e14" },
    ];

    const LeadColumns = [
        { key: "name", label: "Name", icon: "/icons/user-1.svg", color: "#28c76f" },
        { key: "status", label: "Status", icon: "/icons/status.svg", color: "#ff4c51" },
        { key: "platform", label: "Platform", icon: "/icons/platform.svg", color: "#20c997" },
        { key: "createdAt", label: "Created at", icon: "/icons/d-t.svg", color: "#fd7e14" }
    ];

    console.log(statsOverview)
    // Show loading state
    if (loading) {
        return (
            <div className="px-4 mt-6">
                <div className="flex-1 w-full max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <div className="text-[var(--text-dark)] text-[1.2em] mb-4">Loading dashboard...</div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="px-4 mt-6">
                <div className="flex-1 w-full max-w-[1400px] mx-auto">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-semibold">Error</p>
                        <p>{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const getPlatformTotal = (name) => {
        const p = statsWeekly.platforms.find(
            x => x.platform.toLowerCase() === name.toLowerCase()
        );
        return p ? p.total : 0;
    };

    const maxPlatformTotal = Math.max(
        ...statsWeekly.platforms.map(p => p.total),
        1
    );

    const instagramTotal = getPlatformTotal("Instagram");
    const facebookTotal = getPlatformTotal("Facebook");
    const whatsappTotal = getPlatformTotal("Whatsapp");

    const instagramPercent = (instagramTotal / maxPlatformTotal) * 100;
    const facebookPercent = (facebookTotal / maxPlatformTotal) * 100;
    const whatsappPercent = (whatsappTotal / maxPlatformTotal) * 100;

    const PLATFORM_COLORS = {
        Instagram: "#E4405F",   // pink/red gradient brand vibe
        Facebook: "#1877F2",   // blue
        Whatsapp: "#25D366",   // green
        Youtube: "#FF0000",   // red
        Linkedin: "#0A66C2",   // blue
        Reddit: "#FF4500",   // orange
        Telegram: "#229ED9",   // light blue
        Threads: "#000000",   // black (Meta decided minimalism)
        TikTok: "#010101",   // near-black (often paired with cyan/pink accents)
        TwitterX: "#000000"    // black (because “X”)
    };

    return (
        <div className="px-4 mt-6">
            <div className="flex-1  w-full max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-6 text-[20px] gap-6">
                    <div className="p-5 shadow-[0px_5px_10px_#7367f030] bg-[var(--bg-w)] rounded-[8px] border-b-[2px] hover:translate-y-[-5px] duration-400  border-[#7367f0]">
                        <div className="flex gap-3 items-center mb-4">
                            <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#7367f030] text-[.85em]">
                                <MaskImage url="/icons/click.svg" w="1.4em" h="1.4em" bg="#7367f0" />
                            </span>
                            <p className="text-[var(--text-dark-1)] text-[1.1em] font-semibold">{loading ? '...' : stats.totalClicks}</p>
                        </div>
                        <p className="text-[var(--text-dark-1)] text-[.9em] font-semibold">Total Clicks</p>
                        <p className="text-[var(--text-dark)] opacity-75 text-[.7em]">User interaction metric</p>
                    </div>
                    <div className="p-5 shadow-[0px_5px_10px_#ff9f4330] bg-[var(--bg-w)] rounded-[8px] border-b-[2px] hover:translate-y-[-5px] duration-400  border-[#ff9f43]">
                        <div className="flex gap-3 items-center mb-4">
                            <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#ff9f4330] text-[.85em]">
                                <MaskImage url="/icons/leads.svg" w="1.5em" h="1.5em" bg="#ff9f43" />
                            </span>
                            <p className="text-[var(--text-dark-1)] text-[1.1em] font-semibold">{loading ? '...' : stats.totalLeads}</p>
                        </div>
                        <p className="text-[var(--text-dark-1)] text-[.9em] font-semibold">Total Leads</p>
                        <p className="text-[var(--text-dark)] opacity-75 text-[.7em]">Conversion metric</p>
                    </div>
                    <div className="p-5 shadow-[0px_5px_10px_#EB3D6330] bg-[var(--bg-w)] rounded-[8px] border-b-[2px] hover:translate-y-[-5px] duration-400  border-[#EB3D63]">
                        <div className="flex gap-3 items-center mb-4">
                            <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#EB3D6330] text-[.85em]">
                                <MaskImage url="/icons/link.svg" w="1.4em" h="1.4em" bg="#EB3D63" />
                            </span>
                            <p className="text-[var(--text-dark-1)] text-[1.1em] font-semibold">{loading ? '...' : stats.totalLinks}</p>
                        </div>
                        <p className="text-[var(--text-dark-1)] text-[.9em] font-semibold">Total Links</p>
                        <p className="text-[var(--text-dark)] opacity-75 text-[.7em]">Resource / asset count</p>
                    </div>
                    <div className="p-5 shadow-[0px_5px_10px_#00bad130] bg-[var(--bg-w)] rounded-[8px] border-b-[2px] hover:translate-y-[-5px] duration-400  border-[#00bad1]">
                        <div className="flex gap-3 items-center mb-4">
                            <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#00bad130] text-[.85em]">
                                <MaskImage url="/icons/chat.svg" w="1.4em" h="1.4em" bg="#00bad1" />
                            </span>
                            <p className="text-[var(--text-dark-1)] text-[1.1em] font-semibold">{loading ? '...' : stats.totalChats}</p>
                        </div>
                        <p className="text-[var(--text-dark-1)] text-[.9em] font-semibold">Total Chats</p>
                        <p className="text-[var(--text-dark)] opacity-75 text-[.7em]">Engagement metric</p>
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-6">
                    <div className="sm:h-[280px] rounded-[6px] col-span-12 lg:col-span-8 xl:col-span-6 w-full bg-[var(--primary-color)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] relative overflow-hidden sm:text-[18px] text-[18px]">
                        <Swiper
                            modules={[Autoplay, Pagination]}
                            onSwiper={(swiper) => (firstSwiper.current = swiper)}
                            className="w-full h-full"
                            spaceBetween={20}
                            slidesPerView={1}
                            loop
                            autoplay={{ delay: 2000, disableOnInteraction: false }}
                            pagination={{ el: paginationRef.current, clickable: true }}
                            onBeforeInit={(swiper) => {
                                swiper.params.pagination.el = paginationRef.current;
                            }}
                        >
                            {((sliderData.length > 0 ? sliderData : [
                                { id: "1", platform: "facebook", count: "0", leads: "0" },
                                { id: "2", platform: "instagram", count: "0", leads: "0" },
                                { id: "3", platform: "youtube", count: "0", leads: "0" }
                            ]).slice(0, 3).map((data, index) => (
                                <SwiperSlide key={`slider-${data.id}-${index}`} className="h-full">
                                    <div className="h-full w-full grid grid-cols-12 pt-10 sm:pt-0">
                                        <div className="col-span-12 order-2 sm:order-1 sm:col-span-6 h-full">
                                            <div className="p-6 flex flex-col h-full justify-between">
                                                <div className="flex flex-col gap-1">
                                                    <h5 className="font-medium text-[var(--text-light)] text-[1em]">Short Link Analytics</h5>
                                                    <p className="text-[var(--text-light)] text-[.73em]">Total 28.5% Conversion Rate</p>
                                                </div>
                                                <div className="social-image-wrapper w-full sm:h-full h-[250px] relative p-5 flex flex-col justify-end sm:hidden">
                                                    <div className="social-image-wrapper-child" style={{ "--platform": `url(/social-media/${data.platform}.png)` }}></div>
                                                </div>
                                                <div className="flex flex-col gap-3 mt-5 sm:mt-0">
                                                    <h5 className="font-medium text-[var(--text-light)] text-[.9em] capitalize">{data.platform}</h5>
                                                    <div className="flex justify-between ">
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-[var(--text-light)] bg-color-mix py-1 px-3 rounded-[4px] text-[.85em]">{data.count}</span>
                                                            <span className="text-[var(--text-light)] text-[.85em]">Clicks</span>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-[var(--text-light)] bg-color-mix py-1 px-3 rounded-[4px] text-[.85em]">{data.leads}</span>
                                                            <span className="text-[var(--text-light)] text-[.85em]">Leads</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-12 order-1 sm:order-2 sm:col-span-6 hidden sm:flex">
                                            <div className="social-image-wrapper w-full sm:h-full  relative p-5 flex flex-col justify-end">
                                                <div className="social-image-wrapper-child" style={{ "--platform": `url(/social-media/${data.platform}.png)` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            )))}
                            <div
                                ref={paginationRef}
                                className="flex gap-2 justify-center mt-3 custom-pagination"
                            />
                        </Swiper>

                    </div>
                    <div className="h-[280px] rounded-[6px] col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3 flex flex-col justify-between w-full bg-[var(--bg-w)] p-6 shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex flex-col">
                            <h5 className="font-medium text-[var(--text-dark)] text-[.8em]">Link Overview</h5>
                            <p className="text-[var(--text-dark)] font-semibold text-[1.2em]">{statsOverview.linkOverview.totalLinks} <span className="text-[.6em] text-[var(--text-2)] ">Total</span></p>
                        </div>
                        <div className="grid grid-cols-2 link-overview-section relative">
                            <div className="flex flex-col">
                                <div className="flex gap-2 items-center">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#00bad130] text-[.85em]">
                                        <MaskImage url="/icons/link.svg" w="1.18em" h="1.18em" bg="#00bad1" />
                                    </span>
                                    <span className="text-[var(--text-dark-1)] text-[.8em]">Clicks</span>
                                </div>
                                <h2 className="text-[var(--text-dark)]  font-semibold text-[1em] mt-4">{statsOverview.linkOverview.clickPercent}%</h2>
                                <p className="text-[var(--text-2)] text-[.8em] m-0">{statsOverview.linkOverview.totalClicks}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex gap-2 items-center justify-end">
                                    <span className="text-[var(--text-dark)] text-[.8em]">Leads</span>
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#7367f030] text-[.85em]">
                                        <MaskImage url="/icons/leads.svg" w="1.18em" h="1.18em" bg="#7367f0" />
                                    </span>
                                </div>
                                <h2 className="text-[var(--text-dark)]  font-semibold text-[1em] mt-4">{statsOverview.linkOverview.leadPercent}%</h2>
                                <p className="text-[var(--text-2)] text-[.8em] m-0">{statsOverview.linkOverview.totalLeads}</p>
                            </div>
                        </div>
                        <div className="percentage h-[12px] rounded-full flex overflow-hidden shadow-[0px_0px_10px_rgba(0,0,0,0.1)]">
                            <div className="bg-[#00bad1] flex w-[70%]"></div>
                            <div className="bg-[#7367f0] flex w-[30%]"></div>
                        </div>
                    </div>
                    <div className="h-[280px] rounded-[6px] col-span-12 md:col-span-6 lg:col-span-5 xl:col-span-3 flex flex-col gap-4 p-4 w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex justify-between">
                            <div className="flex flex-col mb-3">
                                <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Monthly Analytics</h5>
                                <p className="text-[var(--text-2)] font-semibold text-[.65em]">See Analytics percentage data</p>
                            </div>
                            <div className="flex h-max">
                                <Link className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                    <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                                </Link>
                            </div>

                        </div>

                        {statsOverview.monthlyAnalytics.platforms.length > 0 ?
                            statsOverview.monthlyAnalytics.platforms.slice(0, 5).map(data => {
                                return (
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            <span className={`text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] text-[.85em]`} style={{ backgroundColor: `color-mix(in srgb, ${PLATFORM_COLORS[data.platform]} 30%, transparent)` }}>
                                                <MaskImage url={`/icons/${data.platform.toLowerCase()}.svg`} w="1.2em" h="1.2em" bg={PLATFORM_COLORS[data.platform]} />
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-[var(--text-dark)] text-[.7em] font-semibold">{data.platform}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-[var(--text-dark)] opacity-90  font-semibold text-[.7em]">{data.total}</h2>
                                            <span className="text-[var(--c-9)] text-[.55em]">{data.sharePercent}%</span>
                                        </div>
                                    </div>
                                )
                            })
                            :
                            <>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#28c76f30] text-[.85em]">
                                            <MaskImage url="/icons/whatsapp.svg" w="1.2em" h="1.2em" bg="#28c76f" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-dark)] text-[.7em] font-semibold">Whatsapp</span>

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[var(--text-dark)] opacity-90  font-semibold text-[.7em]">0</h2>
                                        <span className="text-[var(--c-9)] text-[.55em]">0%</span>
                                    </div>

                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#ff4c5130] text-[.85em]">
                                            <MaskImage url={`/icons/instagram.svg`} w="1.2em" h="1.2em" bg="#ff4c51" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-dark)] text-[.7em] font-semibold">Instagram</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[var(--text-dark)] opacity-90  font-semibold text-[.7em]">0</h2>
                                        <span className="text-[var(--c-9)] text-[.55em]">0%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#2092EC30] text-[.85em]">
                                            <MaskImage url="/icons/facebook.svg" w="1.2em" h="1.2em" bg="#2092EC" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-dark)] text-[.7em] font-semibold">Facebook</span>

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[var(--text-dark)] opacity-90  font-semibold text-[.7em]">0</h2>
                                        <span className="text-[var(--c-9)] text-[.55em]">0%</span>
                                    </div>

                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-3 items-center">
                                        <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#ff4c5130] text-[.85em]">
                                            <MaskImage url="/icons/youtube.svg" w="1.2em" h="1.2em" bg="#ff4c51" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[var(--text-dark)] text-[.7em] font-semibold">Youtube</span>

                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-[var(--text-dark)] opacity-90  font-semibold text-[.7em]">0</h2>
                                        <span className="text-[var(--c-9)] text-[.55em]">0%</span>
                                    </div>

                                </div>
                            </>
                        }

                    </div>
                    <div className="col-span-12 lg:col-span-8 xl:col-span-6 rounded-[6px] flex flex-col  gap-4 p-6 w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex justify-between">
                            <div className="flex flex-col ">
                                <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Weekly Analytics</h5>
                                <p className="text-[var(--text-2)]  text-[.75em]">See Weekly Analytics data </p>
                            </div>
                            <div className="flex h-max">
                                <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                    <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-10 items-center mt-auto">
                            <div className="col-span-12 sm:col-span-5 md:col-span-4">
                                <div className="flex flex-col h-max justify-center">
                                    <div className="flex gap-2 items-center">
                                        <h2 className="text-[var(--text-dark)] font-bold text-[1.8em]">
                                            {statsWeekly.summary?.thisWeekTotal ?? 0}
                                        </h2>

                                        <span
                                            className={`p-1 px-2 font-semibold h-max rounded-[7px] text-[.6em] ${(statsWeekly.summary?.percentChange ?? 0) >= 0
                                                ? "text-[#28c76f] bg-[#28c76f30]"
                                                : "text-[#ff4c51] bg-[#ff4c5130]"
                                                }`}
                                        >
                                            +{statsWeekly.summary
                                                ? `${statsWeekly.summary.percentChange}%`
                                                : "0%"}
                                        </span>
                                    </div>
                                    <p className="text-[var(--text-dark)] opacity-90 text-[.7em]">You informed of this week compared to last week</p>
                                </div>
                            </div>
                            <div className="col-span-12 sm:col-span-5 md:col-span-6 mt-7 sm:mt-0">
                                <div className="week-lead-graph-wrapper flex items-end gap-4 justify-between sm:justify-end md:justify-between md:ps-20 md:pe-5">
                                    {statsWeekly.week.map((d, i) => {
                                        const max = Math.max(...statsWeekly.week.map(w => w.leads), 1);
                                        const rawHeight = (d.leads / max) * 100;
                                        const height = Math.max(rawHeight, 20);

                                        const todayName = new Date().toLocaleDateString("en-US", { weekday: "short" });
                                        const isToday = d.day === todayName;

                                        return (
                                            <div key={i} className="flex flex-col justify-center gap-3">
                                                <div
                                                    className={`week-lead-graph ${isToday ? "active" : ""}`}
                                                    style={{ "--lead-graph-h": `${height}px` }}
                                                    data-week-count={d.leads}
                                                />
                                                <span className="flex justify-center text-[.65em] text-[var(--text-2)]">
                                                    {d.day}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-12 mt-3  border border-[var(--border)] p-5 sm:p-4 py-5 rounded-[6px]">
                            <div className="col-span-12 sm:col-span-6 md:col-span-4 ">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#fd7e1430] text-[.85em]">
                                        <MaskImage url="/icons/instagram.svg" w="1.2em" h="1.2em" bg="#fd7e14" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[var(--text-dark)] text-[.8em] font-semibold">Instagram</span>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-1">
                                    <span className="text-[var(--text-dark)] text-[1.4em] font-semibold">{instagramTotal}</span>
                                </div>
                                <div className="percentage h-[4px] mt-1 rounded-full flex w-[70%] bg-[#e6e5e7a3]  overflow-hidden shadow-[0px_4px_5px_#fd7e1420]">
                                    <div className="bg-[#fd7e14] flex" style={{ width: `${instagramPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="col-span-12 sm:col-span-6 md:col-span-4 sm:mt-0 mt-8">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#00bad130] text-[.85em]">
                                        <MaskImage url="/icons/facebook.svg" w="1.2em" h="1.2em" bg="#00bad1" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[var(--text-dark)] text-[.8em] font-semibold">FaceBook</span>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-1">
                                    <span className="text-[var(--text-dark)] text-[1.4em] font-semibold">{facebookTotal}</span>
                                </div>
                                <div className="percentage h-[4px] mt-1 rounded-full flex w-[70%] bg-[#e6e5e7a3]  overflow-hidden shadow-[0px_4px_5px_#00bad120]">
                                    <div className="bg-[#00bad1] flex" style={{ width: `${facebookPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="col-span-12 sm:col-span-6 md:col-span-4 md:mt-0 mt-8">
                                <div className="flex gap-3 items-center">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[#28c76f30] text-[.85em]">
                                        <MaskImage url="/icons/whatsapp.svg" w="1.2em" h="1.2em" bg="#28c76f" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-[var(--text-dark)] text-[.8em] font-semibold">WhatsApp</span>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-1">
                                    <span className="text-[var(--text-dark)] text-[1.4em] font-semibold">{whatsappTotal}</span>
                                </div>
                                <div className="percentage h-[4px] mt-1 rounded-full flex w-[70%] bg-[#e6e5e7a3]  overflow-hidden shadow-[0px_4px_5px_#28c76f20]">
                                    <div className="bg-[#28c76f] flex" style={{ width: `${whatsappPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8  xl:col-span-6 rounded-[6px] flex flex-col   pb-0 w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex justify-between p-6">
                            <div className="flex flex-col ">
                                <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Leads and Clicks Analytics</h5>
                                <p className="text-[var(--text-2)]  text-[.75em]">See Leads and Clicks Analytics data </p>
                            </div>
                            <div className="flex h-max">
                                <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                    <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                                </Link>
                            </div>
                        </div>
                        <ClicksLeadsCombinedChart />
                    </div>
                    <div className="col-span-12 lg:col-span-8 xl:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex justify-between shadow-[0px_0px_10px_rgba(0,0,0,0.1)] px-6 py-4 items-center">
                            <div className="flex flex-col ">
                                <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Links Details</h5>
                                <p className="text-[var(--text-2)]  text-[.75em]">See Links Details data </p>
                            </div>
                            <div className="flex h-max">
                                <Link to={"/all-links"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                    <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                                </Link>
                            </div>
                        </div>
                        <div className="lead-data-content-wrapper text-[15px] overflow-x-auto w-full px-6 pb-5">
                            <div className="heading grid grid-cols-4 min-w-[650px] w-max items-center  w-full border-t border-[var(--hover)]">
                                {LinkColumns.map(col => (
                                    <div key={col.key} className="">
                                        <div className="flex gap-2 items-center py-4 ">
                                            {col.icon &&
                                                <span
                                                    style={{ backgroundColor: `${col.color}30` }}
                                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                                    <MaskImage url={col.icon} w="1em" h="1em" bg={col.color} />
                                                </span>
                                            }
                                            <span className="text-[var(--text-dark)] font-semibold text-[.8em] uppercase">{col.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {linkRows.map(data => (
                                <div className={`grid grid-cols-4 min-w-[650px] w-max relative items-center w-full  cursor-pointer`}>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-4  min-w-0">
                                            <span className="text-[var(--text-dark)] font-semibold  text-[.85em] capitalize truncate" title={data.link_name}>{data.link_name}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-4  min-w-0">
                                            <span className="text-[var(--text-dark)] font-semibold  text-[.85em] capitalize truncate" title={data.clicks}>{data.clicks}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-3  min-w-0">
                                            <span className="text-[var(--text-light)]  font-semibold py-1 w-[85%] flex items-center justify-center rounded-full text-[.85em] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] capitalize truncate" title={data.platform}>{data.platform}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-4  min-w-0">
                                            <span className="text-[var(--text-dark)] font-semibold  text-[.8em] capitalize truncate" title={data.createdAt}>{data.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8 xl:col-span-6 rounded-[6px] flex flex-col w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
                        <div className="flex justify-between shadow-[0px_0px_10px_rgba(0,0,0,0.1)] px-6 py-4 items-center">
                            <div className="flex flex-col ">
                                <h5 className="font-semibold text-[var(--text-dark)] text-[.9em]">Lead Details</h5>
                                <p className="text-[var(--text-2)]  text-[.75em]">See Lead Details data </p>
                            </div>
                            <div className="flex h-max">
                                <Link to={"/all-leads"} className="text-[var(--text-light)] flex h-auto p-[5px] rounded-full bg-[var(--primary-color)] text-[.85em] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] hover:bg-[var(--bg-w)] duration-300">
                                    <MaskImage url="/icons/top-arrow.svg" w="1.2em" h="1.2em" bg="var(--text-light)" hBg="var(--primary-color" hL="2" />
                                </Link>
                            </div>
                        </div>
                        <div className="lead-data-content-wrapper text-[15px] overflow-x-auto w-full px-6">
                            <div className="heading grid grid-cols-4 items-center min-w-[650px] w-max  w-full border-t border-[var(--hover)]">

                                {LeadColumns.map(col => (
                                    <div key={col.key} className="">
                                        <div className="flex gap-2 items-center py-4 ">
                                            {col.icon &&
                                                <span
                                                    style={{ backgroundColor: `${col.color}30` }}
                                                    className="text-[var(--text-light)]  p-[3px] rounded-[4px] text-[.85em]">
                                                    <MaskImage url={col.icon} w="1em" h="1em" bg={col.color} />
                                                </span>
                                            }
                                            <span className="text-[var(--text-dark)] font-semibold text-[.8em] uppercase">{col.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {leadRows.map(data => (
                                <div className={`grid grid-cols-4 relative min-w-[650px] w-max items-center w-full  cursor-pointer`}>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-4  min-w-0">
                                            <span className="text-[var(--text-dark)] font-semibold  text-[.85em] capitalize truncate" title={data.name}>{data.name}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-4  min-w-0">
                                            <span className="text-[var(--text-dark)] font-semibold  text-[.85em] capitalize truncate" title={data.status}>{data.status}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-3  min-w-0">
                                            <span className="text-[var(--text-light)]  font-semibold py-1 w-[85%] flex items-center justify-center rounded-full text-[.85em] bg-[var(--primary-color)] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_40%,#ffffff00)] capitalize truncate" title={data.platform}>{data.platform}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[var(--hover)]">
                                        <div className="flex gap-2 items-center py-4  min-w-0">
                                            <span className="text-[var(--text-dark)] font-semibold  text-[.8em] capitalize truncate" title={data.createdAt}>{data.createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                    <div className="col-span-12 rounded-[6px] flex flex-col gap-4 pb-0 w-full bg-[var(--bg-w)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] text-[20px]">
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

        </div >
    );
}

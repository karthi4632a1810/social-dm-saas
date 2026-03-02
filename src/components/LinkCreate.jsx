import { useState, useEffect } from "react";
import MaskImage from "../components/MaskImage";
import { formAPI, linkAPI } from "../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../utils/toast";


export default function LinkCreate({ ln = "", url = "", pf = "", cs = "", id, destinationType: propDestinationType = "", onSuccess }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit') || id;
    const StatusParam = searchParams.get('status') || "active";

    const [selectedPlatform, setSelectedPlatform] = useState(pf || "Instagram");
    const [linkName, setLinkName] = useState(ln);
    const [linkUrl, setLinkUrl] = useState(url);
    const [slug, setSlug] = useState(cs);
    const [linkId, setLinkId] = useState(editId || null);
    const [destinationType, setDestinationType] = useState(propDestinationType || "url");
    const [selectedFormId, setSelectedFormId] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [whatsappMessage, setWhatsappMessage] = useState("");
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editId) {
            setLinkId(editId);
        }
    }, [editId]);

    useEffect(() => {
        setSelectedPlatform(pf || "Instagram");
        setLinkName(ln);
        setLinkUrl(url);
        setSlug(cs);
        if (propDestinationType) {
            setDestinationType(propDestinationType);
        }
    }, [ln, url, cs, pf, propDestinationType]);

    useEffect(() => {
        fetchForms();
    }, []);

    useEffect(() => {
        if (linkId) {
            fetchLinkDetails();
        }
    }, [linkId]);

    const fetchLinkDetails = async () => {
        try {
            const response = await linkAPI.getById(linkId);
            if (response.success && response.data) {
                const link = response.data;
                setLinkName(link.link_name || "");
                setLinkUrl(link.link || "");
                setSlug(link.slug || "");
                setSelectedPlatform(link.platform || "Instagram");
                setDestinationType(link.destinationType || "url");
                if (link.destinationType === "form" && link.formId) {
                    setSelectedFormId(link.formId._id || link.formId);
                }
                if (link.destinationType === "whatsapp") {
                    setWhatsappNumber(link.whatsappNumber || "");
                    setWhatsappMessage(link.whatsappMessage || "");
                }
            }
        } catch (error) {
            console.error('Error fetching link details:', error);
        }
    };

    const fetchForms = async () => {
        try {
            const param = {
                trash: "no"
            }
            const response = await formAPI.getAll(param);
            if (response.success) {
                setForms(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching forms:', error);
        }
    };

    const platformIcons = [
        {
            icon: "/icons/instagram.svg",
            title: "Instagram"
        },
        {
            icon: "/icons/facebook.svg",
            title: "Facebook"
        },
        {
            icon: "/icons/whatsapp.svg",
            title: "Whatsapp"
        },
        {
            icon: "/icons/youtube.svg",
            title: "Youtube"
        },
        {
            icon: "/icons/linkedin.svg",
            title: "Linkedin"
        },
        {
            icon: "/icons/reddit.svg",
            title: "Reddit"
        },
        {
            icon: "/icons/telegram.svg",
            title: "Telegram"
        },
        {
            icon: "/icons/threads.svg",
            title: "Threads"
        },
        {
            icon: "/icons/tiktok.svg",
            title: "TikTok"
        },
        {
            icon: "/icons/twitterx.svg",
            title: "TwitterX"
        }
    ];


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!linkName.trim()) {
            showToast("Link name is required", "error");
            setLoading(false);
            return;
        }

        if (!slug.trim()) {
            showToast("Custom slug is required", "error");
            setLoading(false);
            return;
        }

        if (destinationType === "url" && !linkUrl.trim()) {
            showToast("URL is required for URL destination", "error");
            setLoading(false);
            return;
        }

        if (destinationType === "form" && !selectedFormId) {
            showToast("Please select a form", "error");
            setLoading(false);
            return;
        }

        if (destinationType === "whatsapp") {
            if (!whatsappNumber.trim()) {
                showToast("WhatsApp number is required", "error");
                setLoading(false);
                return;
            }
            if (!whatsappMessage.trim()) {
                showToast("WhatsApp message is required", "error");
                setLoading(false);
                return;
            }
        }

        try {
            const linkData = {
                link_name: linkName,
                slug: slug,
                platform: selectedPlatform,
                destinationType: destinationType,
                status: StatusParam
            };

            if (destinationType === "url") {
                linkData.link = linkUrl;
            } else if (destinationType === "form") {
                linkData.formId = selectedFormId;
            } else if (destinationType === "whatsapp") {
                linkData.whatsappNumber = whatsappNumber;
                linkData.whatsappMessage = whatsappMessage;
            }

            let response;
            if (linkId) {
                response = await linkAPI.update(linkId, linkData);
            } else {
                response = await linkAPI.create(linkData);
            }

            if (response.success) {
                showToast(linkId ? "Link updated successfully!" : "Link created successfully!", "success");
                setTimeout(() => {
                    if (linkId) {
                        // Reset form for editing
                        setLinkId(null);
                        setLinkName("");
                        setLinkUrl("");
                        setSlug("");
                        setDestinationType("url");
                        setSelectedFormId("");
                        setWhatsappNumber("");
                        setWhatsappMessage("");
                        if (onSuccess) {
                            onSuccess();
                        }
                    } else {
                        // Reset form for new creation
                        setLinkName("");
                        setLinkUrl("");
                        setSlug("");
                        setDestinationType("url");
                        setSelectedFormId("");
                        setWhatsappNumber("");
                        setWhatsappMessage("");
                        if (onSuccess) {
                            onSuccess();
                        }
                    }
                }, 1500);
            } else {
                showToast(response.message || (linkId ? "Failed to update link" : "Failed to create link"), "error");
            }
        } catch (err) {
            showToast("An error occurred. Please try again.", "error");
            console.error("Link creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    const generateWhatsAppUrl = () => {
        if (whatsappNumber && whatsappMessage) {
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const encodedMessage = encodeURIComponent(whatsappMessage);
            return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        }
        return "";
    };

    const getCurrentPlatformIcon = () => {
        const platform = platformIcons.find(p => p.title.toLowerCase() === selectedPlatform.toLowerCase());
        return platform ? platform.icon : "/icons/instagram.svg";
    };

    return (
        <div id="create-short-link" className="w-full max-w-[600px]">
            <div className="create-short-link-form-wrapper bg-[var(--bg-w)] w-full rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-6 text-[20px]">
                <h2 className="text-[var(--text-dark)] text-[1.2em] font-semibold mb-2">{linkId ? "Update" : "Create"} Short Links</h2>
                <p className="text-[var(--text-dark)] text-[.65em] opacity-75 mb-6">{linkId ? "Update" : "Create"} clean, powerful short links in seconds to track your marketing performance.</p>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 mt-5 gap-6">
                    {/* Link Name */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                <MaskImage url="/icons/link.svg" w="1em" h="1em" bg="var(--primary-color)" />
                            </span>
                            <label htmlFor="link-name" className="text-[.63em] text-[var(--text-dark)] font-semibold">Link Name</label>
                        </div>
                        <input
                            type="text"
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                            id="link-name"
                            className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 w-full"
                            placeholder="Ex: Instagram Bio Link"
                        />
                    </div>

                    {/* Destination Type - Horizontal Radio Buttons */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                <MaskImage url="/icons/url.svg" w="1em" h="1em" bg="var(--primary-color)" />
                            </span>
                            <label className="text-[.63em] text-[var(--text-dark)] font-semibold">Destination Type</label>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="dest-url"
                                    name="destinationType"
                                    value="url"
                                    checked={destinationType === "url"}
                                    onChange={(e) => setDestinationType(e.target.value)}
                                    className="w-4 h-4 text-[var(--primary-color)] accent-[var(--primary-color)]"
                                />
                                <label htmlFor="dest-url" className="text-[.7em] text-[var(--text-dark)] cursor-pointer">
                                    Phone / URL
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="dest-form"
                                    name="destinationType"
                                    value="form"
                                    checked={destinationType === "form"}
                                    onChange={(e) => setDestinationType(e.target.value)}
                                    className="w-4 h-4 text-[var(--primary-color)] accent-[var(--primary-color)]"
                                />
                                <label htmlFor="dest-form" className="text-[.7em] text-[var(--text-dark)] cursor-pointer">
                                    Form
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    id="dest-whatsapp"
                                    name="destinationType"
                                    value="whatsapp"
                                    checked={destinationType === "whatsapp"}
                                    onChange={(e) => setDestinationType(e.target.value)}
                                    className="w-4 h-4 text-[var(--primary-color)] accent-[var(--primary-color)]"
                                />
                                <label htmlFor="dest-whatsapp" className="text-[.7em] text-[var(--text-dark)] cursor-pointer">
                                    WhatsApp
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* URL Destination */}
                    {destinationType === "url" && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                    <MaskImage url="/icons/url.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                </span>
                                <label htmlFor="destination" className="text-[.63em] text-[var(--text-dark)] font-semibold">Destination URL</label>
                            </div>
                            <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                id="destination"
                                className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 w-full"
                                placeholder="https://example.com or tel:+1234567890"
                                required
                            />
                        </div>
                    )}

                    {/* Form Destination */}
                    {destinationType === "form" && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                    <MaskImage url="/icons/link.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                </span>
                                <label htmlFor="form-select" className="text-[.63em] text-[var(--text-dark)] font-semibold">Select Form</label>
                            </div>
                            <div className="relative w-full">
                                <select
                                    id="form-select"
                                    value={selectedFormId}
                                    onChange={(e) => setSelectedFormId(e.target.value)}
                                    className="appearance-none bg-[var(--bg-w)] create-input w-full rounded-[8px] p-[9px] px-3 pr-9 text-[.7em] text-[var(--text-dark-1)]"
                                    required
                                >
                                    <option value="">Select a form...</option>
                                    {forms.map(form => (
                                        <option key={form._id} value={form._id}>
                                            {form.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                    <MaskImage
                                        url="/icons/arrow-down.svg"
                                        w="1.2em"
                                        h="1.2em"
                                        bg="var(--text-dark-1)"
                                    />
                                </span>
                            </div>
                            {forms.length === 0 && (
                                <div className="text-[.65em] text-[var(--text-dark)] mt-1">
                                    No forms available. <a href="/create-form" className="text-[var(--primary-color)] hover:underline">Create a form</a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* WhatsApp Destination */}
                    {destinationType === "whatsapp" && (
                        <>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                        <MaskImage url="/icons/whatsapp.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="whatsapp-number" className="text-[.63em] text-[var(--text-dark)] font-semibold">WhatsApp Number</label>
                                </div>
                                <input
                                    type="text"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    id="whatsapp-number"
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 w-full"
                                    placeholder="+1234567890 or 1234567890"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                        <MaskImage url="/icons/message.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="whatsapp-message" className="text-[.63em] text-[var(--text-dark)] font-semibold">Message</label>
                                </div>
                                <textarea
                                    value={whatsappMessage}
                                    onChange={(e) => setWhatsappMessage(e.target.value)}
                                    id="whatsapp-message"
                                    rows="4"
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3 w-full"
                                    placeholder="Enter your WhatsApp message here..."
                                    required
                                />
                            </div>
                            {whatsappNumber && whatsappMessage && (
                                <div className="p-3 bg-[var(--hover)] rounded-[8px] text-[.65em] text-[var(--text-dark)]">
                                    <p className="font-semibold mb-1">Preview URL:</p>
                                    <p className="break-all">{generateWhatsAppUrl()}</p>
                                </div>
                            )}
                        </>
                    )}
                    {/* Social Media & Custom Slug - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Social Media */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                    <MaskImage url="/icons/platform.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                </span>
                                <label htmlFor="social-media" className="text-[.63em] text-[var(--text-dark)] font-semibold">Social Media</label>
                            </div>
                            <div className="flex w-full gap-2">
                                <span className="text-[var(--text-light)] bg-white-color-mix px-2 py-[5px] bg-[color-mix(in_srgb,var(--primary-color)_20%,rgba(255,255,255,0))] flex items-center justify-center rounded-[7px] text-[.85em]">
                                    <MaskImage url={getCurrentPlatformIcon()} w="1.4em" h="1.4em" bg="var(--primary-color)" />
                                </span>
                                <div className="relative flex-1">
                                    <select
                                        id="social-media"
                                        value={selectedPlatform}
                                        onChange={(e) => setSelectedPlatform(e.target.value)}
                                        className="appearance-none bg-[var(--bg-w)] create-input w-full rounded-[8px] p-[9px] px-3 pr-9 text-[.7em] text-[var(--text-dark-1)]"
                                    >
                                        {platformIcons.map(plat => (
                                            <option key={plat.title} value={plat.title}>
                                                {plat.title}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                        <MaskImage
                                            url="/icons/arrow-down.svg"
                                            w="1.2em"
                                            h="1.2em"
                                            bg="var(--text-dark-1)"
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Custom Slug */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-[var(--text-light)] bg-white-color-mix  rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                    <MaskImage url="/icons/slug.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                </span>
                                <label htmlFor="custom-slug" className="text-[.63em] text-[var(--text-dark)] font-semibold">Custom Slug</label>
                            </div>
                            <div className="flex items-center gap-0">
                                <span className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] create-input rounded-l-[8px] p-[9px] px-3 border-r border-[var(--border)]">
                                    clck.ly/
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    id="custom-slug"
                                    className="bg-[var(--bg-w)] text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-r-[8px] rounded-l-none p-[9px] px-3 flex-1 border-0"
                                    placeholder="instagram-link"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Create Short Link Button */}
                    <div className="flex gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 cursor-pointer text-[var(--text-light)] font-semibold tracking-[1px] flex items-center justify-center gap-2 bg-[var(--primary-color)] py-3 rounded-[8px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300 disabled:opacity-50 text-[.85em]">
                            {loading ? (linkId ? "Updating..." : "Creating...") : (linkId ? "Update Short Link" : "Create Short Link")}
                            {!loading && (
                                <MaskImage
                                    url="/icons/top-arrow.svg"
                                    w="1.2em"
                                    h="1.2em"
                                    bg="var(--text-light)"
                                />
                            )}
                        </button>
                        {destinationType === "form" && (
                            <button
                                type="button"
                                onClick={() => navigate("/create-form")}
                                className="px-4 cursor-pointer text-[var(--text-dark)] font-semibold items-center justify-center bg-[var(--hover)] py-2 rounded-[5px] hover:bg-[var(--border)] duration-300 text-[.7em]">
                                New Form
                            </button>
                        )}
                    </div>


                </form>
            </div >
        </div>
    );
}

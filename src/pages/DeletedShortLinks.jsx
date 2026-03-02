import { useState, useEffect } from "react";
import MaskImage from "../components/MaskImage";
import { linkAPI, formatDate } from "../utils/api";
import { showToast } from "../utils/toast";
import { Link } from "react-router-dom";

export default function DeletedShortLinks() {
    const [deletedLinks, setDeletedLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchDeletedLinks();
    }, []);

    const fetchDeletedLinks = async () => {
        try {
            setLoading(true);
            // Note: Links don't have soft delete yet, so this will need backend support
            // For now, we'll show paused links or implement soft delete
            const response = await linkAPI.getAll();
            if (response.success) {
                setDeletedLinks((response.data || []).filter(link => link.inTrash == "yes"));
            } else {
                showToast(response.message || "Failed to fetch deleted links", "error");
            }
        } catch (err) {
            console.error("Error fetching deleted links:", err);
            showToast("An error occurred while fetching deleted links", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (linkId) => {
        try {
            const response = await linkAPI.update(linkId, { inTrash: "no" });
            if (response.success) {
                setDeletedLinks(deletedLinks.filter(link => link._id !== linkId));
                showToast("Link restored successfully! It will now appear in Manage Short Links.", "success");
            } else {
                showToast(response.message || "Failed to restore link", "error");
            }
        } catch (err) {
            console.error("Error restoring link:", err);
            showToast("An error occurred while restoring the link", "error");
        }
    };

    const handlePermanentDelete = async (linkId) => {
        if (!window.confirm("Are you sure you want to permanently delete this link? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await linkAPI.delete(linkId);
            if (response.success) {
                setDeletedLinks(deletedLinks.filter(link => link._id !== linkId));
                showToast("Link permanently deleted!", "success");
            } else {
                showToast(response.message || "Failed to delete link", "error");
            }
        } catch (err) {
            console.error("Error deleting link:", err);
            showToast("An error occurred while deleting the link", "error");
        }
    };

    const filteredLinks = deletedLinks.filter(link => {
        const matchesSearch = link.link_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (link.link && link.link.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const getDestinationDisplay = (link) => {
        if (link.destinationType === 'url') {
            return link.link || 'N/A';
        } else if (link.destinationType === 'form') {
            return link.formId?.name || 'Form';
        } else if (link.destinationType === 'whatsapp') {
            return `WhatsApp: ${link.whatsappNumber || 'N/A'}`;
        }
        return 'N/A';
    };

    if (loading) {
        return (
            <div className="px-4 mt-6">
                <div className="flex-1 w-full max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <div className="text-[var(--text-dark)] text-[1.2em] mb-4">Loading deleted links...</div>
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 mt-6">
            <div className="flex-1 w-full max-w-[1400px] mx-auto">
                <div className="mb-6">
                    <h1 className="text-[var(--text-dark)] text-[1.5em] font-semibold mb-1">Deleted Short Links</h1>
                    <p className="text-[var(--text-dark)] text-[.85em] opacity-75">View and restore or permanently delete your deleted links</p>
                </div>

                {/* Search */}
                <div className="bg-[var(--bg-w)] rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[.7em] text-[var(--text-dark)] font-semibold">Search Deleted Links</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, slug, or URL..."
                                className="w-full bg-[var(--bg-w)] text-[.85em] text-[var(--text-dark-1)] create-input rounded-[8px] p-[9px] px-3 pl-10"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                <MaskImage
                                    url="/icons/search.svg"
                                    w="1.2em"
                                    h="1.2em"
                                    bg="var(--text-dark-1)"
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Deleted Links List */}
                <div className="bg-[var(--bg-w)] rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] lg:p-6 p-3">
                    {filteredLinks.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <p className="text-[var(--text-dark)] text-[1em] mb-4">No deleted links found</p>
                            <Link
                                to="/manage-short-links"
                                className="flex gap-2 w-max text-[.9em]  cursor-pointer text-[var(--text-light)] font-semibold  items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                            >
                                Go to Manage Links
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid grid-cols-12 gap-4">
                            {filteredLinks.map((link) => {
                                const shortLink = `${window.location.origin}/shortlinks/${link.slug}`;
                                return (
                                    <div
                                        key={link._id}
                                        className="border 2xl:col-span-4 md:col-span-6 col-span-12 border-[var(--border)] m-0 rounded-[10px]   text-[14px] shadow-lg transition-all duration-300"
                                    >

                                        <div className="flex min-w-0">
                                            <div className="link-platform-logo-wrapper shadow-[3px_0px_10px_rgba(0,0,0,0.2)] w-[60px] flex justify-center bg-[var(--primary-color)] rounded-tl-[8px] rounded-bl-[8px] pt-3">
                                                <MaskImage url={`/icons/${link.platform.toLowerCase()}.svg`} w="2.5em" h="2.5em" bg="white" />
                                            </div>
                                            <div className="link-content-wrapper p-4 w-full">
                                                <div className="flex justify-between items-center">
                                                    <h1 className="text-[var(-text-dark)] font-semibold text-[1.2em]">{link.link_name}</h1>
                                                    <p className={`text-[var(-text-dark)] text-[.8em] font-semibold p-1 px-3  rounded-[5px] bg-red-100 text-red-700`}>Deleted</p>

                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[var(--text-light)] bg-white-color-mix">
                                                        <MaskImage url={`/icons/${link.platform.toLowerCase()}.svg`} w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                                    </span>
                                                    <div className="text-[.8em] text-[var(--text-dark)] flex items-center  font-semibold">
                                                        <span>{link.platform}</span>
                                                        <span className="text-[var(--text-light)] bg-white-color-mix translate-y-[1px]">
                                                            <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                        </span>
                                                        <span>{link.clicks > 1 ? link.clicks + " clicks" : link.clicks + " click"}</span>
                                                        <span className="text-[var(--text-light)] bg-white-color-mix translate-y-[1px]">
                                                            <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                        </span>
                                                        <span>Deleted</span>
                                                    </div>
                                                </div>

                                                <div className="text-[var(-text-dark)] mt-4 shadow-[0px_0px_10px_rgba(0,0,0,0.04)] border border-[var(--border)] text-[.9em] font-semibold p-2 px-3 bg-[color-mix(in_srgb,var(--primary-color)_7%,rgba(255,255,255,0))] rounded-[10px] ">clck.ly/{link.slug}</div>

                                                <div className="flex gap-2 mt-4 text-[14px]">
                                                    <div
                                                        onClick={() => handleRestore(link._id)}
                                                        title="Restore Link"
                                                        className="text-[var(-text-dark)] w-full cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[.85em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                        <MaskImage url="/icons/restore.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                        Restore
                                                    </div>
                                                    <div
                                                        onClick={() => handlePermanentDelete(link._id)}
                                                        title="Delete Link"
                                                        className="text-[var(--primary-color)] w-full cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--primary-color)] text-[.85em] font-semibold p-2 px-4 bg-[color-mix(in_srgb,var(--primary-color)_10%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                        <MaskImage url="/icons/delete.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                        Delete Forever
                                                    </div>

                                                </div>

                                            </div>
                                        </div>


                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

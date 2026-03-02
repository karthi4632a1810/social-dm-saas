import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import { contactCardAPI, capitalizeWords } from "../utils/api";
import { showToast } from "../utils/toast";

export default function DeletedCards() {
    const [deletedCards, setDeletedCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchDeletedCards();
    }, []);

    const fetchDeletedCards = async () => {
        try {
            setLoading(true);

            const response = await contactCardAPI.getAll();

            console.log("API response:", response);

            if (response.success) {
                console.log((response.data).filter(f => f.inTrash == "yes"))
                setDeletedCards(
                    (response.data || []).filter(f => f.inTrash == "yes")
                );
            } else {
                showToast(response.message || "Failed to fetch deleted Cards", "error");
            }
        } catch (err) {
            console.error("Error fetching deleted Cards:", err);
            showToast("An error occurred while fetching deleted Cards", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (cardId) => {
        try {
            const response = await contactCardAPI.update(cardId, { inTrash: "no" });
            if (response.success) {
                setDeletedCards(deletedCards.filter(card => card._id !== cardId));
                showToast("Form restored successfully! It will now appear in Manage Forms.", "success");
            } else {
                showToast(response.message || "Failed to restore Form", "error");
            }
        } catch (err) {
            console.error("Error restoring Form:", err);
            showToast("An error occurred while restoring the Form", "error");
        }
    };

    const handlePermanentDelete = async (cardId) => {
        if (!window.confirm("Are you sure you want to permanently delete this card? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await contactCardAPI.permanentDelete(cardId);
            if (response.success) {
                setDeletedCards(deletedCards.filter(card => card._id !== cardId));
                showToast("Card permanently deleted!", "success");
            } else {
                showToast(response.message || "Failed to delete Card", "error");
            }
        } catch (err) {
            console.error("Error deleting Card:", err);
            showToast("An error occurred while deleting the Card", "error");
        }
    };

    const filteredCards = deletedCards.filter(card => {
        const matchesSearch = card.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (card.content && card.content.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="px-4 mt-6">
                <div className="flex-1 w-full max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <div className="text-[var(--text-dark)] text-[1.2em] mb-4">Loading deleted cards...</div>
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
                <div className="flex md:flex-row flex-col justify-between md:items-center mb-6 gap-5">
                    <div>
                        <h1 className="text-[var(--text-dark)] text-[1.5em] font-semibold mb-1">Deleted Cards</h1>
                        <p className="text-[var(--text-dark)] text-[.85em] opacity-75">View and restore deleted Cards</p>
                    </div>
                    <Link
                        to="/manage-cards"
                        className="flex gap-2 w-max text-[.9em] cursor-pointer text-[var(--text-light)] font-semibold items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                    >
                        Back to Manage cards
                    </Link>
                </div>

                {/* Search */}
                <div className="bg-[var(--bg-w)] rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[.7em] text-[var(--text-dark)] font-semibold">Search Deleted Cards</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or description..."
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

                {/* Deleted cards List */}
                <div className="bg-[var(--bg-w)] rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] lg:p-6 p-3">
                    {filteredCards.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <p className="text-[var(--text-dark)] text-[1em] mb-4">No deleted Cards found</p>
                            <Link
                                to="/manage-cards"
                                className="flex gap-2 w-max text-[.8em]  cursor-pointer text-[var(--text-light)] font-semibold items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                            >
                                Go to Manage Cards
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid grid-cols-12 gap-4">
                            {filteredCards.map((card) => (
                                <div
                                    key={card._id}
                                    className="border 2xl:col-span-4 md:col-span-6 col-span-12 border-[var(--border)] m-0 rounded-[8px]  text-[15px] shadow-lg transition-all duration-300 p-3"
                                >

                                    <div className="flex min-w-0">
                                        <div className="card-image-wrapper w-[200px] aspect-square border-[2px] border-[var(--border)] bg-[var(--bg-light)] shadow-[0px_0px_10px_rgba(0,0,0,0.06)] overflow-hidden rounded-[5px]">
                                            <img
                                                src={"/server" + card.image}
                                                className=" w-full h-full left-0 top-0 object-cover"
                                                alt="avatar"
                                            />
                                        </div>
                                        <div className="flex flex-col px-3 w-full">
                                            <div className="flex justify-between  w-full">
                                                <div className="">
                                                    <h1 className="text-[var(--text-dark)] font-semibold text-[1.3em]">{capitalizeWords(card.fullName)}</h1>
                                                    <h1 className="text-[var(--text-dark-1)]  text-[1em]">{capitalizeWords(card.role)}</h1>
                                                </div>
                                                <p className={`text-[var(-text-dark)] h-max text-[.8em] font-semibold p-1 px-3  rounded-[10px] bg-red-100 text-red-700`}>Deleted</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-3 ">
                                                <span className="text-[var(--text-light)] bg-white-color-mix">
                                                    <MaskImage url={`/icons/mail.svg`} w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                                </span>
                                                <div className="text-[.8em] text-[var(--text-dark)] flex items-center  font-semibold">
                                                    <span>{card.platforms.length < 1 ? card.platforms.length + " Media" : card.platforms.length + " Medias"} </span>
                                                    <span className="text-[var(--text-light)] bg-white-color-mix translate-y-[1px]">
                                                        <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                    </span>
                                                    <span>{card.pageViews < 1 ? card.pageViews + "  View" : card.pageViews + "  Views"}</span>
                                                    <span className="text-[var(--text-light)] bg-white-color-mix translate-y-[1px]">
                                                        <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                    </span>
                                                    <span>{card.isActive ? "Active" : "Deactive"}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4 text-[14px]">
                                                <div
                                                    onClick={() => handleRestore(card._id)}
                                                    title="Restore Card"
                                                    className="text-[var(-text-dark)] w-full cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[.85em] font-semibold p-2 px-2 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                    <MaskImage url="/icons/restore.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                    Restore
                                                </div>

                                                <div
                                                    onClick={() => handlePermanentDelete(card._id)}
                                                    title="Delete Card"
                                                    className="text-[var(--primary-color)] w-full cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--primary-color)] text-[.85em] font-semibold p-2 px-2 bg-[color-mix(in_srgb,var(--primary-color)_10%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                    <MaskImage url="/icons/delete.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                    Delete Forever
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

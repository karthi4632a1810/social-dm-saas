import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import { formAPI } from "../utils/api";
import { showToast } from "../utils/toast";

export default function DeletedForms() {
    const [deletedForms, setDeletedForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchDeletedForms();
    }, []);

    const fetchDeletedForms = async () => {
        try {
            setLoading(true);

            const response = await formAPI.getAll();

            console.log("API response:", response);

            if (response.success) {
                console.log((response.data).filter(f => f.inTrash == "yes"))
                setDeletedForms(
                    (response.data || []).filter(f => f.inTrash == "yes")
                );
            } else {
                showToast(response.message || "Failed to fetch deleted forms", "error");
            }
        } catch (err) {
            console.error("Error fetching deleted forms:", err);
            showToast("An error occurred while fetching deleted forms", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (formId) => {
        try {
            const response = await formAPI.update(formId, { inTrash: "no" });
            if (response.success) {
                setDeletedForms(deletedForms.filter(form => form._id !== formId));
                showToast("Form restored successfully! It will now appear in Manage Forms.", "success");
            } else {
                showToast(response.message || "Failed to restore form", "error");
            }
        } catch (err) {
            console.error("Error restoring form:", err);
            showToast("An error occurred while restoring the form", "error");
        }
    };

    const handlePermanentDelete = async (formId) => {
        if (!window.confirm("Are you sure you want to permanently delete this form? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await formAPI.permanentDelete(formId);
            if (response.success) {
                setDeletedForms(deletedForms.filter(form => form._id !== formId));
                showToast("Form permanently deleted!", "success");
            } else {
                showToast(response.message || "Failed to delete form", "error");
            }
        } catch (err) {
            console.error("Error deleting form:", err);
            showToast("An error occurred while deleting the form", "error");
        }
    };

    const filteredForms = deletedForms.filter(form => {
        const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="px-4 mt-6">
                <div className="flex-1 w-full max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-center h-[60vh]">
                        <div className="text-center">
                            <div className="text-[var(--text-dark)] text-[1.2em] mb-4">Loading deleted forms...</div>
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
                        <h1 className="text-[var(--text-dark)] text-[1.5em] font-semibold mb-1">Deleted Forms</h1>
                        <p className="text-[var(--text-dark)] text-[.85em] opacity-75">View and restore deleted forms</p>
                    </div>
                    <Link
                        to="/manage-forms"
                        className="flex gap-2 w-max text-[.9em] cursor-pointer text-[var(--text-light)] font-semibold items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                    >
                        Back to Manage Forms
                    </Link>
                </div>

                {/* Search */}
                <div className="bg-[var(--bg-w)] rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] p-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[.7em] text-[var(--text-dark)] font-semibold">Search Deleted Forms</label>
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

                {/* Deleted Forms List */}
                <div className="bg-[var(--bg-w)] rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] lg:p-6 p-3">
                    {filteredForms.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center">
                            <p className="text-[var(--text-dark)] text-[1em] mb-4">No deleted forms found</p>
                            <Link
                                to="/manage-forms"
                                className="flex gap-2 w-max text-[.8em]  cursor-pointer text-[var(--text-light)] font-semibold items-center justify-center bg-[var(--primary-color)] p-3 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] translate-y-[-2px] hover:translate-y-[-4px] duration-300"
                            >
                                Go to Manage Forms
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid grid-cols-12 gap-4">
                            {filteredForms.map((form) => (
                                <div
                                    key={form._id}
                                    className="border border-[var(--border)] 2xl:col-span-3 lg:col-span-6  col-span-12 m-0 rounded-[8px]   md:text-[15px] text-[14px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] transition-all duration-300"
                                >

                                    <div className="flex flex-col min-w-0">
                                        <div className="link-platform-logo-wrapper shadow-[0px_3px_10px_rgba(0,0,0,0.2)] font-semibold text-[var(--text-light)] h-[40px]  flex px-3 items-center bg-[var(--primary-color)] text-[.9em]  rounded-tl-[8px] rounded-tr-[8px] ">
                                            <p className="whitespace-nowrap overflow-hidden text-ellipsis w-[50%]">ID: {form._id} </p>
                                        </div>
                                        <div className="link-content-wrapper p-4 w-full">
                                            <div className="flex justify-between items-center">
                                                <h1 className="text-[var(-text-dark)] font-semibold text-[1.2em]">{form.name}</h1>
                                                <p className={`text-[var(-text-dark)] text-[.8em] font-semibold p-1 px-3  rounded-[10px] bg-red-100 text-red-700`}>Deleted</p>

                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <span className="text-[var(--text-light)] bg-white-color-mix">
                                                    <MaskImage url={`/icons/field.svg`} w="1.1em" h="1.1em" bg="var(--primary-color)" />
                                                </span>
                                                <div className="text-[.8em] text-[var(--text-dark)] flex items-center  font-semibold">
                                                    <span>{form.fields?.length > 1 ? form.fields?.length + " Fields" : form.fields?.length + " Field"}</span>
                                                    <span className="text-[var(--text-light)] bg-white-color-mix ">
                                                        <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                    </span>
                                                    <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[var(--text-light)] bg-white-color-mix ">
                                                        <MaskImage url="/icons/dot.svg" w="1.7em" h="1.7em" bg="var(--primary-color)" />
                                                    </span>
                                                    <span>Deleted</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-5 text-[14px]">
                                                <div
                                                    onClick={() => handleRestore(form._id)}
                                                    title="Restore Form"
                                                    className="text-[var(-text-dark)] w-full cursor-pointer flex items-center justify-center gap-2  shadow-[0px_4px_10px_rgba(0,0,0,0.1)] border border-[var(--border)] text-[.85em] font-semibold p-2 px-2 bg-[color-mix(in_srgb,var(--hover)_100%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-400 rounded-[5px] ">
                                                    <MaskImage url="/icons/restore.svg" w="1.3em" h="1.3em" bg="var(--primary-color)" />
                                                    Restore
                                                </div>

                                                <div
                                                    onClick={() => handlePermanentDelete(form._id)}
                                                    title="Delete Form"
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

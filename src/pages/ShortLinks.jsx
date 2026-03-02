import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LinkCreate from "../components/LinkCreate";

export default function ShortLinks() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [editingLinkId, setEditingLinkId] = useState(editId || null);

    const handleCreateSuccess = () => {
        setEditingLinkId(null);
        // Navigate to manage page after creation (unless editing)
        if (!editId) {
            setTimeout(() => {
                navigate("/manage-short-links");
            }, 1500);
        }
    };

    return (
        <div id="short-link-sec" className="flex-1 mt-6 w-full max-w-[1400px] mx-auto px-4">
            <div className="mb-6">
                <h1 className="text-[var(--text-dark)] text-[1.5em] font-semibold mb-2">
                    {editingLinkId ? "Edit Short Link" : "Create Short Link"}
                </h1>
                <p className="text-[var(--text-dark)] text-[.85em] opacity-75">
                    {editingLinkId ? "Update your short link configuration" : "Create clean, powerful short links in seconds"}
                </p>
            </div>

            <LinkCreate
                id={editingLinkId}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}

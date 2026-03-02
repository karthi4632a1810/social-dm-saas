import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { linkAPI } from "../utils/api";

export default function ShortLinkRedirect() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const getVisitorId = () => {
        let id = localStorage.getItem("visitorId");
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem("visitorId", id);
        }
        return id;
    };

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                setLoading(true);

                const visitorId = getVisitorId();

                // ✅ Get link AND increment click (backend already increments click)
                const response = await linkAPI.getBySlug(slug);

                if (!response.success || !response.data) {
                    setError("Link not found");
                    setLoading(false);
                    return;
                }

                const link = response.data;

                if (link.status !== 'active') {
                    setError("This link is currently inactive");
                    setLoading(false);
                    return;
                }

                // ✅ For URL & WhatsApp → track pageView + visitor BEFORE redirect
                if (link.destinationType === "url" || link.destinationType === "whatsapp") {
                    await linkAPI.incrementView(link._id);
                    await linkAPI.incrementVisitor(link._id, visitorId);
                }

                // 🔁 Redirect logic
                if (link.destinationType === 'url' && link.link) {
                    window.location.href = link.link;

                } else if (link.destinationType === 'form' && link.formId) {

                    navigate(`/form/${link.formId._id || link.formId}?linkId=${link._id}&platform=${encodeURIComponent(link.platform)}`);

                } else if (link.destinationType === 'whatsapp') {

                    const cleanNumber = link.whatsappNumber.replace(/\D/g, '');
                    const encodedMessage = encodeURIComponent(link.whatsappMessage || '');
                    const whatsappUrl = `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;

                    window.location.href = whatsappUrl;

                } else {
                    setError("Invalid link destination");
                    setLoading(false);
                }

            } catch (err) {
                console.error("Error redirecting:", err);
                setError("Failed to redirect. Please try again.");
                setLoading(false);
            }
        };

        if (slug) {
            handleRedirect();
        }
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--body-back)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-dark)]">Redirecting...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--body-back)] flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    {/* <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-[8px] hover:opacity-90"
                    >
                        Go to Home
                    </button> */}
                </div>
            </div>
        );
    }

    return null;
}

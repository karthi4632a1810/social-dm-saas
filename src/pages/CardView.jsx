import { useState, useEffect } from "react";
import { contactCardAPI, getImageUrl } from "../utils/api";
import { useParams, useSearchParams } from "react-router-dom";
import MaskImage from "../components/MaskImage";

export default function ProfileCard() {
    const { id } = useParams();
    const [cardData, setCardData] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const loadCardForEdit = async () => {
            if (!id) return;
            setLoading(true)
            try {
                const response = await contactCardAPI.getById(id);
                if (response.success && response.data) {
                    if (response.data.inTrash == "no" && response.data.isActive) {
                        const card = response.data;
                        console.log(card)
                        setCardData(card)
                    }
                    else {
                        setError(response.message || "Card not found")
                    }
                } else {
                    showToast("Failed to load card for editing", "error");
                }
            } catch (err) {
                console.error("Error loading card:", err);
                setError(response.message || "Form not found")
                showToast("An error occurred while loading the card", "error");
            } finally {
                setLoading(false);
            }
        };

        loadCardForEdit();
    }, [id]);

    const getVisitorId = () => {
        let id = localStorage.getItem("contactVisitorId");
        if (!id) {
            id = crypto.randomUUID(); // modern browsers
            localStorage.setItem("contactVisitorId", id);
        }
        return id;
    };

    useEffect(() => {
        const track = async () => {
            const visitorId = getVisitorId();
            await contactCardAPI.track(id, visitorId);
        };

        if (id) track();
    }, [id]);


    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--c-17)] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-dark)]">Loading Card...</p>
                </div>
            </div>
        );
    }

    if (error || !cardData) {
        return (
            <div className="min-h-screen bg-[var(--c-17)] flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-500 text-lg">{error || "Card not found"}</p>
                </div>
            </div>
        );
    }

    return (

        <div className="bg-[var(--c-17)] shadow-[0px_0px_10px_rgba(0,0,0,0.04)] w-full h-[100vh] flex flex-col items-center justify-center overflow-hidden ">
            <div className="bg-[var(--c-17)]  w-[90%] max-w-[500px] flex flex-col items-center justify-center p-0 md:p-10 pb-6 text-[20px]">
                <div className="flex  flex-col w-[250px] gap-2 shrink-0 aspect-square">
                    <div className="card-image-wrapper w-full h-full border-[1px] border-[var(--text-darken)] relative  rounded-[9vh]">
                        <img
                            src={getImageUrl(cardData.image)}
                            className=" w-full h-full  left-0 top-0 object-cover rounded-[9vh]"
                            alt="image"
                        />
                        <div style={{ fontWeight: "900" }} className="absolute uppercase nunito flex leading-4 justify-center p-[10px] text-[.7em] text-center contact-card-cloud-wrapper text-[#2f1b0f]">
                            {cardData.role}
                            <span className="contact-card-cloud"></span>
                            <span className="contact-card-cloud-border"></span>
                        </div>
                    </div>
                </div>
                <p className="nunito text-[1.1em] my-5 text-[var(--text-darken)] uppercase">{cardData.fullName}</p>
                <h1 style={{ fontWeight: "900" }} className="nunito text-[2em] leading-10 text-center w-[90%] text-[var(--text-darken)] font-extrabold">{cardData.content}</h1>
                <a href={cardData.number} style={{ fontWeight: "400" }} className="border-[1px] border-[var(--text-darken)] text-[var(--text-darken)]  w-[90%] mt-12 tracking-[1px] nunito  text-center p-3 rounded-[100vh] bg-[#ece4d7] uppercase text-[.8em]">contact me</a>

                {cardData.platforms && cardData.platforms.length > 0 &&
                    <div className="flex flex-col mt-12 gap-3 items-center">
                        <p style={{ fontWeight: "600" }} className="nunito text-[.8em] text-center text-[var(--text-darken)] ">Social Media's</p>
                        <div className="flex gap-2 flex-wrap justify-center">

                            {cardData.platforms.map((platform) => {
                                return (
                                    <a href={platform.url}
                                        className={`cursor-pointer aspect-square p-[5px] shrink-0 bg-[color-mix(in_srgb,var(--text-darken)_100%,rgba(255,255,255,0))] flex items-center justify-center rounded-[100vh] text-[.85em]`}
                                    >
                                        <MaskImage
                                            url={`/icons/${platform.platform.toLowerCase()}.svg`}
                                            w="1.3em"
                                            h="1.3em"
                                            bg={"var(--text-light)"}
                                        />
                                    </a>
                                )
                            })}

                        </div>
                    </div>
                }
            </div>
        </div>
    )
}
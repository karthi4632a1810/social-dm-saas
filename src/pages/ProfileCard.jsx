import { useState, useEffect } from "react";
import MaskImage from "../components/MaskImage";
import { contactCardAPI, getImageUrl } from "../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showToast } from "../utils/toast";


export default function ProfileCard() {
    const [selectedImageFile, setSelectedImageFile] = useState(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [savedCardId, setSavedCardId] = useState(editId || null);
    const [loadingCard, setLoadingCard] = useState(!!editId);

    const [loading, setLoading] = useState(false);
    const [contactCard, setContactCard] = useState({
        image: "/uploads/contact.png",
        fullName: "Rahul",
        role: "sales executive",
        content: "Contact Me to Get the Best Offer",
        number: ""
    })
    const [platformLinks, setPlatformLinks] = useState({});

    const [activePlatforms, setActivePlatforms] = useState([
        "Instagram",
        "Facebook",
        "Linkedin",
        "TwitterX"
    ]);
    const togglePlatform = (icon) => {
        setActivePlatforms((prev) =>
            prev.includes(icon)
                ? prev.filter((p) => p !== icon)
                : [...prev, icon]
        );
    };

    useEffect(() => {
        const loadCardForEdit = async () => {
            if (!editId) return;

            try {
                setLoadingCard(true);
                const response = await contactCardAPI.getById(editId);
                if (response.success && response.data) {
                    const card = response.data;
                    console.log(card)
                    setContactCard({
                        image: card.image,
                        fullName: card.fullName,
                        role: card.role,
                        content: card.content,
                        number: card.number
                    })
                    if (card.platforms && Array.isArray(card.platforms)) {
                        const formattedLinks = {};

                        card.platforms.forEach((item) => {
                            formattedLinks[item.platform] = item.url;
                        });

                        setPlatformLinks(formattedLinks);
                        setActivePlatforms(card.platforms.map(p => p.platform));
                    }

                    setSavedCardId(card._id);
                } else {
                    showToast("Failed to load card for editing", "error");
                }
            } catch (err) {
                console.error("Error loading card:", err);
                showToast("An error occurred while loading the card", "error");
            } finally {
                setLoadingCard(false);
            }
        };

        loadCardForEdit();
    }, [editId]);


    const previewImageHandle = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedImageFile(file);

        // Preview only (no upload yet)
        setContactCard((prev) => ({
            ...prev,
            image: URL.createObjectURL(file)
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedImageFile == null && !savedCardId) {
            showToast("Choose Your Image", "info");
            return;
        }
        setLoading(true);

        try {
            const platforms = activePlatforms
                .filter((p) => platformLinks[p])
                .map((p) => ({
                    platform: p,
                    url: platformLinks[p]
                }));

            const payload = {
                fullName: contactCard.fullName,
                role: contactCard.role,
                content: contactCard.content,
                number: contactCard.number,
                platforms,
            };

            let cardId = savedCardId;
            let res;

            // 🔹 CREATE
            if (!savedCardId) {
                res = await contactCardAPI.create(payload);

                if (!res.success) {
                    showToast(res.message || "Failed to create card", "error");
                    setLoading(false);
                    return;
                }

                cardId = res.data._id;
                setSavedCardId(cardId);
            }
            // 🔹 UPDATE
            else {
                res = await contactCardAPI.update(savedCardId, payload);

                if (!res.success) {
                    showToast(res.message || "Failed to update card", "error");
                    setLoading(false);
                    return;
                }
            }

            // 🔥 Upload image AFTER card exists
            if (selectedImageFile && cardId) {
                const formData = new FormData();
                formData.append("avatar", selectedImageFile);

                const uploadRes = await contactCardAPI.uploadAvatar(cardId, formData);

                if (uploadRes.success) {
                    setContactCard((prev) => ({
                        ...prev,
                        image: uploadRes.data.image
                    }));

                }
            }

            if (cardId) {
                setTimeout(() => {
                    navigate(`/manage-cards?search=${cardId}`);
                }, 1500);
            }

            showToast(savedCardId ? "Card updated successfully" : "Card created successfully", "success");
            setLoading(false);

        } catch (err) {
            console.error(err);
            showToast("Something went wrong", "error");
            setLoading(false);
        }
    };


    const platformIcons = [
        {
            icon: "instagram.svg",
            title: "Instagram"
        },
        {
            icon: "facebook.svg",
            title: "Facebook"
        },
        {
            icon: "whatsapp.svg",
            title: "Whatsapp"
        },
        {
            icon: "youtube.svg",
            title: "Youtube"
        },
        {
            icon: "linkedin.svg",
            title: "Linkedin"
        },
        {
            icon: "reddit.svg",
            title: "Reddit"
        },
        {
            icon: "telegram.svg",
            title: "Telegram"
        },
        {
            icon: "threads.svg",
            title: "Threads"
        },
        {
            icon: "tiktok.svg",
            title: "TikTok"
        },
        {
            icon: "twitterx.svg",
            title: "TwitterX"
        }
    ];



    return (
        <div className="px-4 mt-6">
            <div id="profile-form" className="flex-1  w-full max-w-[1400px] mx-auto">
                <div className="grid grid-cols-8 gap-6">
                    {/* Left Side - Form Builder */}
                    <div className="xl:col-span-5 lg:col-span-4 col-span-8 profile-form-wrapper bg-[var(--bg-w)] w-full h-max rounded-[8px] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] md:p-6 p-3 text-[20px]">
                        <h2 className="text-[var(--text-dark)] text-[1em] font-semibold mb-2 border-b-[1px] border-[var(--border)] pb-4">Contact Card Details</h2>


                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 pt-4">
                            {/* Form Name */}
                            <div className="flex gap-5">
                                <div className="flex  flex-col w-[130px] gap-2 shrink-0 aspect-square  relative ">
                                    <div className="card-image-wrapper border-[2px] border-[var(--border)] shadow-[0px_0px_10px_rgba(0,0,0,0.1)] overflow-hidden rounded-[5px]">
                                        <img
                                            src={getImageUrl(contactCard.image)}
                                            className=" w-full h-full left-0 top-0 object-cover"
                                            alt="avatar"
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        id="contactImageInput"
                                        onChange={(e) => {
                                            previewImageHandle(e)
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("contactImageInput").click()}
                                        className="cursor-pointer bg-[color-mix(in_srgb,var(--primary-color)_15%,transparent)] text-[.7em] text-[var(--primary-color)] p-2 py-1 text-center rounded-[100vh] shadow-[0px_0px_2px_rgba(0,0,0,0.2)]"
                                    >
                                        + Upload Image
                                    </button>
                                </div>
                                <div className="flex w-full flex-col gap-4">
                                    <div className="flex flex-col  w-full">
                                        <div className="flex items-center ">
                                            <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                                <MaskImage url="/icons/user-1.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                            </span>
                                            <label htmlFor="full-name" className="text-[.63em] text-[var(--text-dark)] font-semibold">Full Name *</label>
                                        </div>
                                        <input
                                            type="text"
                                            value={contactCard.fullName}
                                            onChange={(e) =>
                                                setContactCard((prev) => ({
                                                    ...prev,
                                                    fullName: e.target.value,
                                                }))
                                            }
                                            id="full-name"
                                            className="bg-[var(--bg-w)] w-full text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3"
                                            placeholder="Eg: Rahul"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col  w-full">
                                        <div className="flex items-center ">
                                            <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[var(--primary-color)]30 text-[.8em]">
                                                <MaskImage url="/icons/f-name.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                            </span>
                                            <label htmlFor="role" className="text-[.63em] text-[var(--text-dark)] font-semibold">Role *</label>
                                        </div>
                                        <input
                                            type="text"
                                            value={contactCard.role}
                                            onChange={(e) =>
                                                setContactCard((prev) => ({
                                                    ...prev,
                                                    role: e.target.value,
                                                }))
                                            }
                                            id="role"
                                            className="bg-[var(--bg-w)] w-full text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3"
                                            placeholder="Eg: Sales"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col  w-full mt-2">
                                <div className="flex items-center ">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                        <MaskImage url="/icons/f-des.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="title" className="text-[.63em] text-[var(--text-dark)] font-semibold">Content</label>
                                </div>
                                <input
                                    type="text"
                                    value={contactCard.content}
                                    onChange={(e) =>
                                        setContactCard((prev) => ({
                                            ...prev,
                                            content: e.target.value,
                                        }))
                                    }
                                    id="title"
                                    className="bg-[var(--bg-w)] w-full text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3"
                                    placeholder="Provide content"
                                    required
                                />
                            </div>
                            <div className="flex flex-col  w-full">
                                <div className="flex items-center ">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                        <MaskImage url="/icons/call.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="phone-number" className="text-[.63em] text-[var(--text-dark)] font-semibold">Phone / Whatsapp</label>
                                </div>
                                <input
                                    type="text"
                                    value={contactCard.number && contactCard.number}
                                    onChange={(e) =>
                                        setContactCard((prev) => ({
                                            ...prev,
                                            number: e.target.value,
                                        }))
                                    }
                                    id="phone-number"
                                    className="bg-[var(--bg-w)] w-full text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[9px] px-3"
                                    placeholder="https://example.com or tel:+1234567890"
                                    required
                                />
                            </div>

                            <div className="flex flex-col  w-full mt-">
                                <div className="flex items-center ">
                                    <span className="text-[var(--text-light)] bg-white-color-mix p-[5px] rounded-[7px] bg-[var(--primary-color)]30 text-[.85em]">
                                        <MaskImage url="/icons/mail.svg" w="1em" h="1em" bg="var(--primary-color)" />
                                    </span>
                                    <label htmlFor="form-name" className="text-[.63em] text-[var(--text-dark)] font-semibold">Social Links (Click to Select)</label>
                                </div>
                                <div className="flex mt-2 gap-3 flex-wrap">
                                    {platformIcons.map((data) => {
                                        const isActive = activePlatforms.includes(data.title);

                                        return (
                                            <span
                                                key={data.icon}
                                                onClick={() => togglePlatform(data.title)}
                                                className={`cursor-pointer p-[5px] flex items-center justify-center rounded-[7px] text-[.85em] transition
                                                ${isActive
                                                        ? "bg-[var(--primary-color)]"
                                                        : "bg-[color-mix(in_srgb,var(--primary-color)_20%,rgba(255,255,255,0))]"
                                                    }
                                                `}
                                            >
                                                <MaskImage
                                                    url={`/icons/${data.icon}`}
                                                    w="1.4em"
                                                    h="1.4em"
                                                    bg={isActive ? "white" : "var(--primary-color)"}
                                                />
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            {activePlatforms.length > 0 &&
                                <div className="grid grid-cols-2 gap-3 mt-5">
                                    {activePlatforms.map((platform) => (

                                        <div className="flex gap-1 col-span-1">
                                            <span
                                                className={`cursor-pointer aspect-square shrink-0 bg-[color-mix(in_srgb,var(--primary-color)_20%,rgba(255,255,255,0))] flex items-center justify-center rounded-[7px] text-[.85em]`}
                                            >
                                                <MaskImage
                                                    url={`/icons/${platform.toLowerCase()}.svg`}
                                                    w="1.3em"
                                                    h="1.3em"
                                                    bg={"var(--primary-color)"}
                                                />
                                            </span>
                                            <input
                                                type="text"
                                                value={platformLinks[platform] || ""}
                                                onChange={(e) =>
                                                    setPlatformLinks((prev) => ({
                                                        ...prev,
                                                        [platform]: e.target.value,
                                                    }))
                                                }
                                                className="bg-[var(--bg-w)] w-full text-[.7em] text-[var(--text-dark-1)] placeholder:text-[1em] create-input placeholder:text-[color-mix(in_srgb,var(--text-dark-1)_50%,rgba(255,255,255,0))] rounded-[8px] p-[8px] px-3"
                                                placeholder={`Enter ${platform} URL`}
                                            />
                                        </div>

                                    ))}
                                </div>
                            }

                            <button
                                disabled={loading || loadingCard}
                                type="submit"
                                className="flex-1 mt-10 cursor-pointer text-[var(--text-light)] font-semibold tracking-[1px] items-center justify-center bg-[var(--primary-color)] py-2 rounded-[5px] shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_50%,rgba(255,255,255,0))] hover:shadow-[0px_0px_10px_color-mix(in_srgb,var(--primary-color)_70%,rgba(255,255,255,0))] hover:translate-y-[-2px] duration-300 disabled:opacity-50"
                            >
                                {loading ? (savedCardId ? "Updating..." : "Creating...") : (savedCardId ? "Update Contact Card" : "Create Contact Card")}
                            </button>
                        </form>
                    </div>

                    {/* Right Side - Live Preview */}
                    <div className="xl:col-span-3 lg:col-span-4 col-span-8 lg:sticky lg:top-6 h-fit">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[var(--primary-color)] flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <h3 className="text-[var(--text-dark)] text-[1.1em] font-bold">Live Preview</h3>
                            </div>
                            <p className="text-[var(--text-dark)] text-[.7em] opacity-75 uppercase tracking-wider ml-[2em]">Real-time Visualization</p>
                        </div>
                        <div className="bg-[var(--c-17)] shadow-[0px_0px_10px_rgba(0,0,0,0.04)] w-full flex flex-col items-center justify-center overflow-hidden">
                            <div className="bg-[var(--c-17)]  w-[90%] max-w-[500px] flex flex-col items-center justify-center p-0 pt-10 lg:px-5  pb-6 text-[20px]">
                                <div className="flex  flex-col w-[250px] gap-2 shrink-0 aspect-square">
                                    <div className="card-image-wrapper w-full h-full border-[1px] border-[var(--text-darken)] relative  rounded-[9vh]">
                                        <img
                                            src={getImageUrl(contactCard.image)}
                                            className=" w-full h-full  left-0 top-0 object-cover rounded-[9vh]"
                                            alt="avatar"
                                        />
                                        <div style={{ fontWeight: "900" }} className="absolute uppercase nunito flex leading-4 justify-center p-[10px] text-[.7em] text-center contact-card-cloud-wrapper text-[#2f1b0f]">
                                            {contactCard.role}
                                            <span className="contact-card-cloud"></span>
                                            <span className="contact-card-cloud-border"></span>
                                        </div>
                                    </div>
                                </div>
                                <p className="nunito text-[1.1em] my-5 text-[var(--text-darken)] uppercase">{contactCard.fullName}</p>
                                <h1 style={{ fontWeight: "900" }} className="nunito text-[2em] leading-10 text-center w-[90%] text-[var(--text-darken)] font-extrabold">{contactCard.content}</h1>
                                <a href={contactCard.number} style={{ fontWeight: "400" }} className="border-[1px] border-[var(--text-darken)] w-[90%] text-[var(--text-darken)]  mt-12 tracking-[1px] nunito  text-center p-3 rounded-[100vh] bg-[#ece4d7] uppercase text-[.8em]">contact me</a>

                                {activePlatforms.length > 0 &&
                                    <div className="flex flex-col mt-12 gap-3 items-center">
                                        <p style={{ fontWeight: "600" }} className="nunito text-[.8em] text-center text-[var(--text-darken)] ">Social Media's</p>
                                        <div className="flex gap-2 flex-wrap justify-center">

                                            {activePlatforms.map((platform) => {
                                                let previewLink = platformLinks[platform];

                                                return (
                                                    <a href={previewLink}
                                                        className={`cursor-pointer aspect-square p-[5px] shrink-0 bg-[color-mix(in_srgb,var(--text-darken)_100%,rgba(255,255,255,0))] flex items-center justify-center rounded-[100vh] text-[.85em]`}
                                                    >
                                                        <MaskImage
                                                            url={`/icons/${platform.toLowerCase()}.svg`}
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

                        {/* Responsive Info Box */}
                        <div className="rounded-[8px] p-4 flex items-start gap-3 mt-5 border" style={{
                            backgroundColor: `color-mix(in srgb, var(--primary-color) 10%, var(--bg-w))`,
                            borderColor: `color-mix(in srgb, var(--primary-color) 30%, transparent)`
                        }}>
                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{
                                backgroundColor: `var(--primary-color)`
                            }}>
                                <span className="text-[var(--text-light)] text-[.85em] font-bold">i</span>
                            </div>
                            <p className="text-[.85em] leading-relaxed" style={{
                                color: `var(--primary-color)`
                            }}>
                                This card is fully responsive and will adapt to mobile screens automatically.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

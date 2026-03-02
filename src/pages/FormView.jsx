import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import MaskImage from "../components/MaskImage";
import { formAPI, leadAPI, linkAPI } from "../utils/api";

export default function FormView() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [userLocation, setUserLocation] = useState("");
    const linkId = searchParams.get('linkId');
    const platform = searchParams.get('platform') || 'Website';

    // Get user location on component mount
    useEffect(() => {
        const getLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            // Reverse geocoding to get location name
                            const response = await fetch(
                                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                            );
                            const data = await response.json();
                            const locationString = [
                                data.city,
                                data.principalSubdivision,
                                data.countryName
                            ].filter(Boolean).join(', ');
                            setUserLocation(locationString || `${position.coords.latitude}, ${position.coords.longitude}`);
                        } catch (err) {
                            // Fallback to coordinates if reverse geocoding fails
                            setUserLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
                        }
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        // Try IP-based location as fallback
                        fetch('https://ipapi.co/json/')
                            .then(res => res.json())
                            .then(data => {
                                const locationString = [
                                    data.city,
                                    data.region,
                                    data.country_name
                                ].filter(Boolean).join(', ');
                                setUserLocation(locationString || '');
                            })
                            .catch(() => {
                                setUserLocation('');
                            });
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                // Fallback to IP-based location
                fetch('https://ipapi.co/json/')
                    .then(res => res.json())
                    .then(data => {
                        const locationString = [
                            data.city,
                            data.region,
                            data.country_name
                        ].filter(Boolean).join(', ');
                        setUserLocation(locationString || '');
                    })
                    .catch(() => {
                        setUserLocation('');
                    });
            }
        };

        getLocation();
    }, []);

    useEffect(() => {
        const loadForm = async () => {
            try {
                setLoading(true);
                let data = null;

                // Check if form data is in URL params (for preview)
                const urlData = searchParams.get('data');
                if (urlData) {
                    data = JSON.parse(decodeURIComponent(urlData));
                    setFormData(data);
                } else if (id) {
                    // Load form by ID from API
                    const response = await formAPI.getById(id);
                    if (response.success) {
                        if (response.data.inTrash == "no" && response.data.isActive) {
                            console.log(response.data)
                            setFormData(response.data);
                        }
                    } else {
                        setError(response.message || "Form not found");
                    }
                } else {
                    setError("No form ID provided");
                }
            } catch (err) {
                console.error("Error loading form:", err);
                setError("Failed to load form");
            } finally {
                setLoading(false);
            }
        };

        loadForm();
    }, [id, searchParams]);

    useEffect(() => {
        countPageViews();
        countVisitor();
    }, [linkId]);
    const countPageViews = async () => {
        if (!linkId) return;

        try {
            await linkAPI.incrementView(linkId);
        } catch (error) {
            console.error("Error counting page view:", error);
        }
    };
    const getVisitorId = () => {
        let id = localStorage.getItem("visitorId");
        if (!id) {
            id = crypto.randomUUID(); // modern browsers
            localStorage.setItem("visitorId", id);
        }
        return id;
    };
    const countVisitor = async () => {
        if (!linkId) return;

        try {
            const visitorId = getVisitorId();
            await linkAPI.incrementVisitor(linkId, visitorId);
        } catch (err) {
            console.error("Error counting visitor:", err);
        }
    };


    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const cleaned = phone.replace(/[^0-9+]/g, '');
        return /^[+]?[0-9]{7,15}$/.test(cleaned);
    };


    const handleInputChange = (fieldIndex, value) => {
        setFormValues(prev => ({
            ...prev,
            [fieldIndex]: value
        }));
        // Clear error when user starts typing
        if (errors[fieldIndex]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldIndex];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};
        console.log("sanjay")

        if (!formData || !formData.fields) return;

        formData.fields.forEach((field, index) => {
            if (field.type === "title" || field.type === "paragraph") return;

            const value = formValues[index] || "";

            if (field.required && !value.trim()) {
                validationErrors[index] = `${field.label || "This field"} is required`;
            } else if (value.trim()) {
                if (field.type === "email" && !validateEmail(value)) {
                    validationErrors[index] = "Please enter a valid email address";
                } else if (field.type === "phone" && !validatePhone(value)) {
                    validationErrors[index] = "Please enter a valid phone number";
                }
            }
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                // Extract lead data from form values
                let leadName = '';
                let leadEmail = '';
                let leadPhone = '';
                let leadLocation = '';

                // Find name, email, phone, and location fields
                formData.fields.forEach((field, index) => {
                    const value = formValues[index] || '';
                    const fieldType = field.type.toLowerCase();
                    const fieldLabel = field.label.toLowerCase();

                    if (fieldType === 'email' || fieldLabel.includes('email')) {
                        leadEmail = value;
                    } else if (fieldType === 'phone' || fieldLabel.includes('phone') || fieldLabel.includes('number')) {
                        leadPhone = value;
                    } else if (fieldLabel.includes('name') && !leadName) {
                        leadName = value;
                    } else if (fieldLabel.includes('location') || fieldLabel.includes('city') || fieldLabel.includes('address')) {
                        leadLocation = value;
                    } else if (!leadName && fieldType === 'text') {
                        // Use first text field as name if name not found
                        leadName = value;
                    }
                });

                // Use geolocation if available, otherwise use form location field
                const finalLocation = userLocation || leadLocation || '';

                // Create lead if we have at least name and email or phone
                if (linkId && (leadName || leadEmail || leadPhone)) {
                    try {
                        const leadResponse = await leadAPI.createPublic({
                            name: leadName || 'Anonymous',
                            email: leadEmail || "dsd",
                            number: leadPhone || "dsd",
                            link: window.location.href,
                            linkId: linkId,
                            platform: platform,
                            location: finalLocation,
                            status: 'pending'
                        });

                        if (leadResponse.success) {
                            setSubmitted(true);
                            console.log("Form submitted:", formValues);
                            // Redirect to thank you page
                            navigate(`/thank-you?formName=${encodeURIComponent(formData.name || 'Form')}`);
                            return;
                        }
                    } catch (leadError) {
                        console.error("Error creating lead:", leadError);
                        // Continue even if lead creation fails
                    }
                }

            } catch (err) {
                console.error("Error submitting form:", err);
                setError("Failed to submit form. Please try again.");
            }
        }
    };

    const buildRows = () => {
        if (!formData || !formData.fields) return [];

        let currentRow = [];
        const rows = [];

        formData.fields.forEach((field, index) => {
            if (field.type === "title") {
                if (currentRow.length > 0) {
                    rows.push([...currentRow]);
                    currentRow = [];
                }
                rows.push([{ ...field, index, isTitle: true }]);
            } else if (field.type === "paragraph") {
                if (currentRow.length > 0) {
                    rows.push([...currentRow]);
                    currentRow = [];
                }
                rows.push([{ ...field, index, isParagraph: true }]);
            } else {
                const span = field.columnSpan || 12;
                currentRow.push({ ...field, index, span });

                const rowSpan = currentRow.reduce((sum, f) => sum + (f.span || 12), 0);
                if (rowSpan >= 12) {
                    rows.push([...currentRow]);
                    currentRow = [];
                }
            }
        });

        if (currentRow.length > 0) {
            rows.push(currentRow);
        }

        return rows;
    };

    const getColSpanClass = (span) => {
        const map = { 12: "col-span-12", 6: "col-span-6", 4: "col-span-4", 3: "col-span-3" };
        return map[span] || "col-span-12";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--body-back)] flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                    <p className="text-[var(--text-dark)]">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error || !formData) {
        return (
            <div className="min-h-screen bg-[var(--body-back)] flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-500 text-lg">{error || "Form not found"}</p>
                </div>
            </div>
        );
    }

    const rows = buildRows();

    return (
        <div className="w-full min-h-screen custom-from-wrapper flex items-center justify-center ">
            {/* Form Preview Card */}
            <div className="custom-from-wrapper p-8 py-10 w-full flex flex-col justify-center items-center">
                <div className="glass-card">
                    <div className="header">
                        <div className="badge text-[var(--text-light)]">
                            <span className="icon">
                                <MaskImage url="/icons/gift.svg" w="1em" h="1em" bg="var(--text-light)" />
                            </span>
                            Exclusive Deal
                        </div>
                        <h2 className="text-[var(--text-light)] font-bold">{formData.title}</h2>
                        <p className="text-[var(--text-light)]">{formData.description}</p>

                        {/* <div className="timer">
                                        <span className="icon">
                                            <MaskImage url="/icons/time.svg" w="1em" h="1em" bg="#fff7cc" />
                                        </span>
                                        Offer ends in 14:19
                                    </div> */}
                    </div>

                    <form onSubmit={handleSubmit}>
                        {submitted && (
                            <div className="offer-item text-[.85em] mb-2">
                                Form submitted successfully!
                            </div>
                        )}

                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-12 gap-4">
                                {row.map((field) => {
                                    if (field.isTitle) {
                                        return (
                                            <div key={field.index} className="col-span-12">
                                                <h3 className="text-[var(--text-dark)] text-[1.3em] font-semibold mb-2">
                                                    {field.label || field.placeholder || "Title"}
                                                </h3>
                                            </div>
                                        );
                                    }
                                    if (field.isParagraph) {
                                        return (
                                            <div key={field.index} className="col-span-12">
                                                <p className="text-[var(--text-dark)] text-[.95em] opacity-75 leading-relaxed">
                                                    {field.label || field.placeholder || "Paragraph text"}
                                                </p>
                                            </div>
                                        );
                                    }

                                    const colSpan = field.span || 12;
                                    const fieldValue = formValues[field.index] || "";
                                    const fieldError = errors[field.index];

                                    return (
                                        <div key={field.index} className={getColSpanClass(colSpan)}>

                                            {field.type === "textarea" ? (
                                                <textarea
                                                    value={fieldValue}
                                                    onChange={(e) => handleInputChange(field.index, e.target.value)}
                                                    className={`w-full bg-[var(--bg-w)] text-[.9em] text-[var(--text-dark-1)] border ${fieldError ? 'border-red-500' : 'border-[var(--border)]'} rounded-[8px] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent placeholder:italic placeholder:opacity-60 resize-y`}
                                                    placeholder={field.placeholder || "Type something..."}
                                                    rows="4"
                                                    required={field.required}
                                                />
                                            ) : field.type === "select" ? (
                                                <select
                                                    value={fieldValue}
                                                    onChange={(e) => handleInputChange(field.index, e.target.value)}
                                                    className={`w-full bg-[var(--bg-w)] text-[.9em] text-[var(--text-dark-1)] border ${fieldError ? 'border-red-500' : 'border-[var(--border)]'} rounded-[8px] p-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent`}
                                                    required={field.required}
                                                >
                                                    <option value="">{field.placeholder || "Select an option"}</option>
                                                </select>
                                            ) : field.type === "checkbox" ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={fieldValue === "true" || fieldValue === true}
                                                        onChange={(e) => handleInputChange(field.index, e.target.checked)}
                                                        className="w-4 h-4 accent-[var(--primary-color)]"
                                                    />
                                                    <span className="text-[.9em] text-[var(--text-dark)]">{field.label}</span>
                                                </div>
                                            ) : field.type === "radio" ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={fieldValue === "true" || fieldValue === true}
                                                        onChange={(e) => handleInputChange(field.index, e.target.checked)}
                                                        className="w-4 h-4 accent-[var(--primary-color)]"
                                                    />
                                                    <span className="text-[.9em] text-[var(--text-dark)]">{field.label}</span>
                                                </div>
                                            ) : (
                                                <>

                                                    <div className="form-group">
                                                        <span className="icon">
                                                            <MaskImage url={`/icons/${field.type === "email" ? "mail" : field.type === "phone" ? "call" : "user-1"}.svg`} w="1em" h="1em" bg="var(--text-light)" />
                                                        </span>
                                                        <input type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                                                            value={fieldValue}
                                                            onChange={(e) => handleInputChange(field.index, e.target.value)}
                                                            placeholder=""
                                                            required={field.required}
                                                        />
                                                        <label htmlFor="name">
                                                            {field.label || "Field"}
                                                            {field.required && <span className="text-[#fef3c7]"> *</span>}
                                                        </label>

                                                    </div>
                                                </>


                                            )}
                                            {fieldError && (
                                                <p className="text-red-500 text-[.75em] mt-1">{fieldError}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <button className="cta-btn text-[var(--text-light)]" type="submit"
                            style={{ "--btn-cus-color": formData.buttonColor || "#3b82f6" }}>
                            <span className="icon">
                                <MaskImage url="/icons/rocket.svg" w="1.3em" h="1.3em" bg="var(--text-light)" />
                            </span>
                            {submitted ? "Unlocked" : "Unlock My Offer"}
                        </button>

                    </form>

                    <div className="benefits">
                        <h4 className="text-[var(--text-light)]">
                            <span className="icon">
                                <MaskImage url="/icons/star.svg" w="1.3em" h="1.3em" bg="var(--text-light)" />
                            </span>
                            What You’ll Get
                        </h4>

                        {/* Compact horizontal offers */}
                        <div className="offer-grid">
                            <div className="offer-item text-[var(--text-light)]">
                                <span className="icon">
                                    <MaskImage url="/icons/dis.svg" w="1.3em" h="1.3em" bg="var(--text-light)" />
                                </span>
                                <strong>30% OFF</strong> Plan
                            </div>
                            <div className="offer-item text-[var(--text-light)]">
                                <span className="icon">
                                    <MaskImage url="/icons/d-t.svg" w="1.3em" h="1.3em" bg="var(--text-light)" />
                                </span>
                                30-Day <strong>Free Trial</strong>
                            </div>
                            <div className="offer-item text-[var(--text-light)]">
                                <span className="icon">
                                    <MaskImage url="/icons/support.svg" w="1.3em" h="1.3em" bg="var(--text-light)" />
                                </span>
                                <strong>Priority</strong> Support
                            </div>
                            <div className="offer-item text-[var(--text-light)]">
                                <span className="icon">
                                    <MaskImage url="/icons/gift.svg" w="1.3em" h="1.3em" bg="var(--text-light)" />
                                </span>
                                Bonus <strong>Resources</strong>
                            </div>
                        </div>
                    </div>

                    {/* Styled footer offer */}
                    <div className="flex gap-1 items-center justify-center mt-4 text-[var(--text-light)]">
                        <span className="icon">
                            <MaskImage url="/icons/dis-1.svg" w="1em" h="1em" bg="var(--text-light)" />
                        </span>
                        Limited Time: Get <strong>30% OFF</strong> Today!
                    </div>

                    <div className="privacy text-[var(--text-light)]">
                        We respect your privacy. No spam. No nonsense.
                    </div>
                </div>
                <div className="mt-6 text-center text-[var(--text-light)]">
                    <p className="text-[var(--text-light)] text-[.75em] flex items-center justify-center gap-1">
                        <span className="text-[var(--text-light)]>">POWERED BY</span>
                        <span className="flex items-center gap-1">
                            <MaskImage url="/icons/link.svg" w="1em" h="1em" bg="var(--text-light)" />
                            <span className="font-semibold text-[var(--text-light)]">ClickMyChat</span>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

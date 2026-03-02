import "../assets/css/toaster.css";
import MaskImage from "../components/MaskImage";

export default function DashboardToast({
    message = "Status Updated Successfully",
    type = "success",
    duration = 4,
    link = ""
}) {
    const toastData = {
        success: { icon: "/icons/success.svg", color: "#28a745" },
        info: { icon: "/icons/info.svg", color: "#0d6efd" },
        error: { icon: "/icons/error.svg", color: "#dc3545" },
        warning: { icon: "/icons/warning.svg", color: "#ffc107" }
    };

    const current = toastData[type] || toastData.info;

    return (
        <div id="dashboard-toast-container">
            <a
                href={link || undefined}
                className={`dashboard-toast dashboard-toast-${type}`}
            >
                <div className="toast-progress">
                    <div
                        className="toast-progress-bar"
                        style={{ animationDuration: `${duration}s` }}
                    />
                </div>

                <div className={`w-[25px] h-[25px] flex justify-center items-center rounded-full`} style={{ flexShrink: 0, backgroundColor: current.color }}>
                    <MaskImage
                        url={current.icon}
                        w="1.1em"
                        h="1.1em"
                        bg="var(--text-light)"
                    />
                </div>

                <div style={{ flex: 1 }}>{message}</div>

                <button type="button">
                    <MaskImage
                        url="/icons/close.svg"
                        w="1.45em"
                        h="1.45em"
                        bg={current.color}
                    />
                </button>
            </a>
        </div>
    );
}

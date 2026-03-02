// Import toast CSS
import '../assets/css/toaster.css';

// Toast utility function
export const showToast = (message, type = "success", duration = 4, link = "") => {
    // Get or create toast container
    let container = document.getElementById('dashboard-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'dashboard-toast-container';
        document.body.appendChild(container);
    }

    const toastData = {
        success: { icon: "/icons/success.svg", color: "#28a745" },
        info: { icon: "/icons/info.svg", color: "#0d6efd" },
        error: { icon: "/icons/error.svg", color: "#dc3545" },
        warning: { icon: "/icons/warning.svg", color: "#ffc107" }
    };

    const current = toastData[type] || toastData.info;

    // Create toast element
    const toast = document.createElement(link ? 'a' : 'div');
    if (link) {
        toast.href = link;
    }
    toast.className = `dashboard-toast dashboard-toast-${type}`;

    // Create icon div with mask-image (like MaskImage component)
    const iconDiv = document.createElement('div');
    iconDiv.className = 'maskimage';
    iconDiv.style.cssText = `
        width: 1.1em;
        height: 1.1em;
        background-color: var(--text-light);
        -webkit-mask-image: url(${current.icon});
        mask-image: url(${current.icon});
        mask-repeat: no-repeat;
        mask-size: contain;
        mask-position: center;
        flex-shrink: 0;
    `;

    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
        width: 25px;
        height: 25px;
        display: flex;
        justify-content:center;
        align-items: center;
        border-radius: 50%;
        background-color: ${current.color};
        flex-shrink: 0;
    `;
    iconContainer.appendChild(iconDiv);

    // Create close icon div
    const closeIconDiv = document.createElement('div');
    closeIconDiv.className = 'maskimage';
    closeIconDiv.style.cssText = `
        width: 1.45em;
        height: 1.45em;
        background-color: ${current.color};
        -webkit-mask-image: url(/icons/close.svg);
        mask-image: url(/icons/close.svg);
        mask-repeat: no-repeat;
        mask-size: contain;
        mask-position: center;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.appendChild(closeIconDiv);


    // Create message div
    const messageDiv = document.createElement('div');
    messageDiv.style.flex = '1';
    messageDiv.textContent = message;
    messageDiv.setAttribute("title", message)
    messageDiv.style.cssText = `
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress-bar';
    progressBar.style.animationDuration = `${duration}s`;

    const progressContainer = document.createElement('div');
    progressContainer.className = 'toast-progress';
    progressContainer.appendChild(progressBar);

    // Assemble toast
    toast.appendChild(progressContainer);
    toast.appendChild(iconContainer);
    toast.appendChild(messageDiv);
    toast.appendChild(closeBtn);

    // Add close functionality
    const removeToast = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(80px) scale(0.95)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    };

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeToast();
    });
    progressBar.addEventListener('animationend', () => {
        removeToast();
    })


    // Append to container
    container.appendChild(toast);

    return toast;
};

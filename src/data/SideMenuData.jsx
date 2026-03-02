export const sideMenu = [
    {
        id: "dashboards",
        title: "Dashboards",
        icon: "/icons/home.svg",
        submenu: [
            {
                title: "Analytics",
                icon: "/icons/menu-2.svg",
                link: "/analytics",
            }
        ],
    },
    {
        id: "short-links",
        title: "Short Links",
        icon: "/icons/link.svg",
        submenu: [
            {
                title: "Create Short Link",
                icon: "/icons/menu-2.svg",
                link: "/short-links",
            },
            {
                title: "Manage Short Link",
                icon: "/icons/menu-2.svg",
                link: "/manage-short-links",
            },
            {
                title: "Deleted Short Link",
                icon: "/icons/menu-2.svg",
                link: "/deleted-short-links",
            },
        ],
    },
    {
        id: "create-form",
        title: "Forms",
        icon: "/icons/create-link.svg",
        submenu: [
            {
                title: "Create Form",
                icon: "/icons/menu-2.svg",
                link: "/create-form",
            },
            {
                title: "Manage Forms",
                icon: "/icons/menu-2.svg",
                link: "/manage-forms",
            },
            {
                title: "Deleted Forms",
                icon: "/icons/menu-2.svg",
                link: "/deleted-forms",
            },
        ],
    },
    {
        id: "profile-card",
        title: "Contact Card",
        icon: "/icons/create-link.svg",
        submenu: [
            {
                title: "Create Card",
                icon: "/icons/menu-2.svg",
                link: "/create-card",
            },
            {
                title: "Manage Card",
                icon: "/icons/menu-2.svg",
                link: "/manage-cards",
            },
            {
                title: "Deleted Card",
                icon: "/icons/menu-2.svg",
                link: "/deleted-cards",
            },
        ],
    },
    {
        id: "leads",
        title: "Lead Details",
        icon: "/icons/leads.svg",
        link: "/all-leads",
    },
    // {
    //     id: "dm-report",
    //     title: "DM Report",
    //     icon: "/icons/social.svg",
    //     link: "/social-medias",
    // },
    // {
    //     id: "all-graphs",
    //     title: "All Graphs",
    //     icon: "/icons/social.svg",
    //     link: "/social-medias",
    // },
    // {
    //     id: "tracker",
    //     title: "Link Tracker",
    //     icon: "/icons/tracker.svg",
    //     link: "/trackers",
    // },
    {
        id: "account",
        title: "My Account",
        icon: "/icons/user.svg",
        submenu: [
            {
                title: "My Profile",
                icon: "/icons/menu-2.svg",
                link: "/profile",
            },
            {
                title: "Logout",
                icon: "/icons/menu-2.svg",
                link: "/login",
            },
        ],
    }
];
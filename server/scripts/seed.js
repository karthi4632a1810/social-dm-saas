import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Link from '../models/Link.js';
import Lead from '../models/Lead.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Link.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    // Seed Links
    const links = [
      {
        link_name: "Instagram Link",
        clicks: 500,
        status: "active",
        slug: "instagram-link",
        link: "https://clickmychat.com/instagram-link",
        platform: "Instagram",
        createdAt: new Date("2025-01-17T10:43:00")
      },
      {
        link_name: "Facebook Page",
        clicks: 320,
        status: "active",
        slug: "facebook-page",
        link: "https://clickmychat.com/facebook-page",
        platform: "Facebook",
        createdAt: new Date("2025-01-16T16:15:00")
      },
      {
        link_name: "WhatsApp Chat",
        clicks: 890,
        status: "active",
        slug: "whatsapp-chat",
        link: "https://clickmychat.com/whatsapp-chat",
        platform: "WhatsApp",
        createdAt: new Date("2025-01-15T11:02:00")
      },
      {
        link_name: "Google Ads Link",
        clicks: 210,
        status: "paused",
        slug: "google-ads-link",
        link: "https://clickmychat.com/google-ads-link",
        platform: "Google",
        createdAt: new Date("2025-01-14T18:48:00")
      },
      {
        link_name: "Website Contact",
        clicks: 640,
        status: "active",
        slug: "website-contact",
        link: "https://clickmychat.com/website-contact",
        platform: "Website",
        createdAt: new Date("2025-01-13T09:30:00")
      },
      {
        link_name: "Landing Page",
        clicks: 410,
        status: "active",
        slug: "landing-page",
        link: "https://clickmychat.com/landing-page",
        platform: "Landing Page",
        createdAt: new Date("2025-01-12T14:10:00")
      },
      {
        link_name: "YouTube Campaign",
        clicks: 275,
        status: "active",
        slug: "youtube-campaign",
        link: "https://clickmychat.com/youtube-campaign",
        platform: "YouTube",
        createdAt: new Date("2025-01-11T17:20:00")
      },
      {
        link_name: "Telegram Group",
        clicks: 150,
        status: "paused",
        slug: "telegram-group",
        link: "https://clickmychat.com/telegram-group",
        platform: "Telegram",
        createdAt: new Date("2025-01-10T12:05:00")
      },
      {
        link_name: "Instagram DM",
        clicks: 720,
        status: "active",
        slug: "instagram-dm",
        link: "https://clickmychat.com/instagram-dm",
        platform: "Instagram",
        createdAt: new Date("2025-01-09T15:40:00")
      },
      {
        link_name: "Google Form",
        clicks: 95,
        status: "active",
        slug: "google-form",
        link: "https://clickmychat.com/google-form",
        platform: "Google",
        createdAt: new Date("2025-01-08T10:18:00")
      }
    ];

    const savedLinks = await Link.insertMany(links);
    console.log(`Seeded ${savedLinks.length} links`);

    // Create a map of link names to IDs for leads
    const linkMap = {};
    savedLinks.forEach(link => {
      linkMap[link.link_name.toLowerCase()] = link._id;
    });

    // Seed Leads
    const leads = [
      {
        name: "Sanjay",
        number: "9176164417",
        link: "instagram link",
        linkId: linkMap["instagram link"] || savedLinks[0]._id,
        status: "contacted",
        email: "sanjaypbiz15@gmail.com",
        platform: "Instagram",
        location: "Chennai",
        createdAt: new Date("2025-01-17T10:43:00")
      },
      {
        name: "Arun",
        number: "9845123478",
        link: "facebook page",
        linkId: linkMap["facebook page"] || savedLinks[1]._id,
        status: "pending",
        email: "arun.kumar@companymail.com",
        platform: "Facebook",
        location: "Bengaluru",
        createdAt: new Date("2025-01-16T16:15:00")
      },
      {
        name: "Priya",
        number: "9003344556",
        link: "website inquiry",
        linkId: linkMap["website contact"] || savedLinks[4]._id,
        status: "contacted",
        email: "priya.sharma.longemailaddress@example.com",
        platform: "Website",
        location: "Mumbai",
        createdAt: new Date("2025-01-15T11:02:00")
      },
      {
        name: "Rahul",
        number: "8123456789",
        link: "google ads",
        linkId: linkMap["google ads link"] || savedLinks[3]._id,
        status: "closed",
        email: "rahul.marketing@adsplatform.io",
        platform: "Google",
        location: "Delhi",
        createdAt: new Date("2025-01-14T18:48:00")
      },
      {
        name: "Meena",
        number: "9786543210",
        link: "whatsapp chat",
        linkId: linkMap["whatsapp chat"] || savedLinks[2]._id,
        status: "contacted",
        email: "meena.support.team@verylongdomainname.com",
        platform: "WhatsApp",
        location: "Coimbatore",
        createdAt: new Date("2025-01-13T09:30:00")
      },
      {
        name: "Karthik",
        number: "8899776655",
        link: "landing page",
        linkId: linkMap["landing page"] || savedLinks[5]._id,
        status: "pending",
        email: "karthik.leads@landingpageservices.co",
        platform: "Landing Page",
        location: "Hyderabad",
        createdAt: new Date("2025-01-12T14:10:00")
      },
      {
        name: "Anitha",
        number: "9012345678",
        link: "facebook message",
        linkId: linkMap["facebook page"] || savedLinks[1]._id,
        status: "qualified",
        email: "anitha.sales@businessmail.com",
        platform: "Facebook",
        location: "Madurai",
        createdAt: new Date("2025-01-11T17:20:00")
      },
      {
        name: "Vikram",
        number: "9876501234",
        link: "google form",
        linkId: linkMap["google form"] || savedLinks[9]._id,
        status: "working",
        email: "vikram.operations@company.org",
        platform: "Google",
        location: "Pune",
        createdAt: new Date("2025-01-10T12:05:00")
      },
      {
        name: "Deepa",
        number: "9123456709",
        link: "instagram dm",
        linkId: linkMap["instagram dm"] || savedLinks[8]._id,
        status: "proposal sent",
        email: "deepa.marketing.team@longdomainexample.com",
        platform: "Instagram",
        location: "Kochi",
        createdAt: new Date("2025-01-09T15:40:00")
      },
      {
        name: "Suresh",
        number: "8899001122",
        link: "website contact",
        linkId: linkMap["website contact"] || savedLinks[4]._id,
        status: "not interested",
        email: "suresh.feedback@randommail.net",
        platform: "Website",
        location: "Trichy",
        createdAt: new Date("2025-01-08T10:18:00")
      }
    ];

    const savedLeads = await Lead.insertMany(leads);
    console.log(`Seeded ${savedLeads.length} leads`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

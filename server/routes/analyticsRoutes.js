import express from 'express';
import Link from '../models/Link.js';
import Lead from '../models/Lead.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalClicks = await Link.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);

    const totalLeads = await Lead.countDocuments();
    const totalLinks = await Link.countDocuments();

    // Calculate total chats (assuming it's based on leads with certain statuses)
    const totalChats = await Lead.countDocuments({
      status: { $in: ['contacted', 'working', 'qualified'] }
    });

    res.json({
      success: true,
      data: {
        totalClicks: totalClicks[0]?.total || 0,
        totalLeads,
        totalLinks,
        totalChats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats/by-date', async (req, res) => {
  try {
    // 1) Get clicks grouped by date from Link.stats
    const clicksByDate = await Link.aggregate([
      { $unwind: "$stats" },
      {
        $group: {
          _id: "$stats.date", // assuming this is "YYYY-MM-DD"
          totalClick: { $sum: "$stats.clicks" }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalClick: 1
        }
      }
    ]);

    // 2) Get leads grouped by date from Lead.createdAt
    const leadsByDate = await Lead.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalLead: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          totalLead: 1
        }
      }
    ]);

    // 3) Merge both results by date
    const map = new Map();

    clicksByDate.forEach(c => {
      map.set(c.date, {
        date: c.date,
        totalClick: c.totalClick,
        totalLead: 0
      });
    });

    leadsByDate.forEach(l => {
      if (map.has(l.date)) {
        map.get(l.date).totalLead = l.totalLead;
      } else {
        map.set(l.date, {
          date: l.date,
          totalClick: 0,
          totalLead: l.totalLead
        });
      }
    });

    // 4) Convert to sorted array
    const result = Array.from(map.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get platform analytics
router.get('/platforms', async (req, res) => {
  try {
    const platformStats = await Link.aggregate([
      {
        $group: {
          _id: '$platform',
          clicks: { $sum: '$clicks' },
          links: { $sum: 1 }
        }
      },
      { $sort: { clicks: -1 } }
    ]);

    const platformLeads = await Lead.aggregate([
      {
        $group: {
          _id: '$platform',
          leads: { $sum: 1 }
        }
      }
    ]);

    // Combine the data
    const platformData = platformStats.map(stat => {
      const leadData = platformLeads.find(p => p._id === stat._id);
      return {
        platform: stat._id,
        clicks: stat.clicks,
        leads: leadData?.leads || 0,
        links: stat.links
      };
    });

    res.json({
      success: true,
      data: platformData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get weekly analytics
router.get('/weekly', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Start of this week (Sunday)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    // Start of last week
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setMilliseconds(-1);

    // 1) Totals
    const thisWeekTotal = await Lead.countDocuments({
      createdAt: { $gte: startOfThisWeek, $lte: today }
    });

    const lastWeekTotal = await Lead.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek }
    });

    let percentChange = 0;
    if (lastWeekTotal > 0) {
      percentChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
    } else if (thisWeekTotal > 0) {
      percentChange = 100;
    }

    // 2) Platform totals for THIS week
    const platformAgg = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfThisWeek, $lte: today }
        }
      },
      {
        $group: {
          _id: "$platform",
          total: { $sum: 1 }
        }
      }
    ]);

    const platforms = platformAgg.map(p => ({
      platform: p._id,
      total: p.total
    }));

    // 3) Per-day data with per-day platform split
    const week = [];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(startOfThisWeek);
      dayStart.setDate(startOfThisWeek.getDate() + i);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      // Total leads for the day
      const dayLeads = await Lead.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      // Platform-wise for the day
      const dayPlatformAgg = await Lead.aggregate([
        {
          $match: {
            createdAt: { $gte: dayStart, $lte: dayEnd }
          }
        },
        {
          $group: {
            _id: "$platform",
            total: { $sum: 1 }
          }
        }
      ]);

      const dayPlatforms = {};
      dayPlatformAgg.forEach(p => {
        dayPlatforms[p._id] = p.total;
      });

      week.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        leads: dayLeads,
        platforms: dayPlatforms
      });
    }

    // 4) Final response EXACTLY like you want
    res.json({
      success: true,
      summary: {
        thisWeekTotal,
        lastWeekTotal,
        percentChange: Number(percentChange.toFixed(2))
      },
      platforms,
      week
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// it has link overview and monthly analytics
router.get('/stats/overview', async (req, res) => {
  try {
    const now = new Date();

    // ---- Date ranges ----
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfThisWeek);
    endOfLastWeek.setMilliseconds(-1);

    // ---- Link Overview ----
    const totalLinks = await Link.countDocuments();

    const totalClicksAgg = await Link.aggregate([
      { $group: { _id: null, total: { $sum: "$clicks" } } }
    ]);
    const totalClicks = totalClicksAgg[0]?.total || 0;

    const totalLeads = await Lead.countDocuments();

    // Compare this week vs last week (for %)
    const thisWeekLeads = await Lead.countDocuments({
      createdAt: { $gte: startOfThisWeek, $lte: now }
    });

    const lastWeekLeads = await Lead.countDocuments({
      createdAt: { $gte: startOfLastWeek, $lte: endOfLastWeek }
    });

    let linkOverviewPercent = 0;
    if (lastWeekLeads > 0) {
      linkOverviewPercent = ((thisWeekLeads - lastWeekLeads) / lastWeekLeads) * 100;
    } else if (thisWeekLeads > 0) {
      linkOverviewPercent = 100;
    }

    // ---- Monthly Analytics (platform-wise) ----

    // This month
    const thisMonthPlatformAgg = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfThisMonth, $lt: startOfNextMonth }
        }
      },
      {
        $group: {
          _id: "$platform",
          total: { $sum: 1 }
        }
      }
    ]);

    // Last month
    const lastMonthPlatformAgg = await Lead.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
        }
      },
      {
        $group: {
          _id: "$platform",
          total: { $sum: 1 }
        }
      }
    ]);

    // Convert last month to map for easy lookup
    const lastMonthMap = {};
    lastMonthPlatformAgg.forEach(p => {
      lastMonthMap[p._id] = p.total;
    });

    const thisMonthTotalLeads = thisMonthPlatformAgg.reduce((s, p) => s + p.total, 0) || 1;

    const monthlyPlatforms = thisMonthPlatformAgg.map(p => {
      const last = lastMonthMap[p._id] || 0;
      let percentChange = 0;

      if (last > 0) {
        percentChange = ((p.total - last) / last) * 100;
      } else if (p.total > 0) {
        percentChange = 100;
      }

      return {
        platform: p._id,
        total: p.total,
        sharePercent: Number(((p.total / thisMonthTotalLeads) * 100).toFixed(2)),
        changePercent: Number(percentChange.toFixed(2))
      };
    });

    // Sum total pageViews from stats
    const totalPageViewsAgg = await Link.aggregate([
      { $unwind: "$stats" },
      { $group: { _id: null, total: { $sum: "$stats.pageViews" } } }
    ]);
    const totalPageViews = totalPageViewsAgg[0]?.total || 0;

    // Conversion rates
    const clickRate = totalPageViews > 0 ? (totalClicks / totalPageViews) * 100 : 0;
    const leadRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;

    // ---- Final Response ----
    res.json({
      success: true,
      linkOverview: {
        totalLinks,
        totalClicks,
        totalLeads,
        totalPageViews,
        clickPercent: Number(clickRate.toFixed(2)),
        leadPercent: Number(leadRate.toFixed(2)),
        comparePercent: Number(linkOverviewPercent.toFixed(2))
      },
      monthlyAnalytics: {
        totalLeads: thisMonthTotalLeads,
        platforms: monthlyPlatforms
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get monthly analytics
router.get('/monthly', async (req, res) => {
  try {
    const monthlyStats = await Link.aggregate([
      {
        $group: {
          _id: '$platform',
          clicks: { $sum: '$clicks' },
          leads: { $sum: 0 } // Will be calculated separately
        }
      }
    ]);

    const monthlyLeads = await Lead.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      }
    ]);

    // Merge leads data
    const result = monthlyStats.map(stat => {
      const leadData = monthlyLeads.find(p => p._id === stat._id);
      return {
        platform: stat._id,
        clicks: stat.clicks,
        leads: leadData?.count || 0
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get clicks and leads combined analytics (for charts)
router.get('/clicks-leads', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const clicksData = await Link.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          clicks: { $sum: '$clicks' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const leadsData = await Lead.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          leads: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        clicks: clicksData,
        leads: leadsData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get page views and visitors (mock data structure - can be enhanced with actual tracking)
router.get('/page-views', async (req, res) => {
  try {
    // This is a placeholder - you can implement actual page view tracking
    const pageViews = await Link.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          views: { $sum: '$clicks' },
          visitors: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      success: true,
      data: pageViews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

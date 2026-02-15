const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

/**
 * Get detailed donor list with filters
 * GET /api/admin/donors
 * Query params: bloodGroup, status, search, page, limit
 */
exports.getDonorsList = async (req, res) => {
    try {
        const { bloodGroup, status, search, page = 1, limit = 50 } = req.query;

        // Build query
        const query = { role: 'donor' };

        // Filter by state and city for regional admins
        if (req.user.role === 'admin') {
            if (req.user.state && req.user.city) {
                query.state = req.user.state;
                query.city = req.user.city;
            }
        }
        // Super admin sees all donors (no filter)

        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const total = await User.countDocuments(query);

        // Get paginated donors
        const donors = await User.find(query)
            .select('name email phone bloodGroup status lastDonationDate donationHistory createdAt location state city')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Calculate statistics for each donor
        const donorsWithStats = donors.map(donor => ({
            ...donor,
            totalDonations: donor.donationHistory?.length || 0,
            canDonate: donor.lastDonationDate
                ? (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24) >= 90
                : true,
            daysSinceLastDonation: donor.lastDonationDate
                ? Math.floor((Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24))
                : null
        }));

        res.json({
            success: true,
            data: {
                donors: donorsWithStats,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / limit)
                },
                adminLocation: req.user.role === 'admin' ? `${req.user.city}, ${req.user.state}` : 'All Locations'
            }
        });
    } catch (error) {
        console.error('GET DONORS LIST ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donors list'
        });
    }
};

/**
 * Get detailed request statistics
 * GET /api/admin/request-stats
 */
exports.getRequestStatistics = async (req, res) => {
    try {
        // Build filter for regional admins
        let requestFilter = {};
        
        if (req.user.role === 'admin') {
            if (req.user.state && req.user.city) {
                // Filter by hospitals in the admin's state and city
                const regionalHospitals = await User.find({ 
                    role: 'hospital', 
                    state: req.user.state,
                    city: req.user.city
                }).select('_id');
                const hospitalIds = regionalHospitals.map(h => h._id);
                requestFilter.hospital = { $in: hospitalIds };
            }
        }
        // Super admin sees all requests (no filter)

        // Total requests by status
        const statusStats = await BloodRequest.aggregate([
            { $match: requestFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Requests by urgency
        const urgencyStats = await BloodRequest.aggregate([
            { $match: requestFilter },
            {
                $group: {
                    _id: '$urgency',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Requests by blood group
        const bloodGroupStats = await BloodRequest.aggregate([
            { $match: requestFilter },
            {
                $group: {
                    _id: '$bloodGroup',
                    count: { $sum: 1 },
                    totalUnits: { $sum: '$units' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Average response time for fulfilled requests
        const avgResponseTime = await BloodRequest.aggregate([
            {
                $match: { ...requestFilter, status: 'fulfilled', 'timeline.fulfilledAt': { $exists: true } }
            },
            {
                $project: {
                    responseTime: {
                        $subtract: ['$timeline.fulfilledAt', '$createdAt']
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$responseTime' }
                }
            }
        ]);

        // Recent requests (last 10)
        const recentRequests = await BloodRequest.find(requestFilter)
            .populate('hospital', 'name')
            .select('bloodGroup units urgency status createdAt hospital')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Requests by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRequests = await BloodRequest.aggregate([
            {
                $match: {
                    ...requestFilter,
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    fulfilled: {
                        $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                statusStats,
                urgencyStats,
                bloodGroupStats,
                avgResponseTimeHours: avgResponseTime[0]?.avgTime
                    ? (avgResponseTime[0].avgTime / (1000 * 60 * 60)).toFixed(2)
                    : null,
                recentRequests,
                monthlyRequests,
                adminLocation: req.user.role === 'admin' ? `${req.user.city}, ${req.user.state}` : 'All Locations'
            }
        });
    } catch (error) {
        console.error('GET REQUEST STATS ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch request statistics'
        });
    }
};

/**
 * Export donors list as CSV
 * GET /api/admin/export/donors
 */
exports.exportDonors = async (req, res) => {
    try {
        const { bloodGroup, status } = req.query;

        const query = { role: 'donor' };
        
        // Filter by state and city for regional admins
        if (req.user.role === 'admin') {
            if (req.user.state && req.user.city) {
                query.state = req.user.state;
                query.city = req.user.city;
            }
        }
        // Super admin sees all donors (no filter)
        
        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (status) query.status = status;

        const donors = await User.find(query)
            .select('name email phone bloodGroup status lastDonationDate donationHistory createdAt state city')
            .sort({ name: 1 })
            .lean();

        // Create CSV content
        const headers = ['Name', 'Email', 'Phone', 'Blood Group', 'Status', 'Total Donations', 'Last Donation', 'Registered', 'State', 'City'];
        const rows = donors.map(donor => [
            donor.name,
            donor.email,
            donor.phone || 'N/A',
            donor.bloodGroup,
            donor.status,
            donor.donationHistory?.length || 0,
            donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never',
            new Date(donor.createdAt).toLocaleDateString(),
            donor.state || 'N/A',
            donor.city || 'N/A'
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=donors-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('EXPORT DONORS ERROR:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export donors'
        });
    }
};

module.exports = exports;

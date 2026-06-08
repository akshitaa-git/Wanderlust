const Trip = require('../models/Trip');
const { generateTrip, chatWithTrip } = require('../services/geminiService');


exports.createTrip = async (req, res) => {
    try {
        const { destination, budget, days, interests } = req.body;
        const userId = req.user.userId;

        if (!destination || !budget || !days) {
            return res.status(400).json({ error: 'Destination, budget, and days are required.' });
        }

        // Call Gemini to generate itinerary
        const itinerary = await generateTrip({ destination, budget, days, interests: interests || [] });

        const newTrip = await Trip.create({
            userId,
            destination,
            budget,
            days,
            interests: interests || [],
            itinerary,
        });

        res.status(201).json({ message: 'Trip generated successfully', trip: newTrip });
    } catch (error) {
        console.error('Create Trip Error:', error);
        res.status(500).json({ error: 'Failed to generate and save trip. Please try again later.' });
    }
};

exports.getTrips = async (req, res) => {
    try {
        const userId = req.user.userId;
        const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
        res.json({ trips });
    } catch (error) {
        console.error('Get Trips Error:', error);
        res.status(500).json({ error: 'Failed to load trips.' });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const trip = await Trip.findOne({ _id: id, userId });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found.' });
        }

        res.json({ trip });
    } catch (error) {
        console.error('Get Trip Error:', error);
        res.status(500).json({ error: 'Failed to load trip details.' });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const trip = await Trip.findOneAndDelete({ _id: id, userId });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found.' });
        }

        res.json({ message: 'Trip deleted successfully.' });
    } catch (error) {
        console.error('Delete Trip Error:', error);
        res.status(500).json({ error: 'Failed to delete trip.' });
    }
};

exports.chatWithTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const trip = await Trip.findOne({ _id: id, userId });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found.' });
        }

        const response = await chatWithTrip({
            itinerary: trip.itinerary,
            destination: trip.destination,
            days: trip.days,
            budget: trip.budget,
            history: history || [],
            message,
        });

        // If AI returned an updated itinerary, persist it
        if (response.type === 'itinerary') {
            trip.itinerary = response.data;
            await trip.save();
        }

        res.json(response);
    } catch (error) {
        console.error('Chat Trip Error:', error);
        res.status(500).json({ error: 'Failed to process chat message.' });
    }
};

// Generate / revoke a shareable link for a trip
exports.toggleShare = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const trip = await Trip.findOne({ _id: id, userId });
        if (!trip) return res.status(404).json({ error: 'Trip not found.' });

        if (trip.isPublic) {
            // Revoke: make private
            trip.isPublic = false;
            trip.shareId = undefined;
        } else {
            // Publish: generate a unique shareId
            const crypto = require('crypto');
            trip.shareId = crypto.randomBytes(12).toString('hex');
            trip.isPublic = true;
        }

        await trip.save();
        res.json({ isPublic: trip.isPublic, shareId: trip.shareId || null });
    } catch (error) {
        console.error('Toggle Share Error:', error);
        res.status(500).json({ error: 'Failed to update sharing settings.' });
    }
};

// Public read — no auth required
exports.getPublicTrip = async (req, res) => {
    try {
        const { shareId } = req.params;
        const trip = await Trip.findOne({ shareId, isPublic: true }).select('-userId');
        if (!trip) return res.status(404).json({ error: 'Shared trip not found or link has been revoked.' });
        res.json({ trip });
    } catch (error) {
        console.error('Get Public Trip Error:', error);
        res.status(500).json({ error: 'Failed to load shared trip.' });
    }
};


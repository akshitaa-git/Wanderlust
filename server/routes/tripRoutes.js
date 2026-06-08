const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // Protect all trip routes

router.post('/', tripController.createTrip);
router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTripById);
router.delete('/:id', tripController.deleteTrip);
router.post('/:id/chat', tripController.chatWithTrip);
router.patch('/:id/share', tripController.toggleShare);


module.exports = router;

const express = require('express');

const { getAllReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// Post /tour/45546456546/reviews
// Post /reviews

const router = express.Router({ mergeParams: true });

router.route('/').get(getAllReviews).post(protect, restrictTo('user'), createReview);
router.route('/:id').delete(deleteReview);

module.exports = router;

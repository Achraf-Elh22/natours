/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_EcVV9JSHwf98bj5W0w41JD7G00CYOmmUrQ');

export const bookTour = async (tourId) => {
  try {
    // 1)Checkout Session from the API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    // 2) Create checkout and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

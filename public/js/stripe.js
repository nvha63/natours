import axios from 'axios';
import {showAlert} from './alert';
const stripe = Stripe('pk_test_C47YR2NKt6YAgY9YUsyEWg7c00cwv38vnK')
export const bookTour = async tourId => {
    try {
        // 1) get checkout session from API
        const session = await axios(
            `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
        )
        console.log(session);

        //2) create checkout form + chanre credit card
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    }catch(err){
        console.log(err);
        showAlert('error',err);
    }
}
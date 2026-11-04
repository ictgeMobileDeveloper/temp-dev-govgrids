import {confirmPayment} from '@stripe/stripe-react-native';
import {useDispatch, useSelector} from 'react-redux';

import {AppStrings} from '../Utils/AppStrings';
import {
  generateCustomerId,
  generateCustomerTokenReq,
  generateSecreteKey,
  paymentIntentReq,
} from '../Network/Services/StripeServices';
import {AppRootStore} from '../Redux/AppStore';
import {setIsLoader} from '../Redux/AppReducers';
import {STRIPE_TEST_SECRET_KEY} from '../Network/Urls';

const useStripeManager = () => {
  const dispatch = useDispatch();
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );

  const completeTransaction = async (
    card: any,
    releaseId: any,
    atComplete: any,
  ) => {
    console.log('card ----  ', card);

    // await generateCustomerTokenReq(card, async (res: any) => {
    //   console.log('generatecustomtoken req --->>>   ', res);

    //   if (res?.token) {
    //     await generateCustomerId(null, async (result: any) => {
    //       console.log('generateCustomerId --->>>   ', result);
    //       if (result?.customerId) {
    //         await generateSecreteKey(
    //           {customer: result?.customerId},
    //           async (response: any) => {
    //             console.log('generateSecreteKey --->>>   ', response);

    if (true) {
      let body = {
        releaseId: 33,
      };

      // if (response?.status) {
      //   let body = {
      //     currency: 'USD',
      //     amount: 100,
      //     customer: result?.customerId,
      //     capture_method: 'manual',
      //     metadata: {
      //       payment_type: 'deposit',
      //       total_price: 100,
      //     },
      //   };
      //   await paymentIntentReq(body, async (onComplete: any) => {
      //     console.log(
      //       'Pyament Intent onComplete --->>.  ',
      //       onComplete,
      //     );

      //     if (onComplete?.paymentIntentId) {
      //       let paymentMethodData: any = {
      //         token: res?.token,
      //       };
      //       let confirmPaymentIntent = await confirmPayment(
      //         onComplete?.client_secret,
      //         {
      //           paymentMethodType: 'Card',
      //           paymentMethodData: paymentMethodData,
      //         },
      //       );

      //       console.log(' -0--0----    ', confirmPaymentIntent);

      //       if (confirmPaymentIntent) {
      //         atComplete({
      //           status: true,
      //           data: {
      //             paymentIntentId: onComplete?.paymentIntentId,
      //             clientSecret: onComplete?.client_secret,
      //             confirmPaymentIntent: confirmPaymentIntent,
      //           },
      //         });
      //       }
      //     }
      //   });
      // }

      await paymentIntentReq(body, 'RESIDENT', async (onComplete: any) => {
        let paymentMethodData: any = {
          // token: res?.token,
        };
        console.log('paymentMethodData -----  ', paymentMethodData);
        console.log('onComplete secret ----   ', onComplete);
        const paymentIntentId = onComplete?.clientSecret?.split('_secret')[0];
        console.log('paymentIntentId ----  ', paymentIntentId);

        fetch(
          `https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              payment_method: 'pm_card_visa',
              return_url: 'https://www.google.com',
            })?.toString(),
          },
        )
          .then(res => res?.json())
          .then(data => console.log('Stripe Response:', data))
          .catch(err => console.error('Error:', err));

        let confirmPaymentIntent = await confirmPayment(
          onComplete?.clientSecret,
          {
            paymentMethodType: 'Card',
            paymentMethodData: paymentMethodData,
          },
        );
        console.log('confirmPaymentIntent ---  ', confirmPaymentIntent);

        if (confirmPaymentIntent) {
          atComplete({
            status: true,
            data: {
              confirmPaymentIntent: JSON.stringify(confirmPaymentIntent),
            },
          });
        }
      });
    }
    //           },
    //         );
    //       }
    //     });
    //   }
    // }).catch((err: any) => {
    //   dispatch(setIsLoader(false));
    //   atComplete({
    //     status: false,
    //     message: AppStrings.Network.someThingError,
    //   });
    // });
  };

  return {
    completeTransaction,
  };
};

export default useStripeManager;

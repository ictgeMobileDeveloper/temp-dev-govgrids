import {AuthContext} from '../../Utils/AppStrings';
import {
  Base_Url,
  ENDPOINTS,
  STRIPE_TEST_PUBLIC_KEY,
  STRIPE_TEST_SECRET_KEY,
} from '../Urls';
import {getAccessToken} from './AuthTokenService';

export const generateCustomerTokenReq = async (body: any, onComplete: any) => {
  try {
    const response = await fetch('https://api.stripe.com/v1/tokens', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
      },
      method: 'post',
      body: Object.keys(body)
        .map(key => key + '=' + body[key])
        .join('&'),
    });

    const responseData = await response.json();
    console.log('generat customer token api --->>>   ', responseData);

    onComplete({token: responseData?.id, cardId: responseData?.card?.id});
  } catch (error) {
    onComplete(null);
    console.log('error generate customer token ---  ', error);

    throw error;
  }
};

export const generateCustomerId = async (body: any, onComplete: any) => {
  try {
    const response = await fetch('https://api.stripe.com/v1/customers', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
      },
      method: 'post',
    });

    const responseData = await response.json();
    console.log('customer id response data ----   ', responseData);

    onComplete({customerId: responseData?.id});
  } catch (error) {
    onComplete(null);
    throw error;
  }
};

export const generateSecreteKey = async (body: any, onComplete: any) => {
  try {
    const response = await fetch('https://api.stripe.com/v1/ephemeral_keys', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
        'Stripe-Version': '2022-08-01',
      },
      method: 'post',
      body: Object.keys(body)
        .map(key => key + '=' + body[key])
        .join('&'),
    });

    const responseData = await response.json();
    onComplete({status: true, message: 'success!', data: responseData});
  } catch (error) {
    onComplete(null);

    throw error; // Rethrow the error for proper error handling
  }
};

export const paymentIntentReq = async (
  body: any,
  authContext: AuthContext,
  endpoint: string,
  onComplete?: any,
) => {
  try {
    const token = await getAccessToken(authContext);

    // if (!token) return;
    const response = await fetch(`${Base_Url}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    console.log('payment Intent response -->>>   ', response);

    const responseData = await response.json();
    if (onComplete) {
      await onComplete(responseData);
    }
  } catch (error) {
    onComplete(null);
    throw error; // Rethrow the error for proper error handling
  }
};

// export const paymentIntentReq = async (
//   body: any,
//   onComplete: (result: any) => void,
// ) => {
//   try {
//     // Convert metadata object to key-value pairs
//     const formBody = new URLSearchParams();

//     // Add all non-metadata fields
//     for (const key in body) {
//       if (key !== 'metadata' && body[key] !== undefined) {
//         formBody.append(key, body[key].toString());
//       }
//     }

//     // Add metadata fields with metadata[key] format
//     if (body.metadata) {
//       for (const key in body.metadata) {
//         formBody.append(`metadata[${key}]`, body.metadata[key].toString());
//       }
//     }

//     const response = await fetch('https://api.stripe.com/v1/payment_intents', {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
//       },
//       method: 'POST',
//       body: formBody.toString(),
//     });

//     const responseData = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         responseData.error?.message || 'Failed to create payment intent',
//       );
//     }
//     onComplete({
//       paymentIntentId: responseData.id,
//       client_secret: responseData.client_secret,
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     onComplete({
//       error: error instanceof Error ? error.message : 'Unknown error',
//     });
//     throw error;
//   }
// };

export const confirmPaymentReq = async (
  paymentId: string,
  body: any,
  onComplete: any,
) => {
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_intents/${paymentId}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${STRIPE_TEST_SECRET_KEY}`,
        },
        method: 'post',
        body: Object.keys(body)
          .map(key => key + '=' + body[key])
          .join('&'),
      },
    );

    const responseData = await response.json();
  } catch (error) {
    onComplete(null);
    throw error; // Rethrow the error for proper error handling
  }
};

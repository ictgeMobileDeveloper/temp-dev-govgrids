import {Base_Url} from '../Urls';
export const getUserProfileReq = async (
  endpoint: string,
  onComplete: (response: {status: boolean; data?: any}) => void,
) => {
  try {
    console.log('🟢 [PROFILE] Fetching profile:', endpoint);

    const response = await fetch(`${Base_Url}${endpoint}`, {
      method: 'GET',
      credentials: 'include', // 🔥 VERY IMPORTANT
    });

    console.log('🟢 [PROFILE] Status:', response.status);
    console.log('🟢 [PROFILE] OK:', response.ok);

    let data: any = null;
    try {
      data = await response.json();
      console.log('🟢 [PROFILE] Response body:', data);
    } catch {
      console.log('🟢 [PROFILE] Empty response body');
    }

    if (response.ok && data?.status !== false) {
      onComplete({
        status: true,
        data: data?.data ?? data,
      });
    } else {
      console.warn('🔴 [PROFILE] Invalid token or unauthorized access', data);
      onComplete({status: false});
    }
  } catch (error) {
    console.error('🔥 [PROFILE] API error:', error);
    onComplete({status: false});
  }
};

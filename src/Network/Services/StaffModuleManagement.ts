import {AuthContext} from '../../Utils/AppStrings';
import {storeAccessToken, resolveAccessToken} from './ApiHandler';
import {setHelpDeskUserData, setSIRUserData} from '../../Redux/AppReducers';

export const canAccessSIR = (profile: any) => {
  return profile?.moduleroles?.some((role: any) => {
    return (
      role?.module?.code === 'SSI1' &&
      role?.module?.isEnabled === true &&
      role?.module?.displayOnMobile === true &&
      ['Security Guard'].includes(role?.name)
    );
  });
};

export const canAccessHelpDesk = (profile: any) => {
  return profile?.moduleroles?.some((role: any) => {
    return (
      role?.module?.code === 'SHD1' &&
      role?.module?.isEnabled === true &&
      role?.module?.displayOnMobile === true &&
      ['Help Desk Requester', 'Help Desk Viewer'].includes(role?.name)
    );
  });
};

export const hydrateStaffModuleAccess = async ({
  sourceContext,
  profile,
  dispatch,
}: {
  sourceContext: AuthContext;
  profile: any;
  dispatch: any;
}) => {
  const token = await resolveAccessToken(sourceContext);

  if (!token) return;

  if (canAccessSIR(profile)) {
    await storeAccessToken(token, 'SIR');
    dispatch(setSIRUserData(profile));
  }

  if (canAccessHelpDesk(profile)) {
    await storeAccessToken(token, 'HELPDESK');
    dispatch(setHelpDeskUserData(profile));
  }
};

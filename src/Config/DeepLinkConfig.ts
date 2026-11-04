import {LinkingOptions} from '@react-navigation/native';
import Config from 'react-native-config';
import {Routes} from '../Utils/Routes';

export const linking: LinkingOptions<any> = {
  prefixes: [`https://${Config.UNIVERSAL_URL}`, `${Config.CUSTOM_URL}://`],

  config: {
    screens: {
      // RESIDENT

      [Routes.FOIA.ReqDetailScreen]:
        'public/resident/foia/requests/details/:id',

      [Routes.ParkingPermit.ReqDetail]:
        'public/resident/parking-permit/permits/details/:id',

      [Routes.ParkingPermit.SessionDetail]:
        '/public/resident/parking-permit/sessions/details/:id',

      [Routes.RIP.ReqDetail]:
        'public/resident/issues-portal/requests/details/:id',

      [Routes.FlagRaising.ReqDetailScreen]:
        'public/resident/flag-raising-request/requests/details/:id',

      [Routes.CartRental.DetailScreen]:
        'public/resident/city-cart-rental/requests/details/:id',

      [Routes.CartRental.DamageReportDetails]:
        'public/resident/city-cart-rental/damage-claims/details/:id',

      [Routes.CartRental.ReturnReportDetails]:
        'public/resident/city-cart-rental/returns/details/:id',

      // CDR

      [Routes.CDR.ReqDetailScreen]:
        'public/staff/court-discovery-request/requests/details/:id',

      // TIMEKEEPING

      [Routes.TimeKeeping.Portal]: 'public/staff/timekeeping/leave-requests',

      // VENDOR BILLING

      [Routes.PoliceDuty.InvoiceDetailScreen]:
        'public/vendor/integrated-billing/invoice-type-catalog/PDI/invoices/details/:id',

      // VENDOR BILLING

      [Routes.PoliceDuty.BillingJobDetails]:
        'public/vendor/integrated-billing/invoice-type-catalog//jobs/details/:id',
    },
  },
};

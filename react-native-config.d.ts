declare module 'react-native-config' {
  export interface NativeConfig {
    CAPTCHA_SITE_KEY: string;
    GOOGLE_MAP_KEY: string;
    PLACE_API_KEY: string;
    STRIPE_TEST_SECRET_KEY: string;
    STRIPE_TEST_PUBLIC_KEY: string;
    STRIPE_TEST_PUBLISH_KEY: string;
    API_BASE_URL: string;
    WEBSOCKET_URL: string;
    CITY_POLYGON: string;
    COOKIE_DOMAIN: string;
    PRIMARY_COLOR: string;
    SECONDARY_COLOR: string;
    ACCENT_COLOR: string;
    CUSTOM_URL: string;
    UNIVERSAL_URL: string;
    PACKAGE_NAME: string;
  }

  export const Config: NativeConfig;
  export default Config;
}

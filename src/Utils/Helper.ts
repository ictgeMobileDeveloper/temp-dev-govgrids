import RNFS from 'react-native-fs';
import {useSharedValue} from 'react-native-reanimated';
import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {AppColors, normalized} from './AppConstants';
import {AccessibilityInfo, Linking, Platform} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Routes} from './Routes';
import {Base_Url} from '../Network/Urls';
import {useCallback, useRef, useState} from 'react';
import {setRecaptchaTokenProvider} from '../Network/Services/ApiHandler';
import {Config} from 'react-native-config';

type LatLng = {lat: number; lng: number};
type FormatAmountOptions = {
  currency?: string;
};
type Rectangle = {
  low: {latitude: number; longitude: number};
  high: {latitude: number; longitude: number};
};

let lastMsg = '';
export async function announcement(message: string, opts = {delay: 120}) {
  const enabled = await AccessibilityInfo.isScreenReaderEnabled();

  if (!enabled) {
    return;
  }

  const msgToSpeak = message === lastMsg ? `${message} ` : message;
  lastMsg = msgToSpeak;

  requestIdleCallback(() => {
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(msgToSpeak);
    }, opts.delay ?? 120);
  });
}
export function extractAddressDetails(place: any) {
  const addressComponents = place.address_components;
  console.log('component', addressComponents);
  const cityComponent = addressComponents.find((component: any) =>
    component.types.includes('locality'),
  );
  const stateComponent = addressComponents.find((component: any) =>
    component.types.includes('administrative_area_level_1'),
  );

  const zipCodeComponent = addressComponents.find((component: any) =>
    component.types.includes('postal_code'),
  );
  const countryComponent = addressComponents.find((component: any) =>
    component.types.includes('country'),
  );

  const addressInfo = {
    city: cityComponent ? cityComponent.long_name : '',
    state: stateComponent ? stateComponent.long_name : '',
    stateCode: stateComponent ? stateComponent.short_name : '',
    zipcode: zipCodeComponent ? zipCodeComponent.long_name : '',
    country: countryComponent ? countryComponent.long_name : '',
  };

  return addressInfo;
}

export const makeId = (length: any) => {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const formatDateOnly = (date: any) => {
  if (!date) return '';

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};
export const formatDateTime = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
export const formatDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseDateKey = (dateString: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getTodayDate = () => formatDateKey(new Date());

export const getShortDayName = (d: string) =>
  parseDateKey(d).toLocaleDateString('en-US', {weekday: 'short'});

export const getFormattedDate = (d: string) =>
  parseDateKey(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const getSectionTitle = (d: string) => {
  const today = getTodayDate();
  if (d === today) return `Today, ${getFormattedDate(d)}`;
  return `${parseDateKey(d).toLocaleDateString('en-US', {
    weekday: 'long',
  })}, ${getFormattedDate(d)}`;
};

export const addDays = (d: string, amount: number) => {
  const date = parseDateKey(d);
  date.setDate(date.getDate() + amount);
  return formatDateKey(date);
};

export const daysFromToday = (d: string) => {
  const diff =
    parseDateKey(d).getTime() - parseDateKey(getTodayDate()).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

export const getStartOfWeek = (d: string) => {
  const date = parseDateKey(d);
  date.setDate(date.getDate() - date.getDay());
  return formatDateKey(date);
};

export const getWeekDates = (anchor: string) => {
  const start = getStartOfWeek(anchor);
  return Array.from({length: 7}, (_, i) => addDays(start, i));
};

export const getMonthRange = (date: Date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
};

export const getFullDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

export const getRawTime = (timeString?: string) =>
  timeString ? timeString.slice(0, 5) : '';

export const truncateName = (name: string, maxLength = 30) =>
  name?.length > maxLength ? `${name.slice(0, maxLength - 3).trim()}...` : name;

export const truncateFileName = (name: string) => {
  const str = String(name || '').trim();

  if (!str) return 'N/A';

  const lastDot = str.lastIndexOf('.');
  const hasExt =
    lastDot > 0 && lastDot < str.length - 1 && str.length - lastDot <= 8;

  const ext = hasExt ? str.slice(lastDot) : '';
  const base = hasExt ? str.slice(0, lastDot) : str;

  if (str.length <= 24) return str;

  const maxLength = 24;
  const dots = '...';
  const frontCount = 10;
  const backCount = maxLength - frontCount - dots.length - ext.length;

  if (backCount <= 0) {
    return `${base.slice(0, maxLength - dots.length)}${dots}`;
  }

  return `${base.slice(0, frontCount)}${dots}${base.slice(-backCount)}${ext}`;
};

export const capitalizeFirstLetter = (txt = '') => {
  if (txt?.length > 0) {
    const arr = txt.split(' ');
    return arr.length == 0
      ? '-'
      : arr.length == 1
      ? txt.charAt(0).toUpperCase()
      : arr[0].charAt(0).toUpperCase() + arr[1].charAt(0).toUpperCase();
  } else {
    return '';
  }
};

export const capitalizeEachWord = (sentence: any): string => {
  return String(sentence ?? '')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
export const extractNumbers = (str: string): string => {
  return str.replace(/\D/g, ''); // \D matches any non-digit character
};

export const getStatusFontSize = (status: any): number => {
  const wordCount = String(status ?? '')
    .trim()
    .split(' ')
    .filter(Boolean).length;
  return wordCount > 3 ? normalized(9) : normalized(12);
};

export function getFileNameFromUri(uri: any) {
  if (!uri) return null;
  const cleanUri = uri.replace('file://', '');
  return cleanUri.split('/').pop();
}

export const generateFullYearCalendar = (year = new Date().getFullYear()) => {
  const result = [];

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);

      result.push({
        date: day,
        dayName: dateObj.toLocaleDateString('en-US', {weekday: 'long'}),
        month: dateObj.toLocaleDateString('en-US', {month: 'long'}),
      });
    }
  }

  return result;
};

export function getErrorMessage(res: any) {
  if (res && Array.isArray(res.documents)) {
    return res.documents[0];
  } else if (res.message) {
    return res.message;
  } else if (res.detail) {
    return res.detail;
  } else if (res.error) {
    return res.error;
  } else {
    return 'Something went wrong!';
  }
}

export const formatAmount = (
  value: number | string | null | undefined,
  options: FormatAmountOptions = {},
): string => {
  if (value == null || isNaN(Number(value))) return '0';

  return new Intl.NumberFormat('en-US', {
    style: options.currency ? 'currency' : 'decimal',
    currency: options.currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
};
const OFFSET = 0; // or your desired base offset

export const useGradualAnimation = () => {
  const totalOffset = OFFSET;
  const height = useSharedValue(totalOffset);

  const isAndroid = Platform.OS === 'android';
  const apiLevel = Number(Platform.Version);
  const useFirstFormula =
    Platform.OS === 'ios' || (isAndroid && apiLevel >= 35);

  useKeyboardHandler(
    {
      onMove: e => {
        'worklet';
        if (e.height > 0) {
          if (useFirstFormula) {
            // iOS + Android 15/16
            height.value = Math.max(e.height + totalOffset, totalOffset);
          } else {
            // Android 14 or lower
            height.value = Math.max(e.height / 2, totalOffset);
          }
        } else {
          height.value = totalOffset;
        }
      },
    },
    [],
  );

  return {height};
};

export const isEmailValid = (email: string) => {
  if (!email) {
    return false;
  }
  let validEmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return validEmailRegex.test(email.trim());
};

export function lightenHexColor(hex: string, percent: number) {
  // Remove "#" if present
  hex = hex?.replace(/^#/, '');

  // Parse r,g,b
  let r = parseInt(hex?.substring(0, 2), 16);
  let g = parseInt(hex?.substring(2, 4), 16);
  let b = parseInt(hex?.substring(4, 6), 16);

  // Increase each by percent
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // Convert back to hex
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function darkenHexColor(hex: string, percent: number) {
  // Remove "#" if present
  hex = hex?.replace(/^#/, '');

  // Parse r,g,b
  let r = parseInt(hex?.substring(0, 2), 16);
  let g = parseInt(hex?.substring(2, 4), 16);
  let b = parseInt(hex?.substring(4, 6), 16);

  // Decrease each by percent
  r = Math.max(0, Math.floor(r * (1 - percent)));
  g = Math.max(0, Math.floor(g * (1 - percent)));
  b = Math.max(0, Math.floor(b * (1 - percent)));

  // Convert back to hex
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function ThemeHexLighten(hex: string, dark: boolean) {
  hex = hex?.replace(/^#/, '');

  if (!hex || hex.length !== 6) {
    return dark ? '#1C2B27' : '#E9F7F3';
  }

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  const percent = 0.85;

  if (dark) {
    // Dark theme → dark background
    r = r * (1 - percent);
    g = g * (1 - percent);
    b = b * (1 - percent);
  } else {
    // Light theme → light background
    r = r + (265 - r) * percent;
    g = g + (265 - g) * percent;
    b = b + (265 - b) * percent;
  }

  const toHex = (value: number) =>
    Math.round(Math.max(0, Math.min(255, value)))
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
export const allowOnlyString: any = (value: any) => {
  if (typeof value === 'string') {
    return value;
  } else {
    return null;
  }
};

export const parseCallbackUrlParams = (url: string) => {
  const [beforeHash, hash] = url.split('#');
  const role = beforeHash.replace(/^[a-zA-Z0-9.-]+:\/\//, '').split('/')[0];

  const params: Record<string, string> = {};
  if (hash) {
    hash.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key)
        params[decodeURIComponent(key)] = decodeURIComponent(value ?? '');
    });
  }

  return {
    role,
    accessToken: params.accessToken,
    expiresIn: params.expiresIn,
  };
};

export const formatMinutesToHours = (
  value: number | string | null | undefined,
): string => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const totalMinutes = Number(value);

  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) {
    return '—';
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${minutes} min`;
};
export const formatPhoneNumber = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 10) {
    digits = digits.slice(0, 10);
  }
  if (digits.length > 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 3) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  } else {
    return digits;
  }
};

export const getFileNameFromPath = (path?: string): string => {
  if (!path) return '';
  return path.split('/').pop() ?? '';
};
export const allowOnlyNumbers = (value: string): string => {
  return value.replace(/\D/g, '');
};

export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${size} ${sizes[i]}`;
}

export async function base64ToPng(dataUrl: string) {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const path = `${RNFS.CachesDirectoryPath}/signature_${Date.now()}.png`;
  await RNFS.writeFile(path, base64, 'base64');
  return `file://${path}`;
}

export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

export const formatTo12Hour = (time?: string | null) => {
  if (!time) return ''; // handle empty
  const parts = time.split(':'); // supports "HH:mm" or "HH:mm:ss"
  if (parts.length < 2) return time; // fallback if unexpected

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');

  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${suffix}`;
};

export const formatCaseNo = (raw: string) => {
  const digits = raw.replace(/\D/g, ''); // keep numbers only
  if (digits.length <= 2) return digits; // no hyphen yet
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
};

// timeAgo.ts
export const formatTimeAgo = (input?: string | Date | null) => {
  if (!input) return '';

  const date =
    input instanceof Date ? input : new Date(String(input).replace(' ', 'T'));

  if (isNaN(date.getTime())) return String(input);

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? '1 day ago' : `${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
};

export const getDurationInSeconds = (
  startTime?: string | Date,
  endTime?: string | Date,
): number => {
  if (!startTime || !endTime) return 1;

  return Math.max(
    Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000,
    ),
    1,
  );
};

export const formatRemainingTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )}:${String(secs).padStart(2, '0')}`;
};

export const getElapsedMinutes = (startTime?: string | Date): number => {
  if (!startTime) return 0;

  const start = new Date(startTime).getTime();
  const now = Date.now();

  if (Number.isNaN(start)) return 0;

  return Math.max(0, Math.floor((now - start) / (1000 * 60)));
};

export const getRemainingMinutes = (
  startTime?: string | Date,
  durationMinutes?: number,
): number => {
  if (!startTime || !durationMinutes) return 0;

  const maxEndTime =
    new Date(startTime).getTime() + durationMinutes * 60 * 1000;

  return Math.max(0, Math.ceil((maxEndTime - Date.now()) / (60 * 1000)));
};

export const getRemainingSeconds = (expiresAt: string | Date) =>
  Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
export const formatStatus = (status: string = ''): string => {
  return String(status)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};
export function initials(input: string): string {
  if (!input) return '';

  return input.trim().split(/\s+/)[0][0].toUpperCase();
}

export const safeHtml = (html?: string) => {
  if (!html) return '<div></div>';
  // Ensure one root wrapper exists
  return html.trim().startsWith('<div>') ? html : `<div>${html}</div>`;
};
export const removeHtmlTags = (html: string) => {
  return (
    html
      ?.replace(/<[^>]*>/g, '')
      ?.replace(/&nbsp;/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, '')

      .replace(
        /\s+(data-[\w-]+|js\w+|jsaction|jscontroller|jsuid|role|tabindex|aria-[\w-]+)="[^"]*"/gi,
        '',
      )

      .replace(/\s+class="[^"]*"/gi, '')

      .replace(/\s+style="[^"]*"/gi, '')

      .replace(/<span>\s*<\/span>/gi, '')

      // Convert multiple spaces/newlines into normal spaces
      .replace(/\s+/g, ' ')
      ?.trim()
  );
};

export const groupCommentsByDate = (comments: any[]) => {
  const groups: {[date: string]: any[]} = {};

  comments.forEach(comment => {
    const date = comment?.commentAt
      ? comment.commentAt.split(' ')[0]
      : comment.createdAt.split(' ')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(comment);
  });

  return Object.entries(groups);
};

export const getStatusColor = (status: any, colors: any) => {
  const normalizedStatus = String(status ?? '').toLowerCase();

  if (
    normalizedStatus === 'new' ||
    normalizedStatus === 'under review' ||
    normalizedStatus === 'ready to publish partially' ||
    normalizedStatus === 'archived' ||
    normalizedStatus === 'partially paid' ||
    normalizedStatus === 'partiallypaid' ||
    normalizedStatus === 'pending' ||
    normalizedStatus === 'inprogress' ||
    normalizedStatus === 'creation' ||
    normalizedStatus === 'inreview' ||
    normalizedStatus === 'pendingapproval' ||
    normalizedStatus === 'acknowledged' ||
    normalizedStatus === 'unknown' ||
    normalizedStatus === 'open' ||
    normalizedStatus === 'pendingpickup'
  ) {
    return colors.ToastColors.Alarm;
  } else if (
    normalizedStatus === 'accepted' ||
    normalizedStatus === 'published' ||
    normalizedStatus === 'assigned' ||
    normalizedStatus === 'paid' ||
    normalizedStatus === 'fulfilled' ||
    normalizedStatus === 'approved' ||
    normalizedStatus === 'replaced' ||
    normalizedStatus === 'delivered' ||
    normalizedStatus === 'returned' ||
    normalizedStatus === 'active' ||
    normalizedStatus === 'pickedup' ||
    normalizedStatus === 'enabled' ||
    normalizedStatus === 'false'
  ) {
    return colors?.Primary;
  } else if (
    normalizedStatus === 'disapproved' ||
    normalizedStatus === 'declined' ||
    normalizedStatus === 'closed' ||
    normalizedStatus === 'unpaid' ||
    normalizedStatus === 'expired' ||
    normalizedStatus === 'high' ||
    normalizedStatus === 'damaged' ||
    normalizedStatus === 'cancelled' ||
    normalizedStatus === 'disabled' ||
    normalizedStatus === 'true'
  ) {
    return colors.ToastColors.Error;
  } else if (
    normalizedStatus === 'forwarded' ||
    normalizedStatus === 'ready to partial publish' ||
    normalizedStatus === 'changesrequested' ||
    normalizedStatus === 'needsreview' ||
    normalizedStatus === 'finalized' ||
    normalizedStatus === 'timeverified' ||
    normalizedStatus === 'returnRequested'
  ) {
    return colors.Dark_Blue;
  } else if (
    normalizedStatus === 'ready to publish' ||
    normalizedStatus === 'partially published'
  ) {
    return colors.Ice_Blue;
  } else if (normalizedStatus === 'withdrawn') {
    return colors.Black;
  }

  return colors.Desc_Txt;
};

export const formatAmountToUSD = (
  amount: number | string | null | undefined,
): string => {
  if (amount == null || isNaN(Number(amount))) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

export const resetToWelcomeAndHome = (navigation: any, Route: any) => {
  const state = navigation.getState();
  console.log('logging out!');

  const welcomeIndex = state.routes.findIndex(
    (r: any) => r.name === Routes.MainScreen,
  );

  const homeIndex = state.routes.findIndex((r: any) => r.name === Route);

  // Safety fallback
  if (welcomeIndex === -1 || homeIndex === -1) {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{name: Routes.MainScreen}, {name: Route}],
      }),
    );
    return;
  }

  const preservedRoutes = [state.routes[welcomeIndex], state.routes[homeIndex]];

  navigation.dispatch(
    CommonActions.reset({
      index: preservedRoutes.length - 1,
      routes: preservedRoutes,
    }),
  );
};
export const resetToScreen = (navigation: any, routeName: string) => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: routeName}],
    }),
  );
};
export const normalizeHours = (value: string | null | undefined) => {
  if (!value) return '00h 00m';

  const hourMatch = value.match(/(\d+)\s*h/);
  const minuteMatch = value.match(/(\d+)\s*m/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');

  return `${paddedHours}h ${paddedMinutes}m`;
};

export const copyAttachmentToAppStorage = async (attachment: any) => {
  if (!attachment?.uri) {
    return attachment;
  }

  const targetDir = `${RNFS.DocumentDirectoryPath}/foia_attachments`;
  await RNFS.mkdir(targetDir);

  const originalName = attachment?.name ?? 'foia_attachment';
  const dotIndex = originalName.lastIndexOf('.');
  const baseName =
    dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const extensionFromName = dotIndex > 0 ? originalName.slice(dotIndex) : '';
  const extensionFromType = attachment?.type
    ? `.${attachment.type.split('/').pop()}`
    : '';
  const finalExtension = extensionFromName || extensionFromType;
  const uniqueName = `${baseName}_${Date.now()}_${makeId(4)}${finalExtension}`;
  const targetPath = `${targetDir}/${uniqueName}`;
  const sourceUri = attachment.uri;
  const sourcePath = sourceUri.startsWith('file://')
    ? sourceUri.replace('file://', '')
    : sourceUri;

  if (sourceUri.startsWith('content://')) {
    await ReactNativeBlobUtil.fs.cp(sourceUri, targetPath);
  } else {
    await RNFS.copyFile(sourcePath, targetPath);
  }

  return {
    ...attachment,
    uri: targetPath,
  };
};

export const normalizeValue = (value: any) => {
  return value != null || value?.length == 0 ? value : 'N/A';
};

// for google api
export const genSessionToken = () =>
  `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;

export const extractComponents = (address_components: any[] | undefined) => {
  if (!address_components) return {};
  const get = (type: string) =>
    address_components.find(c => c.types?.includes(type))?.longText;

  return {
    country: get('country'),
    state: get('administrative_area_level_1'),
    city:
      get('locality') ||
      get('postal_town') ||
      get('sublocality') ||
      get('administrative_area_level_2'),
    postalCode: get('postal_code'),
    street: [get('street_number'), get('route')].filter(Boolean).join(' '),
  };
};
export const polygonToRectangle = (
  polygon: LatLng[] | undefined | null,
): Rectangle | null => {
  if (!polygon || polygon.length === 0) {
    return null;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const point of polygon) {
    if (
      typeof point?.lat !== 'number' ||
      typeof point?.lng !== 'number' ||
      !Number.isFinite(point.lat) ||
      !Number.isFinite(point.lng)
    ) {
      continue;
    }

    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
  }

  // No valid coordinates found
  if (
    minLat === Infinity ||
    maxLat === -Infinity ||
    minLng === Infinity ||
    maxLng === -Infinity
  ) {
    return null;
  }

  return {
    low: {
      latitude: minLat,
      longitude: minLng,
    },
    high: {
      latitude: maxLat,
      longitude: maxLng,
    },
  };
};

let samlCallbackHandled = false;

export const tryClaimSamlCallback = (): boolean => {
  if (samlCallbackHandled) return false;
  samlCallbackHandled = true;
  return true;
};

export const resetSamlCallbackGuard = () => {
  samlCallbackHandled = false;
};

export const getCompleteFileUrl = (fileUrl?: string): string => {
  if (!fileUrl) {
    return '';
  }

  return fileUrl.startsWith('http')
    ? fileUrl
    : `${Base_Url}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};

export const parseCoords = (
  raw: string | undefined,
): {lat: number; lng: number} | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const openInMaps = (
  coords: {lat: number; lng: number} | null,
  label?: string,
) => {
  if (!coords) return;

  const encodedLabel = encodeURIComponent(label ?? '');
  const url = Platform.select({
    ios: `maps:0,0?q=${encodedLabel}@${coords.lat},${coords.lng}`,
    android: `geo:0,0?q=${coords.lat},${coords.lng}(${encodedLabel})`,
  });

  const fallback = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  Linking.canOpenURL(url!)
    .then(supported => Linking.openURL(supported ? url! : fallback))
    .catch(() => Linking.openURL(fallback));
};
export const openNotificationSettings = async () => {
  if (Platform.OS === 'android') {
    try {
      const packageName = Config.PACKAGE_NAME;
      const url = `package:${packageName}`;

      await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        {key: 'android.provider.extra.APP_PACKAGE', value: packageName},
      ]);
    } catch (e) {
      Linking.openSettings();
    }
  } else {
    Linking.openSettings();
  }
};

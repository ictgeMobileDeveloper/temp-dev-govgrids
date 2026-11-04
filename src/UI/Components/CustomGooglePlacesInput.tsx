import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {AppRootStore} from '../../Redux/AppStore';
import {useSelector} from 'react-redux';
import {
  extractComponents,
  genSessionToken,
  lightenHexColor,
  polygonToRectangle,
} from '../../Utils/Helper';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';

// ---- Types

type LatLng = {lat: number; lng: number};

type LocationBias = {
  latitude: number;
  longitude: number;
  radius?: number;
};

export type PlaceResult = {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  raw?: any;

  components?: {
    country?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    street?: string;
  };
};

type Props = {
  apiKey: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPlaceSelected?: (place: PlaceResult) => void;
  onError?: (err: any) => void;
  onClear?: () => void;
  placeholder?: string;
  debounceMs?: number;
  minLength?: number;
  maxResults?: number;
  placeholderColor?: string;
  restrictToCity?: boolean;
  allowedCity?: string;
  allowedState?: string;
  country?: string;
  containerStyle?: ViewStyle;
  inputStyle?: any;
  listContainerStyle?: ViewStyle;
  listItemStyle?: ViewStyle;
  listItemTextStyle?: any;
  showClearButton?: boolean;
  countryRestriction?: string;
  disableSuggestions?: boolean;
  error?: boolean;
  searchinMap?: boolean;
  types?: string;
  isEditable?: boolean;
  TickIcon?: React.ComponentType<{size?: number; color?: string}>;
};

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places';

const CustomGooglePlacesInput: React.FC<Props> = ({
  apiKey,
  value,
  error = false,
  onChangeText,
  onPlaceSelected,
  onError,
  placeholder = 'Search address',
  debounceMs = 1000,
  minLength = 2,
  maxResults = 5,
  placeholderColor,
  onClear,
  containerStyle,
  inputStyle,
  listContainerStyle,
  listItemStyle,
  listItemTextStyle,
  showClearButton = true,
  countryRestriction,
  disableSuggestions = false,
  allowedCity,
  restrictToCity = false,
  country,
  types,
  searchinMap = false,
  isEditable = true,
}) => {
  const [text, setText] = useState(value ?? '');
  const [predictions, setPredictions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState(genSessionToken());
  const [controller, setController] = useState<AbortController | null>(null);
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  // for absolute dropdown sizing/position
  const [anchorHeight, setAnchorHeight] = useState(0);
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors, searchinMap)}),
    [colors],
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  const Polygons: LatLng[] | undefined = useMemo(() => {
    const raw = selector?.baseData?.cityAreaPolygon;
    if (!raw) return undefined;
    if (Array.isArray(raw)) return raw;

    if (typeof raw === 'string') {
      try {
        const normalized = raw.replace(/'/g, '"');
        const parsed = JSON.parse(normalized);
        return Array.isArray(parsed) ? parsed : undefined;
      } catch (e) {
        console.log(
          'cityAreaPolygon failed to parse even after quote normalization',
          e,
        );
        return undefined;
      }
    }
    return undefined;
  }, [selector?.baseData?.cityAreaPolygon]);

  const restrictionRectangle = useMemo(
    () => (restrictToCity ? polygonToRectangle(Polygons) : null),
    [Polygons, restrictToCity],
  );

  // Remember the last selected placeId to highlight if it reappears
  const [lastSelectedPlaceId, setLastSelectedPlaceId] = useState<string | null>(
    null,
  );
  const [isSelected, seItsSelected] = useState(false);

  // sync external value
  useEffect(() => {
    if (typeof value === 'string' && value !== text) {
      setText(value);
    }
  }, [value]); // eslint-disable-line

  const abortOngoing = () => {
    try {
      controller?.abort();
    } catch {}
  };
  const fetchPredictions = async (q: string) => {
    if (disableSuggestions) return;

    if (!q || q.trim().length < minLength) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    if (restrictToCity && !restrictionRectangle) {
      console.warn(
        'restrictToCity is true but no polygon rectangle is available yet — skipping search.',
      );
      setPredictions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    abortOngoing();

    const ac = new AbortController();
    setController(ac);

    const body: Record<string, any> = {
      input: q.trim(),
      sessionToken,
      ...(types ? {includedPrimaryTypes: [types]} : {}),
      ...(countryRestriction
        ? {includedRegionCodes: [countryRestriction.toUpperCase()]}
        : {}),
    };

    // True restriction (not bias): only return results inside this box.
    if (restrictionRectangle) {
      body.locationRestriction = {rectangle: restrictionRectangle};
    }

    try {
      const res = await fetch(AUTOCOMPLETE_URL, {
        method: 'POST',
        signal: ac.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      console.log('autocomplete (new) response ----  ', json);

      if (!res.ok) {
        setPredictions([]);
        setOpen(false);
        onError?.(json);
        return;
      }

      const suggestions = json?.suggestions || [];

      // filter for only allowed cirt
      const preds = suggestions
        .filter((s: any) => {
          if (!allowedCity) return true;
          const fullDescription = s.placePrediction?.text?.text || '';
          const escapedCity = allowedCity.replace(
            /[-\/\\^$*+?.()|[\]{}]/g,
            '\\$&',
          );
          const cityRegex = new RegExp(`\\b${escapedCity}\\b`, 'i');
          return cityRegex.test(fullDescription);
        })
        .slice(0, maxResults);

      setPredictions(preds);
      setOpen(preds.length > 0);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        onError?.(e);
        console.log('error on search', e);
      }

      setPredictions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // debounce typing
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedFetch = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (isSelected) return;
      debounceRef.current = setTimeout(() => fetchPredictions(q), debounceMs);
    },
    [debounceMs, fetchPredictions],
  );

  // Details (New)
  const fetchPlaceDetails = async (placeId: string) => {
    const fieldMask = [
      'id',
      'formattedAddress',
      'location',
      'addressComponents',
    ].join(',');

    const res = await fetch(`${PLACE_DETAILS_URL}/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
    });
    const json = await res.json();
    console.log('place details (new) response ----  ', JSON.stringify(json));

    if (!res.ok) {
      onError?.(json);
      return null;
    }
    return json;
  };

  const handleSelectPrediction = async (item: any) => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      const placeId = item.placePrediction?.placeId;
      const details = await fetchPlaceDetails(placeId);
      if (!details) return;

      const comps = extractComponents(details.addressComponents);
      if (countryRestriction && comps?.country && comps.country !== country) {
        onError?.({message: `Only ${country} addresses are supported.`});
        return;
      }

      const loc = details?.location as
        | {latitude: number; longitude: number}
        | undefined;
      const formatted =
        details?.formattedAddress || item.placePrediction?.text?.text || text;

      const payload: PlaceResult = {
        address: formatted,
        lat: loc?.latitude ?? 0,
        lng: loc?.longitude ?? 0,
        placeId: details?.id ?? placeId,
        raw: details,
        components: comps,
      };

      setLastSelectedPlaceId(payload.placeId);
      setText(formatted);
      setPredictions([]);
      setOpen(false);
      setSessionToken(genSessionToken());
      onPlaceSelected?.(payload);
      seItsSelected(true);
    } catch (e) {
      onError?.(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (t: string) => {
    setText(t);
    seItsSelected(false);
    onChangeText?.(t);
    if (t.trim().length >= minLength) debouncedFetch(t);
    else {
      setOpen(false);
      setPredictions([]);
    }
  };

  const handleClear = () => {
    if (!isEditable) return;
    setText('');
    onChangeText?.('');
    onClear?.();
    setPredictions([]);
    setOpen(false);
  };

  const outerTapClose = () => {
    if (open) setOpen(false);
  };

  const renderItem = ({item}: {item: any}) => {
    const placeId = item.placePrediction?.placeId;
    const isPreviouslySelected =
      !!lastSelectedPlaceId && placeId === lastSelectedPlaceId;

    return (
      <TouchableOpacity
        style={[
          styles.item,
          listItemStyle,
          isPreviouslySelected && {
            backgroundColor: lightenHexColor(colors.Primary, 0.6),
          },
        ]}
        activeOpacity={0.85}
        onPress={() => handleSelectPrediction(item)}>
        <View style={styles.itemRow}>
          <Text numberOfLines={2} style={[styles.itemText, listItemTextStyle]}>
            {item.placePrediction?.text?.text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: any) =>
    item.placePrediction?.placeId || item.placePrediction?.text?.text;

  const showDropdown = open && !disableSuggestions && predictions.length > 0;

  return (
    <TouchableWithoutFeedback onPress={outerTapClose} accessible={false}>
      <View
        style={[styles.container, containerStyle]}
        onLayout={e => setAnchorHeight(e.nativeEvent.layout.height)}>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            editable={isEditable}
            onChangeText={handleChange}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor ?? '#9AA0A6'}
            style={[
              styles.input,
              inputStyle,
              {
                fontSize: normalized(13),
                color: colors.Heading_Txt,
              },
              {
                backgroundColor: error ? colors.redLight : colors.Background,
                borderColor: error ? colors.Error : colors.BorderColor,
              },
            ]}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
          />
          {!loading && showClearButton && !!text && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.clearTxt}>✕</Text>
            </TouchableOpacity>
          )}
          {loading && (
            <View style={styles.spinner}>
              <ActivityIndicator />
            </View>
          )}
        </View>

        {showDropdown && (
          <View
            style={[
              styles.listContainerAbsolute,
              {top: anchorHeight + 6},
              listContainerStyle,
            ]}
            pointerEvents="box-none">
            <View style={styles.listCard}>
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={predictions}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.sep} />}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CustomGooglePlacesInput;

// ---- Styles
const makeStyles = (colors: any, searchInMap?: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      position: 'relative',
      zIndex: 999,
    },
    inputRow: {
      position: 'relative',
      zIndex: 1,
      backgroundColor: colors.Background,
    },
    input: {
      height: normalized(48),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: searchInMap ? 2 : 12,
      paddingLeft: 16,
      paddingRight: 44,
      color: '#111827',
      ...Platform.select({
        android: {paddingVertical: 10},
        ios: {paddingVertical: 12},
      }),
    },
    clearBtn: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    clearTxt: {
      fontSize: 16,
      color: '#6B7280',
    },
    spinner: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    listContainerAbsolute: {
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 999,
      elevation: 10,
    },
    listCard: {
      borderWidth: 1,
      borderColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      maxHeight: 280,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: {width: 0, height: 4},
        },
        android: {elevation: 10},
      }),
    },
    item: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      justifyContent: 'space-between',
    },
    itemText: {
      flex: 1,
      color: '#111827',
      fontSize: 14,
      lineHeight: 18,
    },
    sep: {
      height: 1,
      backgroundColor: '#F3F4F6',
    },
  });

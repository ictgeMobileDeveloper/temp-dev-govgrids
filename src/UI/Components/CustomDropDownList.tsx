// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Easing,
//   ScrollView,
//   UIManager,
//   findNodeHandle,
//   Dimensions,
// } from 'react-native';
// import { useSelector } from 'react-redux';
// import { AppRootStore } from '../../Redux/AppStore';
// import { AppStyles } from '../../Utils/AppStyles';
// import { AppFonts, normalized } from '../../Utils/AppConstants';
// import TickIcon from '../Svg/TickIcon';
// import { lightenHexColor } from '../../Utils/Helper';
// import DropDownIcon from '../Svg/DropDownIcon';

// type Item = { name: string; value?: string | number };

// type Props = {
//   list: Item[];
//   selectedIndex: number;
//   onChange: (index: number) => void;
//   placeholder?: string;
//   maxPanelHeight?: number;
//   parentScrollRef?: React.RefObject<ScrollView>;
//   bottomPadding?: number;
//   listStyle: any;
// };

// const ITEM_H = normalized(40);

// const CustomDropDownList: React.FC<Props> = ({
//   list,
//   selectedIndex,
//   onChange,
//   placeholder = 'Select',
//   maxPanelHeight = normalized(260),
//   parentScrollRef,
//   bottomPadding = normalized(12),
//   listStyle,
// }) => {
//   const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
//   const styles = useMemo(
//     () => ({ ...makeStyles(colors) }),
//     [colors],
//   );

//   const [open, setOpen] = useState(false);
//   const openAnim = useRef(new Animated.Value(0)).current;
//   const caretAnim = openAnim;

//   // for measuring
//   const wrapRef = useRef<View>(null);

//   const totalH = ITEM_H * (list?.length || 0) + 12;
//   const contentH = Math.min(totalH, maxPanelHeight);

//   useEffect(() => {
//     Animated.timing(openAnim, {
//       toValue: open ? 1 : 0,
//       duration: 240,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: false, // animating height
//     }).start(({ finished }) => {
//       if (finished && open) {
//         // after animation is running, ensure visibility
//         requestAnimationFrame(() => ensurePanelVisible());
//       }
//     });
//   }, [open]);

//   const panelHeight = openAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, contentH],
//   });
//   const panelOpacity = openAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 1],
//   });
//   const caretRotate = caretAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '180deg'],
//   });

//   const toggle = () => setOpen(o => !o);

//   const handleSelect = (i: number) => {
//     if (i !== selectedIndex) onChange(i);
//     setOpen(false);
//   };

//   const selectedItem = list?.[selectedIndex];
//   const lightGreen = lightenHexColor(colors.Primary, 0.7);

//   const ensurePanelVisible = () => {
//     if (!parentScrollRef?.current || !wrapRef.current) return;

//     const parentNode = findNodeHandle(parentScrollRef.current);
//     const selfNode = findNodeHandle(wrapRef.current);
//     if (!parentNode || !selfNode) return;

//     UIManager.measureLayout(
//       selfNode,
//       parentNode,
//       () => { },
//       (left, top, width, height) => {

//         const targetBottom = top + height + contentH + bottomPadding;

//         const { height: windowH } = Dimensions.get('window');

//         const visibleH = windowH;

//         const desiredY = Math.max(0, targetBottom - visibleH);

//         parentScrollRef.current.scrollTo({ y: desiredY, animated: true });
//       }
//     );
//   };

//   return (
//     <View ref={wrapRef} style={styles.wrap}>
//       {/* Trigger */}
//       <TouchableOpacity
//         activeOpacity={0.9}
//         onPress={toggle}
//         style={[styles.trigger, { borderColor: colors.Grey_2 }]}>
//         <Text numberOfLines={1} style={styles.triggerText}>
//           {selectedItem?.name ?? placeholder}
//         </Text>

//         <Animated.View style={{ transform: [{ rotate: caretRotate }] }}>
//           <DropDownIcon width={18} height={18} />
//         </Animated.View>
//       </TouchableOpacity>

//       {/* Animated panel */}
//       <Animated.View
//         style={[
//           styles.panel,
//           {
//             height: panelHeight,
//             opacity: panelOpacity,
//             borderColor: colors.Grey_2,
//             ...listStyle
//           },
//         ]}>
//         <ScrollView
//           bounces={false}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.panelContent}>
//           {list?.map((item, index) => {
//             const isActive = index === selectedIndex;
//             return (
//               <TouchableOpacity
//                 key={`${item?.value ?? item?.name}-${index}`}
//                 activeOpacity={0.9}
//                 onPress={() => handleSelect(index)}
//                 style={[
//                   styles.row,
//                   isActive && { backgroundColor: lightGreen },
//                   index === 0 && {
//                     borderTopLeftRadius: normalized(10),
//                     borderTopRightRadius: normalized(10),
//                   },
//                   index === list.length - 1 && {
//                     borderBottomLeftRadius: normalized(10),
//                     borderBottomRightRadius: normalized(10),
//                   },
//                 ]}>
//                 <Text numberOfLines={1} style={styles.rowText}>
//                   {item?.name ?? item}
//                 </Text>
//                 {isActive ? (
//                   <TickIcon primary={colors.Primary} width={20} height={20} />
//                 ) : (
//                   <View style={{ width: 20, height: 20 }} />
//                 )}
//               </TouchableOpacity>
//             );
//           })}
//         </ScrollView>
//       </Animated.View>
//     </View>
//   );
// };

// export default CustomDropDownList;

// /* ===== Styles ===== */
// const makeStyles = (colors: any) =>
//   StyleSheet.create({
//     wrap: {
//       width: '100%',
//     },
//     trigger: {
//       minHeight: normalized(44),
//       paddingHorizontal: normalized(14),
//       borderRadius: normalized(10),
//       borderWidth: 1,
//       backgroundColor: colors.Background,
//       alignItems: 'center',
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//     },
//     triggerText: {
//       flex: 1,
//       marginRight: normalized(10),
//       color: colors.Heading,
//       fontSize: normalized(14),
//       fontFamily: AppFonts.InterRegular,
//     },
//     panel: {
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderTopWidth: 0,
//       borderBottomLeftRadius: normalized(10),
//       borderBottomRightRadius: normalized(10),
//       backgroundColor: colors.Background,
//       marginTop: -1,
//     },
//     panelContent: {
//       marginVertical: normalized(6),
//     },
//     row: {
//       height: ITEM_H,
//       paddingHorizontal: normalized(14),
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//     },
//     rowText: {
//       fontSize: normalized(14),
//       fontFamily: AppFonts.InterRegular,
//       color: colors.Heading,
//     },
//   });

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  UIManager,
  findNodeHandle,
  Dimensions,
  ScrollViewInstance,
  ViewInstance,
  LayoutChangeEvent,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import TickIcon from '../Svg/TickIcon';
import DropDownIcon from '../Svg/DropDownIcon';
import {AppStyles} from '../../Utils/AppStyles';
import {AppFonts, normalized} from '../../Utils/AppConstants';
import {lightenHexColor} from '../../Utils/Helper';
import CustomInput from './CustomInput';

type Item = {name: string; value?: string | number};
type DropdownItem = Item | string;

type Props = {
  list?: DropdownItem[];
  selectedIndex?: number | number[];
  onChange?: (index: number) => void;
  placeholder?: string;
  maxPanelHeight?: number;
  parentScrollRef?: React.RefObject<ScrollViewInstance | null>;
  bottomPadding?: number;
  listStyle?: any;
  // for dynamic forms
  heading?: string | {name: string; options?: unknown[]}[];

  // searchable
  isSearchable?: boolean;
  fetchList?: (search: string) => Promise<DropdownItem[]>;
  onSelect?: (item: Item) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  allowCustomText?: boolean;
  /** if true, panel opens upward. default false. */
  openUp?: boolean;
  /** when true, show error visual state */
  error?: boolean;
  borderColor?: string;
  isOpen?: boolean;
  isMulti?: boolean;
  hideTrigger?: boolean;
  setIsOpen?: (value: boolean) => void;
};

const ITEM_H = normalized(40);

const CustomDropDownList: React.FC<Props> = ({
  list,
  selectedIndex,
  onChange,
  placeholder = 'Select',
  maxPanelHeight = normalized(260),
  parentScrollRef,
  bottomPadding = normalized(12),
  listStyle,
  onSelect,
  openUp = false,
  error = false,
  borderColor,
  onChangeText,
  isOpen = false,
  isMulti = false,
  hideTrigger = false,
  isSearchable = false,
  heading,
  fetchList,
  value,
  setIsOpen,
}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const styles = useMemo(
    () => ({...AppStyles(colors), ...makeStyles(colors)}),
    [colors],
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  const [internalOpen, setInternalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(value ?? '');
  const [searchList, setSearchList] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isControlled = typeof isOpen === 'boolean' && !!setIsOpen;

  const openState = isControlled ? isOpen! : internalOpen;

  const setOpenState = (val: boolean) => {
    if (isControlled) {
      setIsOpen?.(val);
    } else {
      setInternalOpen(val);
    }
  };
  const openAnim = useRef(new Animated.Value(0)).current;
  const caretAnim = openAnim;

  // measurement refs
  const wrapRef = useRef<ViewInstance>(null);
  const triggerRef = useRef<ViewInstance>(null);
  const [triggerHeight, setTriggerHeight] = useState<number>(0);
  const displayList = isSearchable ? searchList : list ?? [];
  const headingByOptionIndex = new Map<number, string>();
  if (Array.isArray(heading)) {
    let optionIndex = 0;
    heading.forEach(group => {
      headingByOptionIndex.set(optionIndex, group.name);
      optionIndex += group.options?.length ?? 0;
    });
  }
  // const totalH =
  //   list?.length == 1
  //     ? ITEM_H * (list?.length || 0)
  //     : ITEM_H * (list?.length || 0);

  // const contentH = Math.min(totalH, maxPanelHeight);
  const headingCount = Array.isArray(heading)
    ? heading.length
    : heading
    ? 1
    : 0;
  const totalH =
    ITEM_H * (displayList?.length || 0) + normalized(32) * headingCount;
  const contentH = Math.min(totalH, maxPanelHeight);

  useEffect(() => {
    Animated.timing(openAnim, {
      toValue: openState ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished && openState) {
        // ensure the panel (up or down) is visible inside parent scroll
        requestAnimationFrame(() => ensurePanelVisible());
      }
    });
  }, [openState]); // eslint-disable-line react-hooks/exhaustive-deps

  const panelHeight = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentH],
  });
  const panelOpacity = openAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const caretRotate = caretAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const toggle = () => {
    setOpenState(!openState);
  };

  const handleSelect = (i: number) => {
    const item = displayList[i];

    if (isMulti) {
      onChange?.(i);
      return;
    }

    if (isSearchable) {
      if (item) {
        onSelect?.(typeof item === 'string' ? {name: item} : item);
        setSearchValue(getItemLabel(item));
      }
      setSearchList([]); // collapse results after picking
    } else if (i !== selectedIndex) {
      onChange?.(i);
    }

    setOpenState(false);
  };

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (text: string) => {
    setSearchValue(text);
    onChangeText?.(text);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    if (!text.trim() || !fetchList) {
      setSearchList([]);
      setOpenState(false);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setOpenState(true);
      setLoading(true);

      try {
        const result = await fetchList(text.trim());
        setSearchList(result ?? []);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const selectedIndexes: number[] = isMulti
    ? Array.isArray(selectedIndex)
      ? selectedIndex
      : []
    : [];

  const isRowActive = (index: number) =>
    isMulti ? selectedIndexes.includes(index) : index === selectedIndex;

  const getItemLabel = (item: DropdownItem | undefined): string =>
    typeof item === 'string' ? item : item?.name ?? '';

  const getItemKey = (item: DropdownItem, index: number): string =>
    `${typeof item === 'string' ? item : item.value ?? item.name}-${index}`;

  const renderSearch = () => {
    if (!isSearchable) return null;
    return (
      <CustomInput
        placeholder={placeholder}
        value={searchValue}
        setValue={handleSearch}
      />
    );
  };
  const selectedItem = list?.[selectedIndex as number];

  const triggerLabel = isMulti
    ? selectedIndexes.length
      ? selectedIndexes.map(i => getItemLabel(list?.[i])).join(', ')
      : placeholder
    : getItemLabel(selectedItem) || placeholder;

  const lightGreen = lightenHexColor(colors.Primary, 0.7);

  const ensurePanelVisible = () => {
    if (!parentScrollRef?.current || !wrapRef.current || !triggerRef.current)
      return;

    const parentNode = findNodeHandle(parentScrollRef.current);
    const selfNode = findNodeHandle(wrapRef.current);
    const triggerNode = findNodeHandle(triggerRef.current);
    if (!parentNode || !selfNode || !triggerNode) return;

    // measure the wrap relative to parent
    UIManager.measureLayout(
      selfNode,
      parentNode,
      () => {},
      (left, top, width, height) => {
        const {height: windowH} = Dimensions.get('window');

        if (openUp) {
          // measure trigger to find top edge within parent
          UIManager.measureLayout(
            triggerNode,
            parentNode,
            () => {},
            (tLeft, tTop, tWidth, tHeight) => {
              // top of trigger relative to parent = tTop
              // need to ensure the area above trigger (contentH + bottomPadding) is visible
              const requiredTop = tTop - (contentH + bottomPadding);
              const desiredY = Math.max(0, requiredTop);
              parentScrollRef.current?.scrollTo({y: desiredY, animated: true});
            },
          );
        } else {
          // opening downwards: ensure bottom (wrap top + wrap height + contentH + bottomPadding) visible
          const targetBottom = top + height + contentH + bottomPadding;
          const desiredY = Math.max(0, targetBottom - windowH);
          parentScrollRef.current?.scrollTo({y: desiredY, animated: true});
        }
      },
    );
  };

  const onTriggerLayout = (e: LayoutChangeEvent) => {
    setTriggerHeight(e.nativeEvent.layout.height || 0);
  };

  // computed styles for error state
  const triggerBorderColor = error
    ? colors.ToastColors.Error
    : borderColor ?? colors.BorderColor;
  const triggerBgColor = error ? colors.redLight : colors.Background;
  const triggerTextColor = error
    ? colors.ToastColors.Error
    : colors.Heading_Txt;

  return (
    <View ref={wrapRef} style={styles.wrap}>
      {/* When openUp === true we render panel first (absolute positioned above trigger) */}
      {openUp ? (
        <Animated.View
          style={[
            styles.panelAbsolute,
            {
              height: panelHeight,
              opacity: panelOpacity,
              borderColor: colors.Grey_2,
              bottom: triggerHeight + 2, // sit flush above trigger (slight overlap fix)
              borderTopWidth: 1, // top border visible
              ...listStyle,
            },
          ]}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.panelContent}>
            {displayList?.map((item, index) => {
              const isActive = isRowActive(index);
              return (
                <TouchableOpacity
                  key={getItemKey(item, index)}
                  activeOpacity={0.9}
                  onPress={() => handleSelect(index)}
                  style={[
                    styles.row,
                    isActive && {backgroundColor: lightGreen},
                    index === 0 && {
                      borderTopLeftRadius: normalized(10),
                      borderTopRightRadius: normalized(10),
                    },
                    index === displayList.length - 1 && {
                      borderBottomLeftRadius: normalized(10),
                      borderBottomRightRadius: normalized(10),
                    },
                  ]}>
                  <Text numberOfLines={1} style={styles.rowText}>
                    {getItemLabel(item)}
                  </Text>
                  {isActive ? (
                    <TickIcon
                      primary={
                        selector?.isDarkTheme ? colors.White : colors.Primary
                      }
                      width={20}
                      height={20}
                    />
                  ) : (
                    <View style={{width: 20, height: 20}} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      ) : null}

      {/* Trigger */}
      {!hideTrigger &&
        (isSearchable ? (
          <View ref={triggerRef} onLayout={onTriggerLayout}>
            {renderSearch()}
          </View>
        ) : (
          <TouchableOpacity
            ref={triggerRef}
            activeOpacity={0.9}
            onPress={toggle}
            onLayout={onTriggerLayout}
            style={[
              styles.trigger,
              {
                borderColor: triggerBorderColor,
                backgroundColor: triggerBgColor,
              },
            ]}>
            <Text
              numberOfLines={1}
              style={[styles.triggerText, {color: triggerTextColor}]}>
              {triggerLabel}
            </Text>

            <Animated.View style={{transform: [{rotate: caretRotate}]}}>
              <DropDownIcon primary={colors.Desc_Txt} width={18} height={18} />
            </Animated.View>
          </TouchableOpacity>
        ))}

      {/* When openUp === false we render panel below the trigger (default) */}
      {!openUp && displayList.length > 0 ? (
        <Animated.View
          style={[
            styles.panel,
            {
              height: panelHeight,
              opacity: panelOpacity,
              borderColor: colors.Desc_Txt,
              ...listStyle,
              marginTop: normalized(2),
            },
          ]}>
          <ScrollView
            nestedScrollEnabled={true}
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              list?.length == 1 ? {} : styles.panelContent
            }>
            {typeof heading === 'string' && heading ? (
              <Text
                style={{
                  color: colors.Primary,
                  margin: normalized(5),
                  fontWeight: '600',
                }}>
                {heading}
              </Text>
            ) : null}
            {displayList?.map((item, index) => {
              const isActive = isRowActive(index);
              const groupHeading = headingByOptionIndex.get(index);
              return (
                <React.Fragment key={getItemKey(item, index)}>
                  {groupHeading ? (
                    <Text
                      style={{
                        color: colors.Primary,
                        margin: normalized(5),
                        fontWeight: '600',
                      }}>
                      {groupHeading}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleSelect(index)}
                    style={[
                      styles.row,
                      isActive && {backgroundColor: lightGreen},
                      index === 0 && {
                        borderTopLeftRadius: normalized(10),
                        borderTopRightRadius: normalized(10),
                      },
                      index === displayList.length - 1 && {
                        borderBottomLeftRadius: normalized(10),
                        borderBottomRightRadius: normalized(10),
                      },
                    ]}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.rowText,
                        {
                          color: isActive ? colors.Primary : colors.Heading_Txt,
                        },
                      ]}>
                      {getItemLabel(item)}
                    </Text>
                    {isActive ? (
                      <TickIcon
                        primary={colors.Primary}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <View style={{width: 20, height: 20}} />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </ScrollView>
        </Animated.View>
      ) : null}
    </View>
  );
};

export default CustomDropDownList;

/* ===== Styles ===== */
const makeStyles = (colors: any) =>
  StyleSheet.create({
    wrap: {
      width: '100%',
      position: 'relative', // for absolute panel when opening up
    },
    trigger: {
      minHeight: normalized(44),
      paddingHorizontal: normalized(14),
      borderRadius: normalized(10),
      borderWidth: 1,
      backgroundColor: colors.Background,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    triggerText: {
      flex: 1,
      marginRight: normalized(10),
      color: colors.Heading,
      fontSize: normalized(14),
      fontFamily: AppFonts.InterRegular,
    },
    panel: {
      overflow: 'hidden',
      borderWidth: 1,
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
      marginTop: 1,
    },
    panelAbsolute: {
      position: 'absolute',
      left: 0,
      right: 0,
      overflow: 'hidden',
      borderWidth: 1,
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
    },
    panelContent: {
      // marginVertical: normalized(6),
    },
    row: {
      height: ITEM_H,
      paddingHorizontal: normalized(14),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowText: {
      fontSize: normalized(14),
      fontFamily: AppFonts.InterRegular,
      color: colors.Heading_Txt,
    },
  });

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import DoubleForwardArrow from '../Svg/DoubleForwardArrow';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import TickIcon from '../Svg/TickIcon';

type StepperProps = {
  list: any[]; // primitives or { id?, key?, label?, name?, isLastItem? }
  completedSteps?: any[];
  activeStep: any;
  skipNext?: any;
  skipPrev?: any;
  isRight?: boolean; // make row flow right→left and flip per-item layout
  isLastItem?: boolean; // if true, hide arrow for the visual last item
};

const H_PADDING = normalized(20);

const Stepper = ({
  list = [],
  completedSteps = [],
  activeStep,
  skipNext = false,
  skipPrev = false,
  isRight = false,
  isLastItem = false,
}: StepperProps) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  // IMPORTANT: do NOT reverse the data array.
  // We render the same list order but flip the ROW direction via 'row-reverse'

  const getId = (item: any) => {
    if (item === null || item === undefined) return String(item);
    if (typeof item === 'object') {
      return (
        item.id ??
        item.key ??
        String(item.label ?? item.name ?? JSON.stringify(item))
      );
    }
    return String(item);
  };

  const visualList = useMemo(() => {
    if (!skipNext && !skipPrev) return list;
    const activeIndex = list.findIndex(
      item => getId(item) === getId(activeStep),
    );
    if (activeIndex === -1) return list;
    return list.filter((_, idx) => {
      if (skipNext && idx === activeIndex + 1) return false;
      if (skipPrev && idx === activeIndex - 1) return false;
      return true;
    });
  }, [list, skipNext, skipPrev, activeStep]);

  // First/last in *visual* order depend on row direction.
  const firstVisualId = useMemo(() => {
    if (!visualList.length) return '';
    // first child in the array is visually RIGHT when row is 'row-reverse'
    return getId(visualList[0]);
  }, [visualList]);

  const lastVisualId = useMemo(() => {
    if (!visualList.length) return '';
    // last child in the array is visually LEFT when row is 'row-reverse'
    return getId(visualList[visualList.length - 1]);
  }, [visualList]);

  const [positions, setPositions] = useState<
    Record<string, {x: number; width: number}>
  >({});
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const animatedX = useRef(new Animated.Value(0)).current;

  const onItemLayout = useCallback((key: string, x: number, width: number) => {
    setPositions(prev => {
      const cur = prev[key];
      if (cur && cur.x === x && cur.width === width) return prev;
      return {...prev, [key]: {x, width}};
    });
  }, []);

  const contentWidth = useMemo(() => {
    const entries = Object.values(positions);
    if (!entries.length) return 0;
    return Math.max(...entries.map(p => p.x + p.width));
  }, [positions]);

  const isItemActive = (item: any) => getId(item) === getId(activeStep);
  const isItemCompleted = (item: any) =>
    Boolean(
      completedSteps && completedSteps.some(cs => getId(cs) === getId(item)),
    );

  const stepColor = (item: any): string =>
    isItemActive(item)
      ? colors.Primary
      : isItemCompleted(item)
      ? // ? selector?.isDarkTheme
        colors.Desc_Txt
      : // : colors.Ice_Blue
        // selector?.isDarkTheme
        // ?
        colors.Desc_Txt;
  // : colors.Black;

  useEffect(() => {
    if (!containerWidth || !contentWidth || !visualList?.length) return;

    const activeId = getId(activeStep);
    const pos = positions[activeId];
    if (!pos) return;

    const visibleWidth = Math.max(0, containerWidth - H_PADDING * 2);
    const maxOffset = Math.max(0, contentWidth - visibleWidth);

    let targetOffset: number;

    // Edge anchoring depends on visual order:
    // - In RTL (isRight), firstVisualId is RIGHT edge, lastVisualId is LEFT edge.
    // - In LTR, firstVisualId is LEFT edge, lastVisualId is RIGHT edge.
    const atFirst = activeId === firstVisualId;
    const atLast = activeId === lastVisualId;

    if (atFirst) {
      targetOffset = 0; // RIGHT edge for RTL, LEFT edge for LTR
    } else if (atLast) {
      targetOffset = isRight ? -containerWidth : maxOffset; // LEFT edge for RTL, RIGHT edge for LTR
    } else {
      // Center the active item for both LTR and RTL
      const centerX = pos.x + pos.width / 2;

      // Base centered offset (LTR math)
      let midOffset = centerX - visibleWidth / 2;

      // Clamp within scrollable range
      midOffset = Math.max(0, Math.min(midOffset, maxOffset));

      // In RTL (row-reverse), mirror the centered offset around maxOffset
      targetOffset = isRight ? maxOffset - midOffset : midOffset;
    }

    Animated.timing(animatedX, {
      toValue: -Math.round(targetOffset),
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [
    activeStep,
    containerWidth,
    contentWidth,
    positions,
    visualList,
    isRight,
    firstVisualId,
    lastVisualId,
    animatedX,
  ]);

  const renderStep = (item: any, index: number) => {
    const id = getId(item);
    const completed = isItemCompleted(item);
    const active = isItemActive(item);

    const itemMarkedLast = typeof item === 'object' && Boolean(item.isLastItem);
    // last visual item (furthest LEFT in RTL, furthest RIGHT in LTR)
    const isLastVisual =
      itemMarkedLast || id === lastVisualId || index === visualList.length - 1;

    // Hide arrow for the visual last item only if requested
    const hideArrow = isLastItem && isLastVisual;

    // preserve your language-based rule
    const showArrow =
      selector?.language == 'ar' ? (index === 0 ? false : true) : !hideArrow;

    const label =
      typeof item === 'object'
        ? item.label ?? item.name ?? String(item)
        : String(item);

    return (
      <View
        key={id + '_' + index}
        onLayout={(e: LayoutChangeEvent) => {
          const {x, width} = e.nativeEvent.layout;
          onItemLayout(id, x, width);
        }}
        style={[
          styles.stepperItem,
          {
            // keep per-item content flipped so icon/text order feels natural per side
            flexDirection: isRight ? 'row-reverse' : 'row',
            // spacing between items; no trailing gap after the visual last
            marginRight: isLastVisual ? 0 : normalized(20),
          },
        ]}>
        {completed ? (
          <View style={[styles.circle, {borderColor: colors.Primary}]}>
            <TickIcon width={12} height={14} primary={colors.Primary} />
          </View>
        ) : active ? (
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle} />
          </View>
        ) : (
          <View style={styles.circle} />
        )}

        <Text style={[styles.stepTxt, {color: stepColor(item)}]}>{label}</Text>

        {showArrow && (
          <View style={isRight ? {transform: [{scaleX: -1}]} : undefined}>
            <DoubleForwardArrow primary={stepColor(item)} />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.clipContainer}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
        <Animated.View
          style={[
            styles.innerRow,
            {
              transform: [{translateX: animatedX}],
              // KEY: flip the entire row direction in RTL mode
              flexDirection: isRight ? 'row-reverse' : 'row',
            },
          ]}>
          {visualList?.map(renderStep)}
        </Animated.View>
      </View>
    </View>
  );
};

export default Stepper;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: {
      marginVertical: normalized(20),
      paddingHorizontal: 0,
    },
    clipContainer: {
      overflow: 'hidden',
      paddingHorizontal: H_PADDING, // used in centering math above
    },
    innerRow: {
      alignItems: 'center',
    } as ViewStyle,
    stepperItem: {
      alignItems: 'center',
    },
    circle: {
      borderColor: colors.Ice_Blue,
      borderRadius: normalized(50),
      borderWidth: 1,
      width: normalized(20),
      height: normalized(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepTxt: {
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(14),
      marginLeft: normalized(8),
      marginRight: normalized(8),
    },
    outerCircle: {
      width: normalized(20),
      height: normalized(20),
      borderWidth: 1,
      borderRadius: normalized(20),
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: AppColors.White,
      backgroundColor: AppColors.White,
    },
    innerCircle: {
      width: normalized(18),
      height: normalized(18),
      borderWidth: normalized(5),
      borderRadius: normalized(20),
      borderColor: colors.Primary,
    },
  });

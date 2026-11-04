import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import {normalized, AppColors} from '../../Utils/AppConstants';
import {
  capitalizeEachWord,
  formatAmountToUSD,
  formatStatus,
  getStatusColor,
} from '../../Utils/Helper';
import AnimatedChevron from '../Svg/CollapseExpandAnimated';

interface CartItemAccordionProps {
  cartItem: any;
  isCartDamage?: boolean;
  colors: any;
  styles: any;
}

const ANIMATION_DURATION = 350; // change this to control speed

const CartItemAccordion: React.FC<CartItemAccordionProps> = ({
  cartItem,
  isCartDamage,
  colors,
  styles,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const hasMeasured = useRef(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  // Capture the natural height of the content once, off-screen, so we know
  // what value to animate *to* when expanding.
  const onContentLayout = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height;
    if (!hasMeasured.current && height > 0) {
      hasMeasured.current = true;
      setContentHeight(height);
    }
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);

    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: next ? contentHeight : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false, // height can't use native driver
      }),
      Animated.timing(animatedOpacity, {
        toValue: next ? 1 : 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const content = (
    <>
      <View style={{height: normalized(12)}} />
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Size</Text>
          <Text style={styles.valueTxt}>{cartItem?.size ?? 'N/A'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Status</Text>
          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: getStatusColor(cartItem?.cart?.status, colors),
                alignSelf: 'flex-start',
              },
            ]}>
            <Text style={styles.statusTxt}>
              {formatStatus(cartItem?.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{height: normalized(10)}} />
      <View style={styles.row}>
        {isCartDamage && (
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Claim Type</Text>
            <Text style={styles.valueTxt}>
              {capitalizeEachWord(
                String(cartItem?.claimType ?? 'N/A').replace(/([A-Z])/g, ' $1'),
              )}
            </Text>
          </View>
        )}
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Charge Amount</Text>
          <Text style={[styles.valueTxt, {color: AppColors.Error}]}>
            {formatAmountToUSD(cartItem?.chargeAmount)}
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleExpand}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={styles.nameTxt}>{cartItem?.serialNumber ?? 'N/A'}</Text>
        <AnimatedChevron expanded={expanded} duration={ANIMATION_DURATION} />
      </TouchableOpacity>

      {/* Hidden measuring copy — renders once off-screen to get natural height */}
      {!hasMeasured.current && (
        <View
          style={{
            position: 'absolute',
            opacity: 0,
            left: 0,
            right: 0,
            top: -9999,
          }}
          onLayout={onContentLayout}
          pointerEvents="none">
          {content}
        </View>
      )}

      {/* Visible animated copy */}
      <Animated.View
        style={{
          height: animatedHeight,
          opacity: animatedOpacity,
          overflow: 'hidden',
        }}>
        {content}
      </Animated.View>
    </View>
  );
};

export default CartItemAccordion;

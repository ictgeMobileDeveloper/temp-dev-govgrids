import { StyleSheet, Text, View, Animated } from 'react-native';
import React, { useMemo, useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { AppRootStore } from '../../Redux/AppStore';
import { AppFonts, normalized } from '../../Utils/AppConstants';
import { AppStyles } from '../../Utils/AppStyles';

/* ----------------------------- DIGIT COMPONENT ----------------------------- */
const Digit = ({ value, color, fontSize, fontFamily }: any) => {
    return (
        <View
            style={{
                height: normalized(36),
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <Text
                style={{
                    color,
                    fontSize,
                    fontFamily,
                    textAlign: 'center',
                    lineHeight: normalized(36),
                }}>
                {value}
            </Text>
        </View>
    );
};

/* ------------------------- ANIMATED TIME BLOCK ------------------------- */
const AnimatedTimeBlock = ({ label, value, styles }: any) => {
    const digits = value.split('');

    return (
        <View style={styles.single}>
            <View
                style={[
                    styles.txtCont,
                    { flexDirection: 'row', justifyContent: 'center', overflow: 'hidden' },
                ]}>
                {digits.map((digit: string, i: number) => (
                    <Digit
                        key={i}
                        value={digit}
                        color={styles.txt.color}
                        fontSize={styles.txt.fontSize}
                        fontFamily={styles.txt.fontFamily}
                    />
                ))}
            </View>
            <Text style={styles.timeTxt}>{label}</Text>
        </View>
    );
};

/* ----------------------------- CLOCK COMPONENT ----------------------------- */
const ClockBlock = ({ time }: any) => {
    const selector = useSelector((state: AppRootStore) => state.SliceReducer);
    const colors = selector?.themeColors;
    const styles = useMemo(() => ({ ...makeStyles(colors), ...AppStyles(colors) }), [colors]);

    const [remainingTime, setRemainingTime] = useState(moment.duration(0));

    // blinking colon animation
    const blinkAnim = useState(new Animated.Value(1))[0];
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blinkAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(blinkAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // countdown update logic
    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = moment();
            const diff = moment(time).diff(currentTime); // in ms
            if (diff <= 0) {
                setRemainingTime(moment.duration(0));
                clearInterval(interval);
            } else {
                setRemainingTime(moment.duration(diff));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [time]);

    // Extract hours, minutes, seconds with leading zeros
    const hours = String(remainingTime.hours()).padStart(2, '0');
    const minutes = String(remainingTime.minutes()).padStart(2, '0');
    const seconds = String(remainingTime.seconds()).padStart(2, '0');

    return (
        <View style={styles.box}>
            <AnimatedTimeBlock label="Hours" value={hours} styles={styles} />

            <Animated.View style={[styles.circleCont, { opacity: blinkAnim }]}>
                <View style={styles.circle} />
                <View style={styles.circle} />
            </Animated.View>

            <AnimatedTimeBlock label="Minutes" value={minutes} styles={styles} />

            <Animated.View style={[styles.circleCont, { opacity: blinkAnim }]}>
                <View style={styles.circle} />
                <View style={styles.circle} />
            </Animated.View>

            <AnimatedTimeBlock label="Seconds" value={seconds} styles={styles} />
        </View>
    );
};

export default ClockBlock;

/* ----------------------------- STYLES ----------------------------- */
const makeStyles = (colors: any) =>
    StyleSheet.create({
        box: {
            width: '100%',
            borderWidth: 1,
            borderColor: colors.BorderColor,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: normalized(12),
            borderRadius: normalized(12),
            marginTop: normalized(12),
            flexDirection: 'row',
            paddingHorizontal: normalized(50),
        },
        txt: {
            color: colors.Black,
            fontSize: normalized(20),
            fontFamily: AppFonts.UbuntuMedium,
        },
        txtCont: {
            width: normalized(42),
            height: normalized(36),
            backgroundColor: colors.Grey_3,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: normalized(8),
        },
        timeTxt: {
            fontSize: normalized(12),
            color: colors.Desc_Txt,
            fontFamily: AppFonts.UbuntuRegular,
        },
        single: {
            gap: normalized(8),
            alignItems: 'center',
            justifyContent: 'center',
        },
        circle: {
            width: normalized(5),
            height: normalized(5),
            borderRadius: normalized(10),
            backgroundColor: colors.Black,
        },
        circleCont: {
            gap: normalized(5),
        },
    });

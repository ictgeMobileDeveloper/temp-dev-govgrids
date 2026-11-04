import { Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

const CharCount: React.FC<{ count: number; max?: number; style?: any }> = ({ count, max, style }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const first = useRef(true);

    useEffect(() => {
        if (first.current) { first.current = false; return; } // don't bounce on first render
        Animated.sequence([
            Animated.timing(scale, { toValue: 1.12, duration: 90, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
        ]).start();
    }, [count]);

    return (
        <Animated.Text style={[style, { transform: [{ scale }] }]}>
            {`${count} / ${max ?? 0}`}
        </Animated.Text>
    );
};

export default CharCount;

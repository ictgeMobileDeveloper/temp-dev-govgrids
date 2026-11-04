
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { Routes } from '../Utils/Routes';
import CDRDocketScreen from '../UI/CDR/CDRDocketScreen';
import CDREvidenceScreen from '../UI/CDR/CDREvidenceScreen';
import CDRPersonalInfoScreen from '../UI/CDR/CDRPersonalInfoScreen';
import CDRForensicScreen from '../UI/CDR/CDRForensicScreen';
import CDRRecordDivisionScreen from '../UI/CDR/CDRRecordDivisionScreen';

const Stack = createStackNavigator();

const CDRStack = () => {
    return (
        <Stack.Navigator
            initialRouteName={Routes.CDR.PersonalInfoScreen}
            screenOptions={{
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}>
            <Stack.Screen
                name={Routes.CDR.DocketScreen}
                component={CDRDocketScreen}
            />
            <Stack.Screen
                name={Routes.CDR.EvidenceScreen}
                component={CDREvidenceScreen}
            />

            <Stack.Screen
                name={Routes.CDR.PersonalInfoScreen}
                component={CDRPersonalInfoScreen}
            />
            <Stack.Screen
                name={Routes.CDR.ForensicsScreen}
                component={CDRForensicScreen}
            />
            <Stack.Screen
                name={Routes.CDR.RecordDivisionScreen}
                component={CDRRecordDivisionScreen}
            />
        </Stack.Navigator>

    )
}

export default CDRStack

const styles = StyleSheet.create({})
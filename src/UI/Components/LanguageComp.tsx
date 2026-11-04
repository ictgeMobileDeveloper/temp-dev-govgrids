// LanguageComp.js
import React from 'react';
import { View, Image, Text } from 'react-native';
import PropTypes from 'prop-types';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';

const LANG_OPTIONS = [
    { key: 'en', label: 'English', flagKey: 'uk' },
    { key: 'es', label: 'Espanol', flagKey: 'espanol' },
    { key: 'ar', label: 'Arabic', flagKey: 'arabic' },
    { key: 'it', label: 'Italian', flagKey: 'italy' },
    { key: 'pl', label: 'Polish', flagKey: 'polish' },
];

const LanguageComp = ({ selectedLanguage, onChangeLanguage, AppImages, styles }: any) => {
    const getFlag = (lang: any) => {
        const mapping: any = {
            en: AppImages?.flags?.uk,
            es: AppImages?.flags?.espanol,
            ar: AppImages?.flags?.arabic,
            it: AppImages?.flags?.italy,
            pl: AppImages?.flags?.polish,
        };
        return mapping[lang] ?? AppImages?.flags?.uk;
    };

    return (
        <Menu>
            <MenuTrigger>
                <View style={styles.rightCont}>
                    <Image source={getFlag(selectedLanguage)} style={styles.menuIcon} />
                </View>
            </MenuTrigger>

            <MenuOptions optionsContainerStyle={styles.menuStyle}>
                {LANG_OPTIONS.map((opt, idx) => (
                    <React.Fragment key={opt.key}>
                        <MenuOption onSelect={() => onChangeLanguage(opt.key)}>
                            <View style={styles.rightCont}>
                                <Image source={AppImages.flags[opt.flagKey]} style={styles.menuIcontwo} />
                                <Text style={styles.menuTxt}>{opt.label}</Text>
                            </View>
                        </MenuOption>

                        {/* divider except after last item */}
                        {idx < LANG_OPTIONS.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                ))}
            </MenuOptions>
        </Menu>
    );
};

LanguageComp.propTypes = {
    selectedLanguage: PropTypes.string.isRequired,
    onChangeLanguage: PropTypes.func.isRequired,
    AppImages: PropTypes.object.isRequired,
    styles: PropTypes.object.isRequired,
};

export default LanguageComp;

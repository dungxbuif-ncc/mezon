import { Attributes, baseColor, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes, isTabletLandscape?: boolean) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            position: 'absolute',
            height: '100%',
            width: '100%',
        },
        errorTitle: {
            color: colors.text,
            fontSize: size.s_20,
            fontWeight: 'bold',
            textAlign: 'center',
            margin: size.s_10,
            marginHorizontal: size.s_20
        },
        errorDescription: {
            color: colors.text,
            fontSize: size.s_16,
            textAlign: 'center',
            marginHorizontal: size.s_20
        },
        errorType: {
            color: colors.textDisabled,
            fontSize: size.small,
            textAlign: 'center',
            marginHorizontal: size.s_20
        },
        refreshButton: {
            marginTop: size.s_30,
            marginBottom: size.s_16,
            backgroundColor: baseColor.blurple,
            paddingVertical: size.s_10,
            paddingHorizontal: size.s_20,
            borderRadius: size.s_20,
            width: '90%',
            height: size.s_40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        refreshButtonText: {
            color: baseColor.white,
            fontSize: size.s_14,
        },
        goBackButton: {
            marginBottom: size.s_60,
            paddingVertical: size.s_10,
            paddingHorizontal: size.s_20,
            borderRadius: size.s_20,
            width: '90%',
            padding: size.s_8,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: 'row',
            gap: size.s_10
        },
        goBackButtonText: {
            color: colors.text,
            fontSize: size.s_14,
        }
    });

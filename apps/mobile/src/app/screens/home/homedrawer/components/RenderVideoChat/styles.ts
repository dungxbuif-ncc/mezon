/* eslint-disable prettier/prettier */
/* eslint-disable @nx/enforce-module-boundaries */
import { size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (isUploading: boolean, imageWidth: number, imageHeight: number) =>
    StyleSheet.create({
        container: {
            marginTop: size.s_10,
            marginBottom: size.s_6,
            opacity: isUploading ? 0.5 : 1,
            width: imageWidth,
            height: imageHeight
        },

        videoContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            overflow: 'hidden',
            borderRadius: size.s_4
        },

        video: {
            width: '100%',
            height: '100%',
            borderRadius: size.s_4,
            backgroundColor: '#5a5b5c30'
        },

        iconPlayVideo: {
            position: 'absolute',
            alignSelf: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: size.s_60,
            width: size.s_60,
            height: size.s_60,
            justifyContent: 'center',
            alignItems: 'center'
        },

        iconFlagVideo: {
            position: 'absolute',
            top: size.s_8,
            right: size.s_8,
            borderRadius: size.s_12,
            padding: size.s_4
        },

        skeleton: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#5a5b5c30'
        }
    });

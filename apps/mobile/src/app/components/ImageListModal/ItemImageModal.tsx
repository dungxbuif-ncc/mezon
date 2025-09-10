import { sleep } from '@mezon/utils';
import { ApiMessageAttachment } from 'mezon-js/api.gen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { RenderItemInfo } from 'react-native-awesome-gallery';
import FastImage from 'react-native-fast-image';

export const ItemImageModal = React.memo(
	({ item, setImageDimensions }: RenderItemInfo<ApiMessageAttachment>) => {
		const [dims, setDims] = useState(Dimensions.get('window'));
		const [ready, setReady] = useState(true);
		const [isLoading, setIsLoading] = useState(false);
		useEffect(() => {
			const sub = Dimensions.addEventListener('change', async ({ window }) => {
				setReady(false);
				setDims(window);
				await sleep(100);
				setReady(true);
			});
			return () => sub.remove();
		}, []);

		if (!ready) {
			return <View />;
		}
		return (
			<View>
				<FastImage
					source={{ uri: item?.url }}
					style={(StyleSheet.absoluteFillObject, { width: dims.width, height: dims.height })}
					resizeMode="contain"
					onLoadEnd={() => {
						setIsLoading(true);
					}}
					onLoad={(event) => {
						const { width = dims.width, height = dims.height } = event.nativeEvent;
						const widthResult = width < dims.width ? width : dims.width;
						const heightResult = height < dims.height ? height : dims.height;
						setImageDimensions({ width: widthResult, height: heightResult });
					}}
				/>
				{!isLoading && (
					<View
						style={{
							backgroundColor: 'rgba(0,0,0,0.5)',
							position: 'absolute',
							top: 0,
							width: '100%',
							height: '100%',
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<ActivityIndicator color={'white'} size={'large'} />
					</View>
				)}
			</View>
		);
	},
	(prev, next) => prev.item?.url === next.item?.url
);

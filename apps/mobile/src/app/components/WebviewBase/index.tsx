import { appActions, useAppDispatch } from '@mezon/store-mobile';
import { useRef, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import WebView from 'react-native-webview';
import { WebViewErrorEvent, WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';
import ErrorPage from './ErrorPage';

interface webviewBaseComponentProps {
	url: string;
	javaScriptEnabled?: boolean;
	injectedJavaScript?: string;
	injectedJavaScriptBeforeContentLoaded?: string;
	incognito?: boolean;
	customErrorMessage?: string;
	domStorageEnabled?: boolean;
	nestedScrollEnabled?: boolean;
	setSupportMultipleWindows?: boolean;
	iosTimeoutInMilliseconds?: number;
	androidTimeoutInMilliseconds?: number;
    startInLoadingState?: boolean;
	style?: StyleProp<ViewStyle>;
	onMessage?: (event: WebViewMessageEvent) => void;
	onLoadEnd?: () => void;
	onLoadStart?: () => void;
	onError?: (error: WebViewErrorEvent) => void;
	onGoBack?: () => void;
    onRefresh?: () => void
    onShouldStartLoadWithRequest?: (state: any) => boolean
}

const WebviewBase = (props: webviewBaseComponentProps) => {
	const {
		url,
		javaScriptEnabled,
		injectedJavaScript,
		injectedJavaScriptBeforeContentLoaded,
		incognito,
		customErrorMessage,
		domStorageEnabled,
		nestedScrollEnabled,
		setSupportMultipleWindows,
		iosTimeoutInMilliseconds,
		androidTimeoutInMilliseconds,
        startInLoadingState,
		style,
		onMessage,
		onLoadEnd,
		onLoadStart,
		onError,
		onGoBack,
        onRefresh,
        onShouldStartLoadWithRequest
	} = props;
	const [error, setError] = useState(null);
	const webviewRef = useRef<WebView>(null);
	const dispatch = useAppDispatch();

	const handleError = (error: WebViewErrorEvent) => {
		dispatch(appActions.setLoadingMainMobile(false));
		setError({ code: error?.nativeEvent?.code, description: error?.nativeEvent?.description });
		onError && onError(error);
	};

	const handleRefresh = () => {
		dispatch(appActions.setLoadingMainMobile(true));
        onRefresh && onRefresh();
		webviewRef?.current?.reload();
	};

	const handleLoadEnd = () => {
		dispatch(appActions.setLoadingMainMobile(false));
		setError(null);
		onLoadEnd && onLoadEnd();
	};

	return (
		<View style={{ flex: 1 }}>
			{error && <ErrorPage error={error} onRefresh={handleRefresh} customErrorMessage={customErrorMessage} onGoBack={onGoBack} />}
			<WebView
				ref={webviewRef}
				source={{ uri: url }}
				javaScriptEnabled={javaScriptEnabled}
				injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
				injectedJavaScript={injectedJavaScript}
				setSupportMultipleWindows={setSupportMultipleWindows}
				incognito={incognito}
				domStorageEnabled={domStorageEnabled}
				nestedScrollEnabled={nestedScrollEnabled}
                startInLoadingState={startInLoadingState}
				style={style}
				onMessage={onMessage}
				onLoadEnd={onLoadEnd}
				onLoadStart={onLoadStart}
				onError={handleError}
				onLoad={handleLoadEnd}
                onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
				iosTimeoutInMilliseconds={iosTimeoutInMilliseconds}
				androidTimeoutInMilliseconds={androidTimeoutInMilliseconds}
			/>
		</View>
	);
};

export default WebviewBase;

// In-app browsers (Telegram, Instagram, Facebook) draw their own toolbar on
// top of the page. It is not part of the viewport and env(safe-area-inset-*)
// stays 0 there, so anything sitting at the bottom edge — "Далі", the splash
// button — ends up under the toolbar and cannot be tapped.
//
// The page cannot measure that toolbar, so we detect the browser instead and
// reserve a fixed strip through --chrome-bottom, which styles.css folds into
// --safe-bottom.

const IN_APP_UA = /Telegram|Instagram|FBAN|FBAV|FB_IAB|Line\/|MicroMessenger|OKApp|VKAndroidApp/i;

/** Telegram's in-app webview exposes this bridge on both iOS and Android. */
const hasTelegramBridge = () => 'TelegramWebviewProxy' in window || Boolean(window.Telegram?.WebView?.initParams);

export function markInAppBrowser() {
	if (!hasTelegramBridge() && !IN_APP_UA.test(navigator.userAgent)) return;
	document.documentElement.classList.add('in-app-browser');
}

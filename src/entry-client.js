import App from './App.svelte';
const initialPostData = window.__INITIAL_POST_DATA__;
new App({
	target: document.getElementById('app'),
	hydrate: true,
	props: {
		initialPostData
	}
})
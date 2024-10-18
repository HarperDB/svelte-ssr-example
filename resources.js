import fs from 'node:fs';
import path from 'node:path';

if (!(await tables.Post.get("0"))) {
	await tables.Post.put({
		id: "0",
		title: "Hello, World!",
		body: "This is a test post. Please leave a comment! 📝",
		comments: []
	});
}

const htmlPath = path.join(import.meta.dirname, 'dist/client/index.html');
const templateHTML = fs.readFileSync(htmlPath, 'utf-8');
const ssrManifestPath = path.join(import.meta.dirname, 'dist/client/.vite/ssr-manifest.json');
const ssrManifest = fs.readFileSync(ssrManifestPath, 'utf-8');

async function renderPost(post) {
	const render = (await import('./dist/server/entry-server.js')).render;

	const rendered = render({ initialPostData: post }, ssrManifest);

	const html = templateHTML
		.replace(`<!--app-head-->`, rendered.head ?? '')
		.replace(`<!--app-html-->`, rendered.html ?? '')
		.replace(`<!--app-data-->`, `<script>window.__INITIAL_POST_DATA__ = ${JSON.stringify(post)};</script>`);

	return html;
}

export class UncachedBlog extends tables.Post {
	async get() {
		return {
			status: 200,
			headers: { 'Content-Type': 'text/html' },
			body: await renderPost(this)
		}
	}
}

class PageBuilder extends tables.Post {
	async get() {
		return {
			content: await renderPost(this)
		}
	}
}

tables.BlogCache.sourcedFrom(PageBuilder);

export class CachedBlog extends tables.BlogCache {
	async get() {
		return {
			contentType: 'text/html',
			data: this.content
		}
	}
}
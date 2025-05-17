'use strict';

const allowedDomains = [
	'booru.anthro.foo',
	'anthro.foo',
	'voca.ro',
	'xcancel.com',
	'x.com',
	'twitter.com',
	'youtube.com',
	'youtu.be',
	'catbox.moe',
	'archiveofourown.org',
	'archive.ph',
	'archive.org',
	'web.archive.org',
	'pixiv.net',
	'e621.net',
	'e926.net',
	'furbooru.org',
	'furaffinity.net',
	'4chan.org',
	'boards.4chan.org',
];
const urlRegex = /https?:\/\/[^\s"']+/gi;

module.exports = (string) => {
	const allowedSet = new Set(allowedDomains.map(d => d.toLowerCase()));

	return string.replace(urlRegex, (url) => {
		try {
			const domain = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
			return allowedSet.has(domain) ? url : '%%LINK REDACTED%%';
		} catch (e) {
			return '';
		}
	});
};
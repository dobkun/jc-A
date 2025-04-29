'use strict';

const { TrustedIps, Accounts } = require(__dirname + '/../../db/')
	, roleManager = require(__dirname + '/../../lib/permission/rolemanager.js');

module.exports = async (req, res) => {
	const { __ } = res.locals;

	const posts = res.locals.posts;
	const accounts = new Set();

	for (let i = 0; i < posts.length; i++) {
		const post = posts[i];
		if (post.account) {
			accounts.add(post.account);
		}
		await TrustedIps.remove(post.ip);
	}

	if (accounts.size > 0) {
		await Accounts.setAccountPermissionsMany([...accounts], roleManager.roles.ANON, roleManager.roles.TRUSTED);
	}

	return {
		message: __('Untrusted users'),
	};
};

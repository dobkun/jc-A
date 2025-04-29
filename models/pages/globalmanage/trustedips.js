'use strict';

const { TrustedIps } = require(__dirname + '/../../../db/')
	, { Permissions } = require(__dirname + '/../../../lib/permission/permissions.js');

module.exports = async (req, res, next) => {
	let trustedips;
	try {
		trustedips = await TrustedIps.getAll();
	} catch (err) {
		return next(err);
	}

	res
		//	.set('Cache-Control', 'private, max-age=1')
		.render('globalmanagetrustedips', {
			csrf: req.csrfToken(),
			trustedips: trustedips,
			viewRawIp: res.locals.permissions.get(Permissions.VIEW_RAW_IP),
		});
};
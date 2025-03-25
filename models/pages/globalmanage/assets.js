'use strict';

const { Assets } = require(__dirname+'/../../../db/index.js');

module.exports = async (req, res, next) => {
	
	let banners;
	let flags;
	let notfoundimages;
	try {
		banners = await Assets.getBanners();
		flags = await Assets.getFlags();
		notfoundimages = await Assets.getNotFoundImages();
	} catch (err) {
		return next(err);
	}
	
	res
		.set('Cache-Control', 'private, max-age=1')
		.render('globalmanageassets', {
			csrf: req.csrfToken(),
			banners: banners,
			flags: flags,
			notfoundimages: notfoundimages,
		});

};

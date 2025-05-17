'use strict';

const Assets = require(__dirname + '/../../db/assets.js');

module.exports = async (req, res, next) => {
	let logo;
	try {
		logo = await Assets.randomLogo();
	} catch (err) {
		return next(err);
	}

	if (!logo) {
		//non existing boards will show default banner, but it doesnt really matter.
		return res.redirect('/file/desulogo.png');
	}

	return res.redirect(`/logo/${logo}`);

};
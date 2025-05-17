'use strict';

const { buildLogos } = require(__dirname + '/../../lib/build/tasks.js')
	, { Assets } = require(__dirname + '/../../db/index.js');

module.exports = async (req, res, next) => {

	let html, json;
	try {
		const logos = await Assets.getLogos();
		({ html, json } = await buildLogos({ 'logos': logos }));
	} catch (err) {
		return next(err);
	}

	if (req.path.endsWith('.json')) {
		return res.set('Cache-Control', 'public, max-age=60').json(json);
	} else {
		return res.set('Cache-Control', 'public, max-age=60').send(html);
	}

};
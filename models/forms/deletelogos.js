
'use strict';

const { remove } = require('fs-extra')
	, dynamicResponse = require(__dirname + '/../../lib/misc/dynamic.js')
	, uploadDirectory = require(__dirname + '/../../lib/file/uploaddirectory.js')
	, { Assets } = require(__dirname + '/../../db/')
	, buildQueue = require(__dirname + '/../../lib/build/queue.js');

module.exports = async (req, res) => {

	const { __ } = res.locals;
	const redirect = '/globalmanage/assets.html';

	//delete file of all selected logos
	await Promise.all(req.body.checkedlogos.map(filename => {
		remove(`${uploadDirectory}/logo/${filename}`);
	}));

	//remove from db
	await Assets.removeLogos(req.body.checkedlogos);
	// get new logos and recache
	// const banners = await Assets.getBanners();

	//rebuild public banners page
	/* 	buildQueue.push({
			'task': 'buildBanners',
			'options': {
				'banners': banners,
			}
		}); */

	return dynamicResponse(req, res, 200, 'message', {
		'title': __('Success'),
		'message': __('Deleted %s logos', req.body.checkedlogos.length),
		'redirect': redirect
	});
};

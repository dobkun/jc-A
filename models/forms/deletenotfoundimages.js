'use strict';

const { remove } = require('fs-extra')
	, dynamicResponse = require(__dirname+'/../../lib/misc/dynamic.js')
	, uploadDirectory = require(__dirname+'/../../lib/file/uploaddirectory.js')
	, { Assets } = require(__dirname+'/../../db/');

module.exports = async (req, res) => {

	const { __ } = res.locals;
	const redirect = '/globalmanage/assets.html';

	//delete file of all selected banners
	await Promise.all(req.body.checkednotfoundimages.map(filename => {
		remove(`${uploadDirectory}/notfoundimage/${filename}`);
	}));

	//remove from db
	await Assets.removeNotFoundImages(req.body.checkednotfoundimages);

	return dynamicResponse(req, res, 200, 'message', {
		'title': __('Success'),
		'message': __('Deleted %s not found images', req.body.checkednotfoundimages.length),
		'redirect': redirect
	});
};
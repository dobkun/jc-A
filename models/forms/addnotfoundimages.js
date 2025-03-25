'use strict';

const { remove, pathExists } = require('fs-extra')
	, config = require(__dirname+'/../../lib/misc/config.js')
	, uploadDirectory = require(__dirname+'/../../lib/file/uploaddirectory.js')
	, moveUpload = require(__dirname+'/../../lib/file/moveupload.js')
	, mimeTypes = require(__dirname+'/../../lib/file/mimetypes.js')
	, getDimensions = require(__dirname+'/../../lib/file/image/getdimensions.js')
	, deleteTempFiles = require(__dirname+'/../../lib/file/deletetempfiles.js')
	, dynamicResponse = require(__dirname+'/../../lib/misc/dynamic.js')
	, { Assets } = require(__dirname+'/../../db/');

module.exports = async (req, res) => {

	const { __, __n } = res.locals;
	const { checkRealMimeTypes } = config.get;
	const redirect = '/globalmanage/assets.html';

	for (let i = 0; i < res.locals.numFiles; i++) {
		if (!mimeTypes.allowed(req.files.file[i].mimetype, {
			// Ban images can be static image or animated (gif, apng, etc)
			image: true,
			animatedImage: true,
			video: false,
			audio: false,
			other: false
		})) {
			await deleteTempFiles(req).catch(console.error);
			return dynamicResponse(req, res, 400, 'message', {
				'title': __('Bad request'),
				'message': __('Invalid file type for %s. Mimetype %s not allowed.', req.files.file[i].name, req.files.file[i].mimetype),
				'redirect': redirect
			});
		}

		// check for any mismatching supposed mimetypes from the actual file mimetype
		if (checkRealMimeTypes) {
			if (!(await mimeTypes.realMimeCheck(req.files.file[i]))) {
				deleteTempFiles(req).catch(console.error);
				return dynamicResponse(req, res, 400, 'message', {
					'title': __('Bad request'),
					'message': __('Mime type mismatch for file "%s"', req.files.file[i].name),
					'redirect': redirect
				});
			}
		}

		//800x600 check
		const imageDimensions = await getDimensions(req.files.file[i].tempFilePath, null, true);
		let geometry = imageDimensions;
		if (Array.isArray(geometry)) {
			geometry = geometry[0];
		}
		if (geometry.width != 800 || geometry.height != 600) {
			await deleteTempFiles(req).catch(console.error);
			return dynamicResponse(req, res, 400, 'message', {
				'title': __('Bad request'),
				'message': __('Invalid file "%s". Dimensions are %sx%s', req.files.file[i].name, 800, 600),
				'redirect': redirect
			});
		}
	}

	const filenames = [];
	for (let i = 0; i < res.locals.numFiles; i++) {
		const file = req.files.file[i];
		file.filename = file.sha256 + file.extension;

		//check if already exists
		const exists = await pathExists(`${uploadDirectory}/notfoundimage/${file.filename}`);

		if (exists) {
			await remove(file.tempFilePath);
			continue;
		}

		//add to list after checking it doesnt already exist
		filenames.push(file.filename);

		//then upload it
		await moveUpload(file, file.filename, 'notfoundimage/');

		//and delete the temp file
		await remove(file.tempFilePath);

	}

	deleteTempFiles(req).catch(console.error);

	// no new not found images
	if (filenames.length === 0) {
		return dynamicResponse(req, res, 400, 'message', {
			'title': __('Bad request'),
			'message': __n('Not found image already exist', res.locals.numFiles),
			'redirect': redirect
		});
	}

	// add not found images to the db
	await Assets.addNotFoundImages(filenames);

	return dynamicResponse(req, res, 200, 'message', {
		'title': __('Success'),
		'message': __n('Uploaded %s new Not Found Images.', filenames.length),
		'redirect': redirect
	});

};
'use strict';

const { remove, pathExists } = require('fs-extra')
	, config = require(__dirname + '/../../lib/misc/config.js')
	, uploadDirectory = require(__dirname + '/../../lib/file/uploaddirectory.js')
	, moveUpload = require(__dirname + '/../../lib/file/moveupload.js')
	, mimeTypes = require(__dirname + '/../../lib/file/mimetypes.js')
	, getDimensions = require(__dirname + '/../../lib/file/image/getdimensions.js')
	, deleteTempFiles = require(__dirname + '/../../lib/file/deletetempfiles.js')
	, dynamicResponse = require(__dirname + '/../../lib/misc/dynamic.js')
	, { Assets } = require(__dirname + '/../../db/')
	, buildQueue = require(__dirname + '/../../lib/build/queue.js');

module.exports = async (req, res) => {

	const { __, __n } = res.locals;
	const { checkRealMimeTypes } = config.get;
	const redirect = '/globalmanage/assets.html';

	for (let i = 0; i < res.locals.numFiles; i++) {
		if (!mimeTypes.allowed(req.files.file[i].mimetype, {
			//logos can be static image or animated (gif, apng, etc)
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

		//256x256 check
		const imageDimensions = await getDimensions(req.files.file[i].tempFilePath, null, true);
		let geometry = imageDimensions;
		if (Array.isArray(geometry)) {
			geometry = geometry[0];
		}
		if (geometry.width > 256 || geometry.height > 256) {
			await deleteTempFiles(req).catch(console.error);
			return dynamicResponse(req, res, 400, 'message', {
				'title': __('Bad request'),
				'message': __('Invalid file "%s". Max logo dimensions are %sx%s', req.files.file[i].name, 256, 256),
				'redirect': redirect
			});
		}
	}

	const filenames = [];
	for (let i = 0; i < res.locals.numFiles; i++) {
		const file = req.files.file[i];
		file.filename = file.sha256 + file.extension;

		//check if already exists
		const exists = await pathExists(`${uploadDirectory}/logo/${file.filename}`);

		if (exists) {
			await remove(file.tempFilePath);
			continue;
		}

		//add to list after checking it doesnt already exist
		filenames.push(file.filename);

		//then upload it
		await moveUpload(file, file.filename, 'logo/');

		//and delete the temp file
		await remove(file.tempFilePath);

	}

	deleteTempFiles(req).catch(console.error);

	// no new banners
	if (filenames.length === 0) {
		return dynamicResponse(req, res, 400, 'message', {
			'title': __('Bad request'),
			'message': __n('Logo already exist', res.locals.numFiles),
			'redirect': redirect
		});
	}

	// add logos to the db
	await Assets.addLogos(filenames);
	// get new logos and recache
	const logos = await Assets.getLogos();

	if (filenames.length > 0) {
		//add public banners page to build queue
		buildQueue.push({
			'task': 'buildLogos',
			'options': {
				'logos': logos,
			}
		});
	}

	return dynamicResponse(req, res, 200, 'message', {
		'title': __('Success'),
		'message': __n('Uploaded %s new logos.', filenames.length),
		'redirect': redirect
	});

};

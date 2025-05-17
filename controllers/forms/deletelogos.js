'use strict';

const deleteLogos = require(__dirname + '/../../models/forms/deletelogos.js')
	, dynamicResponse = require(__dirname + '/../../lib/misc/dynamic.js')
	, paramConverter = require(__dirname + '/../../lib/middleware/input/paramconverter.js')
	, { checkSchema, lengthBody } = require(__dirname + '/../../lib/input/schema.js');

module.exports = {

	paramConverter: paramConverter({
		allowedArrays: ['checkedlogos']
	}),

	controller: async (req, res, next) => {

		const { __ } = res.locals;

		const errors = await checkSchema([
			{ result: lengthBody(req.body.checkedlogos, 1), expected: false, error: __('Must select at least one logo to delete') },
		]);

		if (errors.length > 0) {
			return dynamicResponse(req, res, 400, 'message', {
				'title': __('Bad request'),
				'errors': errors,
				'redirect': '/globalmanage/assets.html'
			});
		}

		try {
			await deleteLogos(req, res, next);
		} catch (err) {
			console.error(err);
			return next(err);
		}

	}

};

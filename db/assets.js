
'use strict';

const Mongo = require(__dirname + '/db.js')
	, cache = require(__dirname + '/../lib/redis/redis.js')
	, db = Mongo.db.collection('assets');

module.exports = {
	db,

	addToArray: (key, list) => {
		return db.updateOne(
			{
				'_id': 'assets'
			},
			{
				'$push': {
					[key]: {
						'$each': list
					}
				}
			},
			{
				upsert: true
			}
		);

	},

	removeFromArray: (key, list) => {
		return db.updateOne(
			{
				'_id': 'assets',
			},
			{
				'$pullAll': {
					[key]: list
				}
			}
		);
	},

	getLogos: async () => {
		let logos = await cache.sgetall('logos');
		if (logos.length === 0) {
			let assets = await db.findOne(
				{ _id: 'assets' },
				{ logos: 1, _id: 0 }
			);

			if (assets && assets.logos && assets.logos.length > 0) {
				cache.sadd('logos', assets.logos);
				logos = assets.logos;
			}
		}

		return logos;
	},

	randomLogo: async () => {
		let logo = await cache.srand('logos');
		if (!logo) {
			const logos = await module.exports.getLogos();
			if (logos.length > 0) {
				logo = logos[Math.floor(Math.random() * logos.length)];
			}
		}
		return logo;
	},

	addLogos: (filenames) => {
		cache.del('logos');
		return module.exports.addToArray('logos', filenames);
	},

	removeLogos: (filenames) => {
		cache.del('logos');
		return module.exports.removeFromArray('logos', filenames);
	},

	getBanners: async () => {
		let banners = await cache.sgetall('banners');
		if (banners.length === 0) {
			let assets = await db.findOne(
				{ _id: 'assets' },
				{ banners: 1, _id: 0 }
			);

			if (assets && assets.banners && assets.banners.length > 0) {
				cache.sadd('banners', assets.banners);
				banners = assets.banners;
			}
		}

		return banners;
	},

	randomBanner: async () => {
		let banner = await cache.srand('banners');
		if (!banner) {
			const banners = await module.exports.getBanners();
			if (banners.length > 0) {
				banner = banners[Math.floor(Math.random() * banners.length)];
			}
		}
		return banner;
	},

	addBanners: (filenames) => {
		cache.del('banners');
		return module.exports.addToArray('banners', filenames);
	},

	removeBanners: (filenames) => {
		cache.del('banners');
		return module.exports.removeFromArray('banners', filenames);
	},

	getFlags: async () => {
		let flags = await cache.sgetall('flags');
		if (flags.length === 0) {
			let assets = await db.findOne(
				{ _id: 'assets' },
				{ flags: 1, _id: 0 }
			);

			if (assets && assets.flags && assets.flags.length > 0) {
				cache.sadd('flags', assets.flags);
				flags = assets.flags;
			}
		}

		return flags;
	},

	addFlags: (files) => {
		cache.del('flags');
		return module.exports.addToArray('flags', files);
	},

	removeFlags: (files) => {
		cache.del('flags');
		return module.exports.removeFromArray('flags', files);
	},

	getBoardAds: async () => {
		let boardads = await cache.sgetall('boardads');
		if (boardads.length === 0) {
			let assets = await db.findOne(
				{ _id: 'assets' },
				{ boardads: 1, _id: 0 }
			);

			if (assets && assets.boardads && assets.boardads.length > 0) {
				cache.sadd('boardads', assets.boardads);
				boardads = assets.boardads;
			}
		}

		return boardads;
	},

	randomBoardAd: async () => {
		let boardad = await cache.srand('boardads');
		if (!boardad) {
			const boardads = await module.exports.getBoardAds();
			if (boardads.length > 0) {
				boardad = boardads[Math.floor(Math.random() * boardads.length)];
			}
		}
		return boardad;
	},

	addBoardAds: (filenames) => {
		cache.del('boardads');
		return module.exports.addToArray('boardads', filenames);
	},

	removeBoardAds: (filenames) => {
		cache.del('boardads');
		return module.exports.removeFromArray('boardads', filenames);
	},
};

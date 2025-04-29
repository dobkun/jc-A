'use strict';

const Mongo = require(__dirname + '/db.js');
const db = Mongo.db.collection('trustedips');

module.exports = {
	db,
	insert: async (ip) => {
		await db.updateOne(
			{ ip },
			{ $setOnInsert: { ip } },
			{ upsert: true }
		);
	},
	remove: async (ip) => {
		await db.deleteOne({ 'ip.raw': ip.raw });
	},
	exists: async (ip) => {
		const count = await db.countDocuments({ 'ip.raw': ip.raw }, { limit: 1 });
		return count > 0;
	},
};
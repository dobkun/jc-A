'use strict';

const { Permissions } = require(__dirname+'/../lib/permission/permissions.js')
	, Permission = require(__dirname+'/../lib/permission/permission.js')
	, fs = require('fs-extra')
	, uploadDirectory = require(__dirname+'/../lib/file/uploaddirectory.js')
	, { Binary } = require('mongodb');

module.exports = async(db, redis) => {

	console.log('Creating new roles');
	const ANON = new Permission();
	ANON.setAll([
		Permissions.CREATE_ACCOUNT,
		Permissions.USE_MARKDOWN_GENERAL,
	]);

	const TRUSTED = new Permission(ANON.base64);
	TRUSTED.setAll([
		Permissions.BYPASS_CAPTCHA,
		Permissions.BYPASS_FILTERS,
		Permissions.BYPASS_FILE_APPROVAL,
	]);

	const APPROVER = new Permission(TRUSTED.base64);
	APPROVER.setAll([
		Permissions.VIEW_MANAGE,

		Permissions.BYPASS_BANS,

		Permissions.MANAGE_FILE_APPROVAL,		
	]);
	
	const MOD = new Permission(APPROVER.base64);
	MOD.setAll([
		Permissions.MANAGE_GENERAL,
		Permissions.MANAGE_BANS,
		Permissions.MANAGE_LOGS,
		Permissions.MANAGE_TRUSTED,
	]);
	
	const MANAGER = new Permission(MOD.base64);
	MANAGER.setAll([
		Permissions.MANAGE_BOARD_SETTINGS,
		Permissions.MANAGE_ASSETS,
	]);	

	const ROOT = new Permission();
	ROOT.setAll(Permission.allPermissions);

	console.log('Clearing existing roles');
	await db.collection('roles').deleteMany({});

	console.log('Adding Anon, Trusted User, Approver, Mod, Root roles');
	await db.collection('roles').insertMany([
		{ name: 'ANON', permissions: Binary(ANON.array) },
		{ name: 'TRUSTED', permissions: Binary(TRUSTED.array) },
		{ name: 'APPROVER', permissions: Binary(APPROVER.array) },
		{ name: 'MOD', permissions: Binary(MOD.array) },
		{ name: 'MANAGER', permissions: Binary(MANAGER.array) },
		{ name: 'ROOT', permissions: Binary(ROOT.array) },
	]);
	
	console.log('Updating previous accounts to new roles');
	console.log('Updating anons');
	await db.collection('accounts').updateMany(
		{ permissions: Binary(Buffer.from('CAAAAAAAIAA=', 'base64'), 0)},
		{ $set: 
			{
				permissions: Binary(ANON.array)
			}
		}
	);
	console.log('Updating trusted users');
	await db.collection('accounts').updateMany(
		{ permissions: Binary(Buffer.from('CAMAAAAAIAA=', 'base64'), 0)},
		{ $set: 
			{
				permissions: Binary(TRUSTED.array)
			}
		}
	);
	console.log('Updating mod users');
	await db.collection('accounts').updateMany(
		{ permissions: Binary(Buffer.from('CCMMGcCAIAA=', 'base64'), 0)},
		{ $set: 
			{
				permissions: Binary(MOD.array)
			}
		}
	);
	console.log('Updating root user');
	await db.collection('accounts').updateMany(
		{ permissions: Binary(Buffer.from('2D/P+/iAMAA=', 'base64'), 0)},
		{ $set: 
			{
				permissions: Binary(ROOT.array)
			}
		}
	);
	
	console.log('Removing board staff and assets');
	await db.collection('boards').updateMany(
		{}, 
		{ $unset: { staff: '', owner: '', flags: '', banners: '' } });
	await db.collection('accounts').updateMany(
		{}, 
		{ $unset: { ownedBoards: '', staffBoards: '' } });
	
	console.log('Ensure banner and flag folders exist');
	await Promise.all([
		fs.ensureDir(`${uploadDirectory}/banner`),
		fs.ensureDir(`${uploadDirectory}/flag`),
	]);
	
	console.log('Update flags in posts');
	let bulkWrite = [
		{
			updateMany: {
				filter: { 'country.name': '911' },
				update: {
					$set: {
						country: {
							name: '911',
							code: '911',
							src: '911.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'hyena' },
				update: {
					$set: {
						country: {
							name: 'hyena',
							code: 'hyena',
							src: 'hyena.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'katia' },
				update: {
					$set: {
						country: {
							name: 'katia',
							code: 'katia',
							src: 'katia.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'averi' },
				update: {
					$set: {
						country: {
							name: 'averi',
							code: 'averi',
							src: 'averi.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'blackchan' },
				update: {
					$set: {
						country: {
							name: 'blackchan',
							code: 'blackchan',
							src: 'blackchan.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'oogami-san' },
				update: {
					$set: {
						country: {
							name: 'oogami-san',
							code: 'oogami-san',
							src: 'oogami-san.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'bully' },
				update: {
					$set: {
						country: {
							name: 'bully',
							code: 'bully',
							src: 'bully.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'shami' },
				update: {
					$set: {
						country: {
							name: 'shami',
							code: 'shami',
							src: 'shami.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'aros' },
				update: {
					$set: {
						country: {
							name: 'aros',
							code: 'aros',
							src: 'aros.gif',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'patty' },
				update: {
					$set: {
						country: {
							name: 'patty',
							code: 'patty',
							src: 'patty.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'missy' },
				update: {
					$set: {
						country: {
							name: 'missy',
							code: 'missy',
							src: 'missy.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'anon' },
				update: {
					$set: {
						country: {
							name: 'anon',
							code: 'anon',
							src: 'anon.png',
							custom: true,
						}
					}
				}
			},
		},
		{
			updateMany: {
				filter: { 'country.name': 'pepe' },
				update: {
					$set: {
						country: {
							name: 'pepe',
							code: 'pepe',
							src: 'pepe.png',
							custom: true,
						}
					}
				}
			},
		},
	];
	await db.collection('posts').bulkWrite(bulkWrite);
	
	console.log('Clearing all cache');
	await redis.deletePattern('*');
};
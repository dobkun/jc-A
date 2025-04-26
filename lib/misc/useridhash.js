'use strict';

const { createHash, } = require('crypto')
	, ipTypes = require(__dirname + '/../middleware/ip/iptypes.js')
	, { createCIDR } = require('ip6addr');

module.exports = (salt, ip) => {
	let ipstring;
	if (ip.type === ipTypes.IPV4) {
		ipstring = ip.raw;
	} else {
		ipstring = createCIDR(ip.raw, 64).toString();
	}

	const fullUserIdHash = createHash('sha256').update(salt + ipstring).digest('hex');
	return fullUserIdHash.substring(fullUserIdHash.length - 6);
};

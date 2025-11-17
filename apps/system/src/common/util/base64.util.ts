import * as crypto from 'crypto';

const hash = crypto.createHash('sha256').update(`VIEW_CODE_SECRET`).digest('base64');
const key = hash.slice(0, 16);
const iv = hash.slice(-16);

export const base64 = {
	encode: (value: string) => {
		const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
		let encrypted = cipher.update(value, 'utf-8', 'base64');
		encrypted += cipher.final('base64');

		return encodeURIComponent(encrypted);
	},
	decode: (value: string) => {
		try {
			value = decodeURIComponent(value);
			const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv));
			let decrypted = decipher.update(value, 'base64', 'binary');
			decrypted += decipher.final('binary');

			return decrypted;
		} catch (e) {
			return value;
		}
	},
};

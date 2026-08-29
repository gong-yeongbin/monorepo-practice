// viewCode를 AES-128-CBC로 암호화/복호화하는 코덱 유틸
import * as crypto from 'crypto';

const hash = crypto.createHash('sha256').update(`VIEW_CODE_SECRET`).digest('base64');
const key = hash.slice(0, 16);
const iv = hash.slice(-16);

export const viewCodeCodec = {
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
			// encode가 utf-8로 암호화하므로 복호화도 utf-8이어야 한다. 'binary'(latin1)로 받으면
			// 한글 pub_id·sub_id가 바이트 단위로 쪼개져 깨진다(ASCII만 두 인코딩 결과가 같아 드러나지 않았다).
			return Buffer.concat([decipher.update(value, 'base64'), decipher.final()]).toString('utf-8');
		} catch (e) {
			return value;
		}
	},
};

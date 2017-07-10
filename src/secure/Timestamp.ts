import HttpError from '../class/HttpError'

let START = null;
let PRIME = null;

export namespace Timestamp {
	export function encode (date: Date = new Date()): string {
		let diff = Math.floor((date.valueOf() - START.valueOf()) / 1000);
		let salt = Math.floor((Math.random() * 1000000)).toString(36);
		return (diff * PRIME).toString(36) + '-' + salt;
	};
	export function decode (token: string): Date {
		let str = token;
		let i = str.indexOf('-');
		if (i > -1) {
			str = str.substring(0, i);
		}
		var num = parseInt(str, 36);
		if (isNaN(num)) {
			throw new HttpError('Token is not a number', 401);
		}
		if (num % PRIME !== 0) {
			throw new HttpError('Number was manipulated', 401);
		}
		var seconds = num / PRIME;
		return new Date(START.valueOf() + seconds * 1000);
	};
	export function configurate (opts: {prime: number, date: Date}) {
		START = opts.date;
		PRIME = opts.prime;
	};
}
import HttpError from '../class/HttpError';

export default class Check implements ICheck {
	private ctx: any;
	private property: string;
	public error: HttpError = null;

	use(ctx, property): ICheck {
		if (this.error) {
			return new EmptyCheck();
		}
		this.ctx = ctx;
		this.property = property;
		return this;
	}
	required (msg, isRequired = true): ICheck {
        let exists = this.ctx[this.property] != null;
        if (exists == false) {
            if (isRequired) {
                this.error = new HttpError(msg, 400);
            }
            return new EmptyCheck();
        }
		return this;
	}
    normalizeEmail (): ICheck {
		this.ctx[this.property] = Util.normalizeEmail(this.ctx[this.property]);
		return this;
	}
	normalizeString (): ICheck {
        this.ctx[this.property] = Util.normalizeString(this.ctx[this.property]);		
		return this;
	}
	toNumber(): ICheck {
		this.ctx[this.property] = parseFloat(this.ctx[this.property]);
		return this;
	}
	toBoolean(): ICheck {
		let val = this.ctx[this.property];
		if (typeof val === 'string') {
			this.ctx[this.property] = val.toLowerCase() === 'true' || val === '1' ? true : false;
		} else {
			this.ctx[this.property] = Boolean(val);
		}
		return this;
	}
    isValidEmail (msg: string): ICheck {
        let isValid = Util.validateEmail(this.ctx[this.property]);
        if (isValid === false) {
            this.error = new HttpError(msg, 400);
            return new EmptyCheck();
        }
        return this;
    }
    isValidString (msg: string): ICheck {
        let isValid = Util.validateString(this.ctx[this.property]);
        if (isValid === false) {
            this.error = new HttpError(msg, 400);
            return new EmptyCheck();
        }
        return this;
    }
	isValidNumber (msg: string, min: number = null, max: number = null): ICheck {
        let isValid = Util.validateNumber(this.ctx[this.property], min, max);
        if (isValid === false) {
            this.error = new HttpError(msg, 400);
            return new EmptyCheck();
        }
        return this;
    }
	default (val: any): ICheck {
        let exists = this.ctx[this.property] != null;
        if (exists == false) {
            this.ctx[this.property] = val;
        }
        return this;
    }
}

interface ICheck {
	required (msg: string, isRequired?): ICheck
	toNumber (): ICheck
	toBoolean(): ICheck
	normalizeEmail  (): ICheck
	normalizeString (): ICheck
	isValidEmail (msg: string): ICheck
    isValidString (msg: string): ICheck
	isValidNumber (msg: string, min: number, max: number): ICheck
	default (val: any): ICheck
}

class EmptyCheck implements ICheck {
	toNumber(): ICheck {
		return this;
	}
	toBoolean(): ICheck {
		return this;
	}
	required(msg: string, isRequired: any) {
		return this;
	}
	normalizeEmail() {
		return this;
	}
	normalizeString() {
		return this;
	}
    isValidEmail() {
		return this;
	}
	isValidString() {
		return this;
	}
	isValidNumber() {
		return this;
	}
	default() {
		return this;
	}

}


namespace Util {
	export function normalizeEmail (val: string) {
        if (typeof val !== 'string') {
            return null;
        }
		val = val.toLowerCase().replace(/\s+/g, '');
		val = val.replace(/\++[^@]*/g, '');

		return val;	
	}
    export function normalizeString (val: string) {
        if (typeof val !== 'string') {
            return null;
        }
		return val.trim();
	}

	export function validateEmail(val: string) {
		return validateString(val, 4, 100) && /^[^@]+@[^@]+\.[\w]+$/g.test(val);
	}

	export function validateString (val, min = 2, max = 100) {
		if (typeof val !== 'string') return false;
        if (min != null && val.length < min) return false;
        if (max != null && val.length > max) return false;
        return true;
	}

    export function validateNumber (val, min = null, max = null) {
        if (typeof val !== 'number') return false;
        if (min != null && val < min) return false;
        if (max != null && val > max) return false;
        return true;
	}
}
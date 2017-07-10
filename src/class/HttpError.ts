export default class HttpError extends Error {
	public name = 'HttpError'
	constructor(message, public status = 500) {
		super(message)
	}
}

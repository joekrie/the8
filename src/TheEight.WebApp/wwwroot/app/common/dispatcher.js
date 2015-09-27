import {emitter} from 'contra';

export default class Dispatcher {
	constructor() {
		this.emitter = emitter();
	}
	
	registerAction(name, action) {
		this.emitter.on(name, action);
		this[name] = (...args) => this.emitter.emit(name, ...args);
	}
	
	onDestory() {
		this.emitter.off();
	}
}
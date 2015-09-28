import {emitter} from 'contra';

export default class Dispatcher {
	constructor() {
		this.emitter = emitter();
		this.actions = [];
	}
	
	registerAction(name, action) {
		this.emitter.on(name, action);
		this.actions[name] = (...args) => this.emitter.emit(name, ...args);
	}
	
	callAction(name, ...args) {
		this.actions[name](...args);
	}
	
	onDestory() {
		this.emitter.off();
	}
}
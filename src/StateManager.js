export default class StateManager {
	constructor(states, transitions, debug) {
		this.states = {
			'_START_': '_START_'
		};

		this.events = {};

		this.debug = debug;

		this.finiteStates = {};
		this.state = this.states['_START_'];

		states.forEach(state => {
			if (state.charAt(0) === '!') {
				state = state.substring(1);
				this.finiteStates[state] = state;
			}
			this.states[state] = state;
		});

		this.transitions = transitions;
	}

	static equalFunction(token, condition) {
		return token === condition;
	}

	setEqualFunction(fn) {
		this.customEqualFn = fn;
	}

	input(token) {
		let transition = this.transitions[this.state];

		if (!transition) return false;

		let nextStates = Object.keys(transition);

		let matchedState = nextStates.find(nextState => {
			let condition = transition[nextState];
			return typeof condition === 'function' ? condition(token) : this.customEqualFn || StateManager.equalFunction(token, condition);
		});

		/*if (this.debug) {
			debugger;
		}*/

		if (matchedState) {
			if (this.debug) {
				console.log(this.state, token, '->', matchedState);
			}
			this.state = matchedState;
			if (this.events[this.state]) {
				this.events[this.state]();
			}
			return true;
		} else {
			return false;
		}
	}

	on(transition, callback) {
		this.events[transition] = callback;
	}

	isFiniteState() {
		return this.state in this.finiteStates;
	}

	reset() {
		this.state = '_START_';
	}

	process(source) {
		if (typeof source === 'string') {
			source = source.split('');
		}

		return source.every((token, i) => this.input(token));
	}

}

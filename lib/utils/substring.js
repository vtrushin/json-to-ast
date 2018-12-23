import GraphemeSplitter from 'grapheme-splitter';

const splitter = new GraphemeSplitter();

const substring = (str, start, end) => {
	const iterator = splitter.iterateGraphemes(str);

	let value = '';

	for (let pos = 0; pos < end; pos ++) {
		const next = iterator.next();

		if (pos >= start) {
			value += next.value;
		}

		if (next.done) {
			break;
		}
	}

	return value;
};

export default substring;

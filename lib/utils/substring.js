import GraphemeSplitter from 'grapheme-splitter';

const splitter = new GraphemeSplitter();

const substring = (str, start, end) => {
	const iterator = splitter.iterateGraphemes(str.substring(start));

	let value = '';

	for (let pos = 0; pos < end - start; pos ++) {
		const next = iterator.next();

		value += next.value;

		if (next.done) {
			break;
		}
	}

	return value;
};

export default substring;

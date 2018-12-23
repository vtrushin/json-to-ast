import codeErrorFragment from 'code-error-fragment';
import createError from './utils/create-error';

export default (message, input, source, line, column) => {
	throw createError({
		message: line
			? message + '\n' + codeErrorFragment(input, line, column)
			: message,
		rawMessage: message,
		source,
		line,
		column
	});
}

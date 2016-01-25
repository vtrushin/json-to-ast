let i = 0;

export default {
	OPEN_OBJECT:    i++, // {
	CLOSE_OBJECT:   i++, // }
	OPEN_ARRAY:     i++, // [
	CLOSE_ARRAY:    i++, // ]
	COLON:          i++, // :
	COMMA:          i++, // ,
	STRING:         i++, //
	NUMBER:         i++, //
	TRUE:           i++, // true
	FALSE:          i++, // false
	NULL:           i++ // null
};
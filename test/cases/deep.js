var types = require('../types');

var object = types.createObject;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;

var ast =
	object(prop('a',
		object(prop('b',
			object(prop('c',
				object(prop('d',
					object(prop('e',
						object(prop('f',
							object(prop('g',
								array(string('h'),
									array(string('i'),
										array(string('j'),
											array(string('k'),
												array(string('l'),
													array(string('m'),
														array(string('n'))
													)
												)
											)
										)
									)
								)
							))
						))
					))
				))
			))
		))
	));

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};


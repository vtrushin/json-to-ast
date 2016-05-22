function array() {
	return {
		type: 'array',
		items: Array.prototype.slice.call(arguments).map(function(item) {
			if (typeof item === 'string') {
				item = string(item);
			}

			return item;
		})
	}
}

var ast =
	array(
		array(
			array(
				array(
					array(
						array(
							array(
								array()
							)
						)
					)
				)
			)
		)
	);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};

var types = require('../../src/types');
var object = types.createObject;
var key = types.createObjectKey;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;
var number = types.createNumber;
var _true = types.createTrue;
var _false = types.createFalse;

var ast = array([
	object([
		prop(key('_id'), string('574d7238062156c6d9e6de99')),
		prop(key('index'), number(0)),
		prop(key('guid'), string('c99bf348-0345-49fd-be52-d0da82bdd47f')),
		prop(key('isActive'), _true()),
		prop(key('balance'), string('$1,087.03')),
		prop(key('picture'), string('http://placehold.it/32x32')),
		prop(key('age'), number(25)),
		prop(key('eyeColor'), string('brown')),
		prop(key('name'), object([
			prop(key('first'), string('Stacie')),
			prop(key('last'), string('Sargent'))
		])),
		prop(key('company'), string('DAISU')),
		prop(key('email'), string('stacie.sargent@daisu.com')),
		prop(key('phone'), string('+1 (830) 537-3936')),
		prop(key('address'), string('547 Charles Place, Weogufka, Marshall Islands, 6627')),
		prop(key('about'), string('Exercitation nisi incididunt exercitation sit Lorem nostrud commodo incididunt cillum amet. Laboris proident non nostrud dolor esse exercitation enim sit culpa Lorem qui. Laborum aliquip pariatur mollit aute. Et consequat Lorem in cillum sunt dolore aute voluptate anim commodo. Excepteur labore proident consequat nulla occaecat in consequat minim.')),
		prop(key('registered'), string('Sunday, October 4, 2015 3:58 PM')),
		prop(key('latitude'), string('45.437159')),
		prop(key('longitude'), string('-77.052972')),
		prop(key('tags'), array([
			string('veniam'),
			string('et'),
			string('cillum'),
			string('ex'),
			string('nisi')
		])),
		prop(key('range'), array([
			number(0),
			number(1),
			number(2),
			number(3),
			number(4),
			number(5),
			number(6),
			number(7),
			number(8),
			number(9)
		])),
		prop(key('friends'), array([
			object([
				prop(key('id'), number(0)),
				prop(key('name'), string('Juliana Valentine'))
			]),
			object([
				prop(key('id'), number(1)),
				prop(key('name'), string('Robert Eaton'))
			]),
			object([
				prop(key('id'), number(2)),
				prop(key('name'), string('Socorro Herrera'))
			])
		])),
		prop(key('greeting'), string('Hello, Stacie! You have 6 unread messages.')),
		prop(key('favoriteFruit'), string('banana'))
	]),
	object([
		prop(key('_id'), string('574d7238bd4c01db9e4a4d5b')),
		prop(key('index'), number(1)),
		prop(key('guid'), string('5fd3fc48-e39e-4ee4-bc3a-6eb12bed2653')),
		prop(key('isActive'), _false()),
		prop(key('balance'), string('$1,696.52')),
		prop(key('picture'), string('http://placehold.it/32x32')),
		prop(key('age'), number(32)),
		prop(key('eyeColor'), string('blue')),
		prop(key('name'), object([
			prop(key('first'), string('Ada')),
			prop(key('last'), string('Stokes'))
		])),
		prop(key('company'), string('FARMAGE')),
		prop(key('email'), string('ada.stokes@farmage.biz')),
		prop(key('phone'), string('+1 (875) 486-3569')),
		prop(key('address'), string('361 Howard Place, Wyano, Michigan, 346')),
		prop(key('about'), string('Culpa esse laboris enim occaecat voluptate non reprehenderit officia amet eu ad laboris officia. Exercitation qui occaecat veniam ea tempor. Reprehenderit laborum magna occaecat sit tempor eiusmod est quis ea. Sunt minim labore et eu ex. Pariatur do proident nisi sunt commodo. Deserunt est ad pariatur laboris officia. Pariatur anim deserunt excepteur voluptate amet.')),
		prop(key('registered'), string('Wednesday, April 16, 2014 7:23 PM')),
		prop(key('latitude'), string('-45.133396')),
		prop(key('longitude'), string('43.593917')),
		prop(key('tags'), array([
			string('qui'),
			string('eiusmod'),
			string('nisi'),
			string('officia'),
			string('in')
		])),
		prop(key('range'), array([
			number(0),
			number(1),
			number(2),
			number(3),
			number(4),
			number(5),
			number(6),
			number(7),
			number(8),
			number(9)
		])),
		prop(key('friends'), array([
			object([
				prop(key('id'), number(0)),
				prop(key('name'), string('Campos Pruitt'))
			]),
			object([
				prop(key('id'), number(1)),
				prop(key('name'), string('Barnett Sykes'))
			]),
			object([
				prop(key('id'), number(2)),
				prop(key('name'), string('Trudy Collier'))
			])
		])),
		prop(key('greeting'), string('Hello, Ada! You have 8 unread messages.')),
		prop(key('favoriteFruit'), string('banana'))
	])
]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};

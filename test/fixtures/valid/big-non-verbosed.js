var types = require('../../types');
var object = types.createObject;
var id = types.createIdentifier;
var prop = types.createProperty();
var array = types.createArray;
var string = types.createString;
var number = types.createNumber;
var _true = types.createTrue;
var _false = types.createFalse;

var ast = array([
	object([
		prop(id('_id'), string('574d7238062156c6d9e6de99')),
		prop(id('index'), number(0)),
		prop(id('guid'), string('c99bf348-0345-49fd-be52-d0da82bdd47f')),
		prop(id('isActive'), _true()),
		prop(id('balance'), string('$1,087.03')),
		prop(id('picture'), string('http://placehold.it/32x32')),
		prop(id('age'), number(25)),
		prop(id('eyeColor'), string('brown')),
		prop(id('name'), object([
			prop(id('first'), string('Stacie')),
			prop(id('last'), string('Sargent'))
		])),
		prop(id('company'), string('DAISU')),
		prop(id('email'), string('stacie.sargent@daisu.com')),
		prop(id('phone'), string('+1 (830) 537-3936')),
		prop(id('address'), string('547 Charles Place, Weogufka, Marshall Islands, 6627')),
		prop(id('about'), string('Exercitation nisi incididunt exercitation sit Lorem nostrud commodo incididunt cillum amet. Laboris proident non nostrud dolor esse exercitation enim sit culpa Lorem qui. Laborum aliquip pariatur mollit aute. Et consequat Lorem in cillum sunt dolore aute voluptate anim commodo. Excepteur labore proident consequat nulla occaecat in consequat minim.')),
		prop(id('registered'), string('Sunday, October 4, 2015 3:58 PM')),
		prop(id('latitude'), string('45.437159')),
		prop(id('longitude'), string('-77.052972')),
		prop(id('tags'), array([
			string('veniam'),
			string('et'),
			string('cillum'),
			string('ex'),
			string('nisi')
		])),
		prop(id('range'), array([
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
		prop(id('friends'), array([
			object([
				prop(id('id'), number(0)),
				prop(id('name'), string('Juliana Valentine'))
			]),
			object([
				prop(id('id'), number(1)),
				prop(id('name'), string('Robert Eaton'))
			]),
			object([
				prop(id('id'), number(2)),
				prop(id('name'), string('Socorro Herrera'))
			])
		])),
		prop(id('greeting'), string('Hello, Stacie! You have 6 unread messages.')),
		prop(id('favoriteFruit'), string('banana'))
	]),
	object([
		prop(id('_id'), string('574d7238bd4c01db9e4a4d5b')),
		prop(id('index'), number(1)),
		prop(id('guid'), string('5fd3fc48-e39e-4ee4-bc3a-6eb12bed2653')),
		prop(id('isActive'), _false()),
		prop(id('balance'), string('$1,696.52')),
		prop(id('picture'), string('http://placehold.it/32x32')),
		prop(id('age'), number(32)),
		prop(id('eyeColor'), string('blue')),
		prop(id('name'), object([
			prop(id('first'), string('Ada')),
			prop(id('last'), string('Stokes'))
		])),
		prop(id('company'), string('FARMAGE')),
		prop(id('email'), string('ada.stokes@farmage.biz')),
		prop(id('phone'), string('+1 (875) 486-3569')),
		prop(id('address'), string('361 Howard Place, Wyano, Michigan, 346')),
		prop(id('about'), string('Culpa esse laboris enim occaecat voluptate non reprehenderit officia amet eu ad laboris officia. Exercitation qui occaecat veniam ea tempor. Reprehenderit laborum magna occaecat sit tempor eiusmod est quis ea. Sunt minim labore et eu ex. Pariatur do proident nisi sunt commodo. Deserunt est ad pariatur laboris officia. Pariatur anim deserunt excepteur voluptate amet.')),
		prop(id('registered'), string('Wednesday, April 16, 2014 7:23 PM')),
		prop(id('latitude'), string('-45.133396')),
		prop(id('longitude'), string('43.593917')),
		prop(id('tags'), array([
			string('qui'),
			string('eiusmod'),
			string('nisi'),
			string('officia'),
			string('in')
		])),
		prop(id('range'), array([
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
		prop(id('friends'), array([
			object([
				prop(id('id'), number(0)),
				prop(id('name'), string('Campos Pruitt'))
			]),
			object([
				prop(id('id'), number(1)),
				prop(id('name'), string('Barnett Sykes'))
			]),
			object([
				prop(id('id'), number(2)),
				prop(id('name'), string('Trudy Collier'))
			])
		])),
		prop(id('greeting'), string('Hello, Ada! You have 8 unread messages.')),
		prop(id('favoriteFruit'), string('banana'))
	])
]);

module.exports = {
	ast: ast,
	options: {
		loc: false
	}
};

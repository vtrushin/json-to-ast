var types = require('../types');
var object = types.createObject;
var prop = types.createObjectProperty;
var array = types.createArray;
var string = types.createString;
var number = types.createNumber;
var _true = types.createTrue;
var _false = types.createFalse;

var ast = array([
	object([
		prop('_id', string('574d7238062156c6d9e6de99')),
		prop('index', number('0')),
		prop('guid', string('c99bf348-0345-49fd-be52-d0da82bdd47f')),
		prop('isActive', _true()),
		prop('balance', string('$1,087.03')),
		prop('picture', string('http://placehold.it/32x32')),
		prop('age', number('25')),
		prop('eyeColor', string('brown')),
		prop('name', object([
			prop('first', string('Stacie')),
			prop('last', string('Sargent'))
		])),
		prop('company', string('DAISU')),
		prop('email', string('stacie.sargent@daisu.com')),
		prop('phone', string('+1 (830) 537-3936')),
		prop('address', string('547 Charles Place, Weogufka, Marshall Islands, 6627')),
		prop('about', string('Exercitation nisi incididunt exercitation sit Lorem nostrud commodo incididunt cillum amet. Laboris proident non nostrud dolor esse exercitation enim sit culpa Lorem qui. Laborum aliquip pariatur mollit aute. Et consequat Lorem in cillum sunt dolore aute voluptate anim commodo. Excepteur labore proident consequat nulla occaecat in consequat minim.')),
		prop('registered', string('Sunday, October 4, 2015 3:58 PM')),
		prop('latitude', string('45.437159')),
		prop('longitude', string('-77.052972')),
		prop('tags', array([
			string('veniam'),
			string('et'),
			string('cillum'),
			string('ex'),
			string('nisi')
		])),
		prop('range', array([
			number('0'),
			number('1'),
			number('2'),
			number('3'),
			number('4'),
			number('5'),
			number('6'),
			number('7'),
			number('8'),
			number('9')
		])),
		prop('friends', array([
			object([
				prop('id', number('0')),
				prop('name', string('Juliana Valentine'))
			]),
			object([
				prop('id', number('1')),
				prop('name', string('Robert Eaton'))
			]),
			object([
				prop('id', number('2')),
				prop('name', string('Socorro Herrera'))
			])
		])),
		prop('greeting', string('Hello, Stacie! You have 6 unread messages.')),
		prop('favoriteFruit', string('banana'))
	]),
	object([
		prop('_id', string('574d7238bd4c01db9e4a4d5b')),
		prop('index', number('1')),
		prop('guid', string('5fd3fc48-e39e-4ee4-bc3a-6eb12bed2653')),
		prop('isActive', _false()),
		prop('balance', string('$1,696.52')),
		prop('picture', string('http://placehold.it/32x32')),
		prop('age', number('32')),
		prop('eyeColor', string('blue')),
		prop('name', object([
			prop('first', string('Ada')),
			prop('last', string('Stokes'))
		])),
		prop('company', string('FARMAGE')),
		prop('email', string('ada.stokes@farmage.biz')),
		prop('phone', string('+1 (875) 486-3569')),
		prop('address', string('361 Howard Place, Wyano, Michigan, 346')),
		prop('about', string('Culpa esse laboris enim occaecat voluptate non reprehenderit officia amet eu ad laboris officia. Exercitation qui occaecat veniam ea tempor. Reprehenderit laborum magna occaecat sit tempor eiusmod est quis ea. Sunt minim labore et eu ex. Pariatur do proident nisi sunt commodo. Deserunt est ad pariatur laboris officia. Pariatur anim deserunt excepteur voluptate amet.')),
		prop('registered', string('Wednesday, April 16, 2014 7:23 PM')),
		prop('latitude', string('-45.133396')),
		prop('longitude', string('43.593917')),
		prop('tags', array([
			string('qui'),
			string('eiusmod'),
			string('nisi'),
			string('officia'),
			string('in')
		])),
		prop('range', array([
			number('0'),
			number('1'),
			number('2'),
			number('3'),
			number('4'),
			number('5'),
			number('6'),
			number('7'),
			number('8'),
			number('9')
		])),
		prop('friends', array([
			object([
				prop('id', number('0')),
				prop('name', string('Campos Pruitt'))
			]),
			object([
				prop('id', number('1')),
				prop('name', string('Barnett Sykes'))
			]),
			object([
				prop('id', number('2')),
				prop('name', string('Trudy Collier'))
			])
		])),
		prop('greeting', string('Hello, Ada! You have 8 unread messages.')),
		prop('favoriteFruit', string('banana'))
	])
]);

module.exports = {
	ast: ast,
	options: {
		verbose: false
	}
};

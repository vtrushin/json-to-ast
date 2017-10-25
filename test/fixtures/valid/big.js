var types = require('../../types');
var object = types.createObject;
var id = types.createIdentifier;
var prop = types.createProperty();
var array = types.createArray;
var literal = types.createLiteral;

var ast = array([
	object([
		prop(id('_id', '"_id"'), literal('574d7238062156c6d9e6de99', '"574d7238062156c6d9e6de99"')),
		prop(id('index', '"index"'), literal(0, '0')),
		prop(id('guid', '"guid"'), literal('c99bf348-0345-49fd-be52-d0da82bdd47f', '"c99bf348-0345-49fd-be52-d0da82bdd47f"')),
		prop(id('isActive', '"isActive"'), literal(true, 'true')),
		prop(id('balance', '"balance"'), literal('$1,087.03', '"$1,087.03"')),
		prop(id('picture', '"picture"'), literal('http://placehold.it/32x32', '"http://placehold.it/32x32"')),
		prop(id('age', '"age"'), literal(25, '25')),
		prop(id('eyeColor', '"eyeColor"'), literal('brown', '"brown"')),
		prop(id('name', '"name"'), object([
			prop(id('first', '"first"'), literal('Stacie', '"Stacie"')),
			prop(id('last', '"last"'), literal('Sargent', '"Sargent"'))
		])),
		prop(id('company', '"company"'), literal('DAISU', '"DAISU"')),
		prop(id('email', '"email"'), literal('stacie.sargent@daisu.com', '"stacie.sargent@daisu.com"')),
		prop(id('phone', '"phone"'), literal('+1 (830) 537-3936', '"+1 (830) 537-3936"')),
		prop(id('address', '"address"'), literal('547 Charles Place, Weogufka, Marshall Islands, 6627', '"547 Charles Place, Weogufka, Marshall Islands, 6627"')),
		prop(id('about'), literal('Exercitation nisi incididunt exercitation sit Lorem nostrud commodo incididunt cillum amet. Laboris proident non nostrud dolor esse exercitation enim sit culpa Lorem qui. Laborum aliquip pariatur mollit aute. Et consequat Lorem in cillum sunt dolore aute voluptate anim commodo. Excepteur labore proident consequat nulla occaecat in consequat minim.', '"Exercitation nisi incididunt exercitation sit Lorem nostrud commodo incididunt cillum amet. Laboris proident non nostrud dolor esse exercitation enim sit culpa Lorem qui. Laborum aliquip pariatur mollit aute. Et consequat Lorem in cillum sunt dolore aute voluptate anim commodo. Excepteur labore proident consequat nulla occaecat in consequat minim."')),
		prop(id('registered', '"registered"'), literal('Sunday, October 4, 2015 3:58 PM', '"Sunday, October 4, 2015 3:58 PM"')),
		prop(id('latitude', '"latitude"'), literal('45.437159', '"45.437159"')),
		prop(id('longitude', '"longitude"'), literal('-77.052972', '"-77.052972"')),
		prop(id('tags', '"tags"'), array([
			literal('veniam', '"veniam"'),
			literal('et', '"et"'),
			literal('cillum', '"cillum"'),
			literal('ex', '"ex"'),
			literal('nisi', '"nisi"')
		])),
		prop(id('range', '"range"'), array([
			literal(0, '0'),
			literal(1, '1'),
			literal(2, '2'),
			literal(3, '3'),
			literal(4, '4'),
			literal(5, '5'),
			literal(6, '6'),
			literal(7, '7'),
			literal(8, '8'),
			literal(9, '9')
		])),
		prop(id('friends', '"friends"'), array([
			object([
				prop(id('id', '"id"'), literal(0, '0')),
				prop(id('name', '"name"'), literal('Juliana Valentine', '"Juliana Valentine"'))
			]),
			object([
				prop(id('id', '"id"'), literal(1, '1')),
				prop(id('name', '"name"'), literal('Robert Eaton', '"Robert Eaton"'))
			]),
			object([
				prop(id('id', '"id"'), literal(2, '2')),
				prop(id('name', '"name"'), literal('Socorro Herrera', '"Socorro Herrera"'))
			])
		])),
		prop(id('greeting', '"greeting"'), literal('Hello, Stacie! You have 6 unread messages.', '"Hello, Stacie! You have 6 unread messages."')),
		prop(id('favoriteFruit', '"favoriteFruit"'), literal('banana', '"banana"'))
	]),
	object([
		prop(id('_id', '"_id"'), literal('574d7238bd4c01db9e4a4d5b', '"574d7238bd4c01db9e4a4d5b"')),
		prop(id('index', '"index"'), literal(1, '1')),
		prop(id('guid', '"guid"'), literal('5fd3fc48-e39e-4ee4-bc3a-6eb12bed2653', '"5fd3fc48-e39e-4ee4-bc3a-6eb12bed2653"')),
		prop(id('isActive', '"isActive"'), literal(false, 'false')),
		prop(id('balance', '"balance"'), literal('$1,696.52', '"$1,696.52"')),
		prop(id('picture', '"picture"'), literal('http://placehold.it/32x32', '"http://placehold.it/32x32"')),
		prop(id('age', '"age"'), literal(32, '32')),
		prop(id('eyeColor', '"eyeColor"'), literal('blue', '"blue"')),
		prop(id('name', '"name"'), object([
			prop(id('first', '"first"'), literal('Ada', '"Ada"')),
			prop(id('last', '"last"'), literal('Stokes', '"Stokes"'))
		])),
		prop(id('company', '"company"'), literal('FARMAGE', '"FARMAGE"')),
		prop(id('email', '"email"'), literal('ada.stokes@farmage.biz', '"ada.stokes@farmage.biz"')),
		prop(id('phone', '"phone"'), literal('+1 (875) 486-3569', '"+1 (875) 486-3569"')),
		prop(id('address', '"address"'), literal('361 Howard Place, Wyano, Michigan, 346', '"361 Howard Place, Wyano, Michigan, 346"')),
		prop(id('about', '"about"'), literal('Culpa esse laboris enim occaecat voluptate non reprehenderit officia amet eu ad laboris officia. Exercitation qui occaecat veniam ea tempor. Reprehenderit laborum magna occaecat sit tempor eiusmod est quis ea. Sunt minim labore et eu ex. Pariatur do proident nisi sunt commodo. Deserunt est ad pariatur laboris officia. Pariatur anim deserunt excepteur voluptate amet.', '"Culpa esse laboris enim occaecat voluptate non reprehenderit officia amet eu ad laboris officia. Exercitation qui occaecat veniam ea tempor. Reprehenderit laborum magna occaecat sit tempor eiusmod est quis ea. Sunt minim labore et eu ex. Pariatur do proident nisi sunt commodo. Deserunt est ad pariatur laboris officia. Pariatur anim deserunt excepteur voluptate amet."')),
		prop(id('registered', '"registered"'), literal('Wednesday, April 16, 2014 7:23 PM', '"Wednesday, April 16, 2014 7:23 PM"')),
		prop(id('latitude', '"latitude"'), literal('-45.133396', '"-45.133396"')),
		prop(id('longitude', '"longitude"'), literal('43.593917', '"43.593917"')),
		prop(id('tags', '"tags"'), array([
			literal('qui', '"qui"'),
			literal('eiusmod', '"eiusmod"'),
			literal('nisi', '"nisi"'),
			literal('officia', '"officia"'),
			literal('in', '"in"')
		])),
		prop(id('range', '"range"'), array([
			literal(0, '0'),
			literal(1, '1'),
			literal(2, '2'),
			literal(3, '3'),
			literal(4, '4'),
			literal(5, '5'),
			literal(6, '6'),
			literal(7, '7'),
			literal(8, '8'),
			literal(9, '9')
		])),
		prop(id('friends', '"friends"'), array([
			object([
				prop(id('id', '"id"'), literal(0, '0')),
				prop(id('name', '"name"'), literal('Campos Pruitt', '"Campos Pruitt"'))
			]),
			object([
				prop(id('id', '"id"'), literal(1, '1')),
				prop(id('name', '"name"'), literal('Barnett Sykes', '"Barnett Sykes"'))
			]),
			object([
				prop(id('id', '"id"'), literal(2, '2')),
				prop(id('name', '"name"'), literal('Trudy Collier', '"Trudy Collier"'))
			])
		])),
		prop(id('greeting', '"greeting"'), literal('Hello, Ada! You have 8 unread messages.', '"Hello, Ada! You have 8 unread messages."')),
		prop(id('favoriteFruit', '"favoriteFruit"'), literal('banana', '"banana"'))
	])
]);

module.exports = {
	ast: ast,
	options: {
		loc: false
	}
};

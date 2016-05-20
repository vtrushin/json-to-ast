function object(key, value) {
	return {
		type: 'object',
		properties: [
			{
				type: 'property',
				key: {
					type: 'key',
					value: key
				},
				value: {
					type: 'string',
					value: value
				}
			}
		]
	}
}

function array() {
	return {
		type: 'array',
		items: Array.prototype.slice.call(arguments).map(function(item) {
			return {
				type: 'string',
				value: item
			}
		})
	}
}

var a =
	object('a');

a;

module.exports = a;




/*

{
	  properties: [
	    {
	      key: {
	        type: 'key'
			  value": "a"
	      }
	-      "type": "property"
-      "value": {
	-        "properties": [
		-          {
		-            "key": {
		-              "type": "key"
		-              "value": "b"
		-            }
	-            "type": "property"
	-            "value": {
		-              "properties": [
			-                {
			-                  "key": {
			-                    "type": "key"
			-                    "value": "c"
			-                  }
		-                  "type": "property"
		-                  "value": {
			-                    "properties": [
				-                      {
				-                        "key": {
				-                          "type": "key"
				-                          "value": "d"
				-                        }
			-                        "type": "property"
			-                        "value": {
				-                          "properties": [
					-                            {
					-                              "key": {
					-                                "type": "key"
					-                                "value": "e"
					-                              }
				-                              "type": "property"
				-                              "value": {
					-                                "properties": [
						-                                  {
						-                                    "key": {
						-                                      "type": "key"
						-                                      "value": "f"
						-                                    }
					-                                    "type": "property"
					-                                    "value": {
						-                                      "properties": [
							-                                        {
							-                                          "key": {
							-                                            "type": "key"
							-                                            "value": "g"
							-                                          }
						-                                          "type": "property"
						-                                          "value": {
							-                                            "properties": [
								-                                              {
								-                                                "key": {
								-                                                  "type": "key"
								-                                                  "value": "h"
								-                                                }
							-                                                "type": "property"
							-                                                "value": {
								-                                                  "properties": [
									-                                                    {
									-                                                      "key": {
									-                                                        "type": "key"
									-                                                        "value": "i"
									-                                                      }
								-                                                      "type": "property"
								-                                                      "value": {
									-                                                        "properties": [
										-                                                          {
										-                                                            "key": {
										-                                                              "type": "key"
										-                                                              "value": "j"
										-                                                            }
									-                                                            "type": "property"
									-                                                            "value": {
										-                                                              "items": [
											-                                                                {
											-                                                                  "type": "string"
										-                                                                  "value": "k"
										-                                                                }
										-                                                                {
										-                                                                  "items": [
											-                                                                    {
											-                                                                      "type": "string"
										-                                                                      "value": "l"
										-                                                                    }
										-                                                                    {
										-                                                                      "items": [
											-                                                                        {
											-                                                                          "type": "string"
										-                                                                          "value": "m"
										-                                                                        }
										-                                                                        {
										-                                                                          "items": [
											-                                                                            {
											-                                                                              "type": "string"
										-                                                                              "value": "n"
										-                                                                            }
										-                                                                            {
										-                                                                              "items": [
											-                                                                                {
											-                                                                                  "type": "string"
										-                                                                                  "value": "o"
										-                                                                                }
										-                                                                                {
										-                                                                                  "items": [
											-                                                                                    {
											-                                                                                      "type": "string"
										-                                                                                      "value": "p"
										-                                                                                    }
										-                                                                                    {
										-                                                                                      "items": [
											-                                                                                        {
											-                                                                                          "type": "string"
										-                                                                                          "value": "q"
										-                                                                                        }
										-                                                                                        {
										-                                                                                          "items": [
											-                                                                                            {
											-                                                                                              "type": "string"
										-                                                                                              "value": "r"
										-                                                                                            }
										-                                                                                            {
										-                                                                                              "items": [
											-                                                                                                {
											-                                                                                                  "type": "string"
										-                                                                                                  "value": "s"
										-                                                                                                }
										-                                                                                              ]
										-                                                                                              "type": "array"
										-                                                                                            }
										-                                                                                          ]
										-                                                                                          "type": "array"
										-                                                                                        }
										-                                                                                      ]
										-                                                                                      "type": "array"
										-                                                                                    }
										-                                                                                  ]
										-                                                                                  "type": "array"
										-                                                                                }
										-                                                                              ]
										-                                                                              "type": "array"
										-                                                                            }
										-                                                                          ]
										-                                                                          "type": "array"
										-                                                                        }
										-                                                                      ]
										-                                                                      "type": "array"
										-                                                                    }
										-                                                                  ]
										-                                                                  "type": "array"
										-                                                                }
										-                                                              ]
										-                                                              "type": "array"
										-                                                            }
									-                                                          }
									-                                                        ]
									-                                                        "type": "object"
									-                                                      }
								-                                                    }
								-                                                  ]
								-                                                  "type": "object"
								-                                                }
							-                                              }
							-                                            ]
							-                                            "type": "object"
							-                                          }
						-                                        }
						-                                      ]
						-                                      "type": "object"
						-                                    }
					-                                  }
					-                                ]
					-                                "type": "object"
					-                              }
				-                            }
				-                          ]
				-                          "type": "object"
				-                        }
			-                      }
			-                    ]
			-                    "type": "object"
			-                  }
		-                }
		-              ]
		-              "type": "object"
		-            }
	-          }
	-        ]
	-        "type": "object"
	-      }
	-    }
	-  ]
	-  "type": "object"
-}
*/

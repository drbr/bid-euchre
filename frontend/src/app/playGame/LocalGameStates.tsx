import { GameStateMachine } from '../../gameLogic/euchreStateMachine/GameStateMachine';

export const freshGame = GameStateMachine.initialState;

export const startBidding = JSON.parse(`
{
	"actions": [{
		"type": "xstate.stop",
		"activity": {
			"id": "dealHands",
			"src": {
				"type": "EuchreStateMachine.runGame.round.waitForDeal:invocation[0]"
			},
			"type": "xstate.invoke"
		}
	}],
	"activities": {
		"dealHands": false
	},
	"meta": {},
	"events": [],
	"value": {
		"runGame": {
			"round": {
				"bidding": "waitForPlayerToBid"
			}
		}
	},
	"context": {
		"score": {
			"eastwest": 0,
			"northsouth": 0
		},
		"eventCount": 0,
		"previousEventCount": null,
		"currentDealer": "north",
		"private_hands": {
			"north": [{
				"rank": "A",
				"suit": "H"
			}, {
				"rank": "9",
				"suit": "D"
			}, {
				"rank": "K",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "S"
			}, {
				"rank": "J",
				"suit": "H"
			}, {
				"rank": "9",
				"suit": "H"
			}],
			"south": [{
				"rank": "Q",
				"suit": "C"
			}, {
				"rank": "Q",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "S"
			}, {
				"rank": "K",
				"suit": "C"
			}, {
				"rank": "10",
				"suit": "H"
			}, {
				"rank": "10",
				"suit": "D"
			}],
			"east": [{
				"rank": "10",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "D"
			}, {
				"rank": "A",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "C"
			}, {
				"rank": "K",
				"suit": "D"
			}, {
				"rank": "A",
				"suit": "S"
			}],
			"west": [{
				"rank": "10",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "H"
			}, {
				"rank": "J",
				"suit": "S"
			}, {
				"rank": "9",
				"suit": "C"
			}, {
				"rank": "A",
				"suit": "D"
			}]
		},
		"awaitedPlayer": "east",
		"bids": {
			"north": null,
			"south": null,
			"east": null,
			"west": null
		}
	},
	"_event": {
		"name": "SECRET_ACTION_COMPLETE",
		"data": {
			"type": "SECRET_ACTION_COMPLETE"
		},
		"$$type": "scxml",
		"type": "external"
	},
	"_sessionid": "x:3",
	"event": {
		"type": "SECRET_ACTION_COMPLETE"
	},
	"historyValue": {
		"current": {
			"runGame": {
				"round": {
					"bidding": "waitForPlayerToBid"
				}
			}
		},
		"states": {
			"runGame": {
				"current": {
					"round": {
						"bidding": "waitForPlayerToBid"
					}
				},
				"states": {
					"round": {
						"current": {
							"bidding": "waitForPlayerToBid"
						},
						"states": {
							"bidding": {
								"current": "waitForPlayerToBid",
								"states": {}
							}
						}
					}
				}
			}
		}
	},
	"children": {},
	"done": false,
	"changed": true
}`);

export const nameTrump = JSON.parse(`
{
	"actions": [],
	"activities": {
		"dealHands": false
	},
	"meta": {},
	"events": [],
	"value": {
		"runGame": {
			"round": "waitForPlayerToNameTrump"
		}
	},
	"context": {
		"score": {
			"eastwest": 0,
			"northsouth": 0
		},
		"eventCount": 0,
		"previousEventCount": null,
		"currentDealer": "north",
		"private_hands": {
			"north": [{
				"rank": "A",
				"suit": "H"
			}, {
				"rank": "9",
				"suit": "D"
			}, {
				"rank": "K",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "S"
			}, {
				"rank": "J",
				"suit": "H"
			}, {
				"rank": "9",
				"suit": "H"
			}],
			"south": [{
				"rank": "Q",
				"suit": "C"
			}, {
				"rank": "Q",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "S"
			}, {
				"rank": "K",
				"suit": "C"
			}, {
				"rank": "10",
				"suit": "H"
			}, {
				"rank": "10",
				"suit": "D"
			}],
			"east": [{
				"rank": "10",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "D"
			}, {
				"rank": "A",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "C"
			}, {
				"rank": "K",
				"suit": "D"
			}, {
				"rank": "A",
				"suit": "S"
			}],
			"west": [{
				"rank": "10",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "H"
			}, {
				"rank": "J",
				"suit": "S"
			}, {
				"rank": "9",
				"suit": "C"
			}, {
				"rank": "A",
				"suit": "D"
			}]
		},
		"awaitedPlayer": "north",
		"bids": {
			"north": "pass",
			"south": 3,
			"east": 2,
			"west": "pass"
		},
		"highestBidder": "south",
		"highestBid": 3
	},
	"_event": {
		"name": "PLAYER_BID",
		"data": {
			"type": "PLAYER_BID",
			"bid": "pass",
			"position": "north"
		},
		"$$type": "scxml",
		"type": "external"
	},
	"_sessionid": "x:1",
	"event": {
		"type": "PLAYER_BID",
		"bid": "pass",
		"position": "north"
	},
	"historyValue": {
		"current": {
			"runGame": {
				"round": {
					"bidding": "checkIfBiddingIsComplete"
				}
			}
		},
		"states": {
			"runGame": {
				"current": {
					"round": {
						"bidding": "checkIfBiddingIsComplete"
					}
				},
				"states": {
					"round": {
						"current": {
							"bidding": "checkIfBiddingIsComplete"
						},
						"states": {
							"bidding": {
								"current": "checkIfBiddingIsComplete",
								"states": {}
							}
						}
					}
				}
			}
		}
	},
	"children": {},
	"done": false,
	"changed": true
}`);

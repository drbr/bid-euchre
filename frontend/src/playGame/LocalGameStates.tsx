import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';

// Copy local game states from the database "full JSON" and paste them here. Change the event count
// to 1 and the previous event count to 0.

export const freshGame = GameStateMachine.initialState;

export const StartBidding = JSON.parse(`
{
	"value": {
		"runGame": {
			"round": {
				"bidding": "waitForPlayerToBid"
			}
		}
	},
	"actions": [],
	"event": {
		"type": "SECRET_ACTION_COMPLETE"
	},
	"_event": {
		"name": "SECRET_ACTION_COMPLETE",
		"data": {
			"type": "SECRET_ACTION_COMPLETE"
		},
		"$$type": "scxml",
		"type": "external"
	},
	"context": {
		"score": {
			"eastwest": 0,
			"northsouth": 0
		},
		"eventCount": 1,
		"previousEventCount": 0,
		"currentDealer": "north",
		"private_hands": {
			"north": [{
				"rank": "K",
				"suit": "S"
			}, {
				"rank": "A",
				"suit": "D"
			}, {
				"rank": "K",
				"suit": "D"
			}, {
				"rank": "J",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "S"
			}, {
				"rank": "10",
				"suit": "S"
			}],
			"south": [{
				"rank": "9",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "C"
			}, {
				"rank": "10",
				"suit": "H"
			}, {
				"rank": "10",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "H"
			}, {
				"rank": "Q",
				"suit": "H"
			}],
			"east": [{
				"rank": "10",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "D"
			}, {
				"rank": "J",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "C"
			}, {
				"rank": "Q",
				"suit": "S"
			}, {
				"rank": "J",
				"suit": "C"
			}],
			"west": [{
				"rank": "A",
				"suit": "H"
			}, {
				"rank": "Q",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "C"
			}, {
				"rank": "A",
				"suit": "C"
			}, {
				"rank": "K",
				"suit": "H"
			}, {
				"rank": "A",
				"suit": "S"
			}]
		},
		"awaitedPlayer": "east",
		"bids": {
			"north": null,
			"south": null,
			"east": null,
			"west": null
		}
	}
}`);

export const NameTrump = JSON.parse(`
{
	"actions": [],
	"value": {
		"runGame": {
			"round": {
				"bidding": "waitForPlayerToNameTrump"
			}
		}
	},
	"context": {
		"score": {
			"eastwest": 37,
			"northsouth": -45
		},
		"eventCount": 1,
		"previousEventCount": 0,
		"currentDealer": "north",
		"private_hands": {
			"north": [{
				"rank": "K",
				"suit": "S"
			}, {
				"rank": "A",
				"suit": "D"
			}, {
				"rank": "K",
				"suit": "D"
			}, {
				"rank": "J",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "S"
			}, {
				"rank": "10",
				"suit": "S"
			}],
			"south": [{
				"rank": "9",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "C"
			}, {
				"rank": "10",
				"suit": "H"
			}, {
				"rank": "10",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "H"
			}, {
				"rank": "Q",
				"suit": "H"
			}],
			"east": [{
				"rank": "10",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "D"
			}, {
				"rank": "J",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "C"
			}, {
				"rank": "Q",
				"suit": "S"
			}, {
				"rank": "J",
				"suit": "C"
			}],
			"west": [{
				"rank": "A",
				"suit": "H"
			}, {
				"rank": "Q",
				"suit": "D"
			}, {
				"rank": "9",
				"suit": "C"
			}, {
				"rank": "A",
				"suit": "C"
			}, {
				"rank": "K",
				"suit": "H"
			}, {
				"rank": "A",
				"suit": "S"
			}]
		},
		"awaitedPlayer": "south",
		"bids": {
			"north": "pass",
			"south": 3,
			"east": 2,
			"west": "pass"
		}
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
	"event": {
		"type": "PLAYER_BID",
		"bid": "pass",
		"position": "north"
	}
}`);

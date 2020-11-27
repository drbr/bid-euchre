import { State } from 'xstate';
import { GameStateMachine } from '../gameLogic/stateMachine/GameStateMachine';
import { GameEvent } from '../gameLogic/stateMachine/GameStateTypes';

const events: GameEvent[] = [{ type: 'NEXT' }];

export function runIsolatedMachine() {
  console.log('Starting to run isolated machine transitions');

  const parsedState = JSON.parse(waitForPlayerToBidState);
  const hydratedState = GameStateMachine.resolveState(
    State.create(parsedState)
  );
  let state = hydratedState;

  state.toJSON();

  console.log('Starting at state:');
  console.log(state);

  for (const e of events) {
    console.log('Applying event:');
    console.log(e);
    state = GameStateMachine.transition(state, e);
    console.log('Arrived at state:');
    console.log(state);
  }

  console.log('Finished running isolated machine transitions');
}

// This state gets fed into the transaction function the second time,
// but the machine transitions it to `gotBidFromSetup`. It should transition
// to `waitForPlayerToBid`.
const waitForPlayerToBidState = `
{
	"actions": [],
	"activities": {},
	"meta": {},
	"events": [],
	"value": {
		"runGame": {
			"round": {
				"bidding": "waitForPlayerToBid"
			}
		},
		"recordEvents": {}
	},
	"context": {
		"score": {
			"eastwest": 0,
			"northsouth": 0
		},
		"eventCount": 1,
		"currentDealer": "north",
		"hands": {
			"north": [{
				"rank": "J",
				"suit": "C"
			}, {
				"rank": "9",
				"suit": "H"
			}, {
				"rank": "A",
				"suit": "H"
			}, {
				"rank": "10",
				"suit": "S"
			}, {
				"rank": "A",
				"suit": "C"
			}, {
				"rank": "9",
				"suit": "S"
			}],
			"south": [{
				"rank": "J",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "C"
			}, {
				"rank": "A",
				"suit": "D"
			}, {
				"rank": "10",
				"suit": "C"
			}, {
				"rank": "A",
				"suit": "S"
			}],
			"east": [{
				"rank": "9",
				"suit": "D"
			}, {
				"rank": "Q",
				"suit": "C"
			}, {
				"rank": "J",
				"suit": "S"
			}, {
				"rank": "Q",
				"suit": "H"
			}, {
				"rank": "Q",
				"suit": "S"
			}, {
				"rank": "J",
				"suit": "D"
			}],
			"west": [{
				"rank": "Q",
				"suit": "D"
			}, {
				"rank": "10",
				"suit": "H"
			}, {
				"rank": "K",
				"suit": "S"
			}, {
				"rank": "9",
				"suit": "C"
			}, {
				"rank": "10",
				"suit": "D"
			}, {
				"rank": "K",
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
		"name": "NEXT",
		"data": {
			"type": "NEXT"
		},
		"$$type": "scxml",
		"type": "external"
	},
	"_sessionid": null,
	"event": {
		"type": "NEXT"
	},
	"historyValue": {
		"current": {
			"recordEvents": {},
			"runGame": {
				"round": "dealHands"
			}
		},
		"states": {
			"runGame": {
				"current": {
					"round": "dealHands"
				},
				"states": {
					"round": {
						"current": "dealHands",
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
	"history": {
		"actions": [],
		"activities": {},
		"meta": {},
		"events": [],
		"value": {
			"runGame": "setup",
			"recordEvents": {}
		},
		"context": {
			"score": {
				"eastwest": 0,
				"northsouth": 0
			},
			"eventCount": 0
		},
		"_event": {
			"name": "xstate.init",
			"data": {
				"type": "xstate.init"
			},
			"$$type": "scxml",
			"type": "external"
		},
		"_sessionid": null,
		"event": {
			"type": "xstate.init"
		},
		"children": {},
		"done": false
	},
	"children": {},
	"done": false,
	"changed": true
}`;

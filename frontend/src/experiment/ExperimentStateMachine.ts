import {
  ActionFunction,
  ActionFunctionMap,
  assign,
  Machine,
  ServiceConfig,
} from 'xstate';
import { TypedStateSchema } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';

export type ExperimentContext = {
  value: number;
  events: ReadonlyArray<ExperimentEvent>;
};

export type ExperimentMeta = unknown;

export type ExperimentStateSchema = {
  states: {
    recordEvents: TypedStateSchema<ExperimentMeta, ExperimentContext>;
    runExperiment: {
      states: {
        count: TypedStateSchema<ExperimentMeta, ExperimentContext>;
        initiateAsync: TypedStateSchema<ExperimentMeta, ExperimentContext>;
      };
    };
  };
};

export type ExperimentEvent =
  | { type: 'addOne'; value: undefined }
  | { type: 'subtractOne'; value: undefined }
  | { type: 'addX'; value: number }
  | { type: 'addOneDelayed'; value: undefined };

export const ExperimentActions: ActionFunctionMap<
  ExperimentContext,
  ExperimentEvent
> = {
  increment: assign({
    value: (context, event) => context.value + (event.value || 1),
  }),
  decrement: assign({
    value: (context, event) => context.value - (event.value || 1),
  }),
  addEventToContext: assign({
    events: (context, event) => (context.events || []).concat(event),
  }),
};

export const uiAlertAction: ActionFunction<
  ExperimentContext,
  ExperimentEvent
> = (context, event, meta) => {
  alert(meta.action.string);
};

export const ExperimentServices: Record<
  string,
  ServiceConfig<ExperimentContext, ExperimentEvent>
> = {};

export const ExperimentStateMachine = Machine<
  ExperimentContext,
  ExperimentStateSchema,
  ExperimentEvent
>(
  {
    id: 'experimentStateMachine',
    type: 'parallel',
    // strict: true,
    context: { value: 0, events: [] },
    states: {
      recordEvents: {
        // on: {
        //   '*': {
        //     actions: 'addEventToContext',
        //   },
        // },
      },
      runExperiment: {
        initial: 'count',
        states: {
          count: {
            on: {
              addOne: {
                target: 'count',
                actions: 'increment',
              },
              subtractOne: {
                target: 'count',
                actions: [
                  'decrement',
                  {
                    type: 'uiAlertEffect',
                    string: 'Decrement transition via UI Alert Effect',
                  },
                ],
              },
              addX: {
                target: 'count',
                cond: (context, event) => event.value >= 3,
                actions: ['increment'],
              },
              addOneDelayed: 'initiateAsync',
            },
          },
          initiateAsync: {
            invoke: {
              src: () => new Promise((resolve) => setTimeout(resolve, 500)),
              onDone: { target: 'count', actions: 'increment' },
            },
          },
        },
      },
    },
  },
  {
    actions: ExperimentActions,
    services: ExperimentServices,
  }
);

// const initial = ExperimentStateMachine.initialState;
// const maybeIncremented = ExperimentStateMachine.transition(
//   initial,
//   ('eventHasNoEffect' as unknown) as ExperimentEvent
// );
// console.log('Are the states the same?');
// console.log(`Objects: ${initial === maybeIncremented}`);
// console.log(
//   `JSON: ${JSON.stringify(initial) === JSON.stringify(maybeIncremented)}`
// );

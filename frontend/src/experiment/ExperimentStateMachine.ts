import {
  ActionFunction,
  ActionFunctionMap,
  assign,
  Machine,
  ServiceConfig,
} from 'xstate';
import { TypedStateSchema } from '../gameLogic/stateMachine/TypedStateInterfaces';

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
      };
    };
  };
};

export type ExperimentEvent = { type: 'addOne' } | { type: 'subtractOne' };

export const ExperimentActions: ActionFunctionMap<
  ExperimentContext,
  ExperimentEvent
> = {
  increment: assign({
    value: (context) => context.value + 1,
  }),
  decrement: assign({
    value: (context) => context.value - 1,
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
    id: 'experimentalStateMachine',
    type: 'parallel',
    strict: true,
    context: { value: 0, events: [] },
    states: {
      recordEvents: {
        on: {
          '*': {
            actions: 'addEventToContext',
          },
        },
      },
      runExperiment: {
        initial: 'count',
        states: {
          count: {
            on: {
              addOne: {
                target: 'count',
                actions: ['increment'],
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

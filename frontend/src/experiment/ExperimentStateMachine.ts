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
};

export type ExperimentMeta = unknown;

export type ExperimentStateSchema = {
  states: {
    count: TypedStateSchema<ExperimentMeta, ExperimentContext>;
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
    initial: 'count',
    context: { value: 0 },
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
  {
    actions: ExperimentActions,
    services: ExperimentServices,
  }
);

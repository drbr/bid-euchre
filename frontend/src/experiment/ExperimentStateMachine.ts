import { ActionFunctionMap, assign, Machine } from 'xstate';
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

export type ExperimentEvent = { type: 'poke' };

export const ExperimentActions: ActionFunctionMap<
  ExperimentContext,
  ExperimentEvent
> = {
  increment: assign({
    value: (context) => context.value + 1,
  }),
};

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
          poke: {
            target: 'count',
            actions: 'increment',
          },
        },
      },
    },
  },
  {
    actions: ExperimentActions,
  }
);

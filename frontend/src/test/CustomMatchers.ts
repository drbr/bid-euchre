import { State, StateValue } from 'xstate';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchErrorMessage(message: RegExp): R;
      toMatchState(parentState: StateValue): R;
    }
  }
}

expect.extend({
  toMatchErrorMessage(received: unknown, message: RegExp) {
    if (!(received instanceof Error)) {
      throw new Error(`Expected ${JSON.stringify(received)} to be an Error`);
    }

    if (message.test(received.message)) {
      return {
        message: () => `expected ${received.message} not to match ${message}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received.message} to match ${message}`,
        pass: false,
      };
    }
  },
  toMatchState(received: State<unknown>, expected: StateValue) {
    const matches = received.matches(expected);
    const receivedValue = JSON.stringify(received.value);
    const expectedValue = JSON.stringify(expected);
    if (matches) {
      return {
        message: () =>
          `expected state value ${receivedValue} not to match ${expectedValue}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected state value ${receivedValue} to match ${expectedValue}`,
        pass: false,
      };
    }
  },
});

export {};

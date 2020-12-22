declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchErrorMessage(message: RegExp): R;
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
});

export {};

/**
 * An implementation of the "deferred" pattern, as seen in many promise libraries.
 */
export class SimpleDeferred<TResult> {
  private _promise: Promise<TResult>;
  private _resolve!: (result: TResult | PromiseLike<TResult>) => void;
  private _reject!: (reason: unknown) => void;

  constructor() {
    this._promise = new Promise<TResult>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public get promise() {
    return this._promise;
  }

  public get resolve() {
    return this._resolve;
  }

  public get reject() {
    return this._reject;
  }
}

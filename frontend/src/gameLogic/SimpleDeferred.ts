/**
 * An implementation of the "deferred" pattern, as seen in many promise libraries.
 */
export class SimpleDeferred<TResult> {
  public readonly promise: Promise<TResult>;

  private _resolve!: (result: TResult | PromiseLike<TResult>) => void;
  private _reject!: (reason: unknown) => void;

  constructor() {
    this.promise = new Promise<TResult>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  public get resolve() {
    return this._resolve;
  }

  public get reject() {
    return this._reject;
  }
}

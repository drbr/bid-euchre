import { database } from 'firebase-admin';

export type TypedDataSnapshot<T> = database.DataSnapshot & {
  exportVal(): T;
  val(): T;
};

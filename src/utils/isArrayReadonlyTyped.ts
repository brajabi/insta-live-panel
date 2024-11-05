export const isArrayReadonlyTyped = <T>(
  val: Readonly<T> | ReadonlyArray<T>,
): val is ReadonlyArray<T> => Array.isArray(val)

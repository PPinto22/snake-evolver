export function choice<T>(s: Array<T>): T | undefined {
  if (s.length === 0) return;

  const random_i = Math.floor(Math.random() * s.length);
  return s[random_i];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Returns a pair [index, value] of the max element in an array
export function max(arr: number[]): [number, number] | undefined {
  if (arr.length === 0) return;
  var max = arr[0];
  var maxIndex = 0;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return [maxIndex, max];
}

// Multiplies each value in arr1 with arr2
export function multiply(arr1: number[], arr2: number[]): number[] | undefined {
  if (arr1.length !== arr2.length) return;
  return arr1.map((value, index) => value * arr2[index]);
}

// Execute a function and measure the elapsed time in milliseconds
export function time<T>(f: () => T): [T, number] {
  const start = new Date().getTime();
  const result = f();
  const end = new Date().getTime();
  const elapsed = end - start;
  return [result, elapsed];
}

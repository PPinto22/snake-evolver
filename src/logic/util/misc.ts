import seedrandom from "seedrandom";

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

export function sum(arr: number[]): number {
  let sum = 0;
  arr.forEach((num) => (sum += num));
  return sum;
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

// Source: https://www.sitepoint.com/javascript-generate-lighter-darker-color/
export function generateColor(seed?: string) {
  const rng = seedrandom(seed?.toString());
  var lum = -0.20;
  var hex = String('#' + rng().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var rgb = "#",
      c, i;
  for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
  }
  return rgb;
}
export function choice<T>(s: Array<T>): T | null {
  if(s.length === 0) return null;
  
  const random_i = Math.floor(Math.random() * s.length);
  return s[random_i];
}
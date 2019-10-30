export function flatten(values: any[]): unknown[] {
  return values.reduce((a, b) => {
    return a.concat(b);
  }, []);
}

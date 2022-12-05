export default (value: string): string =>
  value.toLowerCase().replace(/(\s|^)\w/g, (str) => str.toUpperCase());

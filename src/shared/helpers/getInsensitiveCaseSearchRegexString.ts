export const getInsensitiveCaseSearchRegexString = (string: string) => {
  return new RegExp(`.*${string}.*`, 'i');
};

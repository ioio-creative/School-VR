import stricterParseInt from './stricterParseInt';

const isStrAnInt = (str) => {
  const parseResult = stricterParseInt(str);
  //return parseResult !== NaN;  // note this always return true
  return !Number.isNaN(parseResult);
}

export default isStrAnInt;
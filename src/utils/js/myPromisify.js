// https://medium.com/better-programming/why-coding-your-own-makes-you-a-better-developer-5c53439c5e4a
// const promisifyForFuncThatOnlyHasCallBackAsArgument = (functionWithCallBack) => {
//   return _ => new Promise((resolve, reject) => {
//     functionWithCallBack((err, result) => {
//       return err ? reject(err) : resolve(result);
//     });
//   });
// }

const promisify = (functionWithCallBack) => {
  return function() {
    const simulatedCallBack = (resolve, reject) => {
      return (err, result) => {
        return err ? reject(err) : resolve(result);
      }
    }
    let argumentsForFunc = [];
    if (arguments.length > 0) {
      argumentsForFunc = Array.prototype.slice.call(arguments);
    }
    return new Promise((resolve, reject) => {
      argumentsForFunc.push(simulatedCallBack(resolve, reject));
      functionWithCallBack(...argumentsForFunc);
    });
  }
}

export default promisify;
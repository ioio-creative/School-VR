// https://medium.com/better-programming/why-coding-your-own-makes-you-a-better-developer-5c53439c5e4a
const promisifyForFuncThatOnlyHasCallBackAsArgument = (functionWithCallback) => {
  return _ => new Promise((resolve, reject) => {
    functionWithCallback((err, result) => {
      return err ? reject(err) : resolve(result);
    });
  });
}

export {
  promisifyForFuncThatOnlyHasCallBackAsArgument
};
const funcFactoryForCompareFileStatsByProperty = (fileStatPropSelectFunc, isOrderByDesc = false) => {
  return (fileStat1, fileStat2) => {
    let valueToReturn = 0;

    const [fileStat1Prop, fileStat2Prop] = [fileStat1, fileStat2].map(fileStat => fileStatPropSelectFunc(fileStat));    
    if (fileStat1Prop < fileStat2Prop) {
      valueToReturn = -1;
    } else if (fileStat1Prop > fileStat2Prop) {
      valueToReturn = 1;
    } else {
      valueToReturn = 0;
    }

    return isOrderByDesc ? -1 * valueToReturn : valueToReturn;
  };
};


export {  
  funcFactoryForCompareFileStatsByProperty
};
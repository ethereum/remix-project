import { execution } from '@remix-project/remix-lib';

const { txFormat: { parseFunctionParams }, txHelper: { encodeFunctionId, encodeParams: encodeParamsHelper } } = execution

const buildData = (funAbi: any, params: string) => {
  let funArgs = [];
  let data: Buffer | string = '';
  let dataHex = '';

  if (params.indexOf('raw:0x') === 0) {
    // in that case we consider that the input is already encoded and *does not* contain the method signature
    dataHex = params.replace('raw:0x', '');
    data = Buffer.from(dataHex, 'hex');
  } else {
    try {
      if (params.length > 0) {
        funArgs = parseFunctionParams(params);
      }
    } catch (e) {
      return { error: 'Error encoding arguments: ' + e };
    }
    try {
      data = encodeParamsHelper(funAbi, funArgs);
      dataHex = data.toString();
    } catch (e) {
      return { error: 'Error encoding arguments: ' + e };
    }
    if (data.slice(0, 9) === 'undefined') {
      dataHex = data.slice(9);
    }
    if (data.slice(0, 2) === '0x') {
      dataHex = data.slice(2);
    }
  }

  dataHex = encodeFunctionId(funAbi) + dataHex;

  return { dataHex };
};

export default buildData;

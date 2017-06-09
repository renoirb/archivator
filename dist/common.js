'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.handleIndexSourceErrors=exports.prepareListGenerator=exports.parseCsvLine=exports.coroutine=exports.readLines=undefined;var _fs=require('fs');var _fs2=_interopRequireDefault(_fs);var _path=require('path');var _path2=_interopRequireDefault(_path);var _genReadlines=require('gen-readlines');var _genReadlines2=_interopRequireDefault(_genReadlines);var _slugs=require('./normalizer/slugs');var _slugs2=_interopRequireDefault(_slugs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}/**
 * Co Routine - A Generator factory helper
 *
 * Pass a Generator closure and Immediately Invoke that helper
 * so that we can iterate using generators as async handlers.
 *
 * This pattern is used so we can use generators as async consumers
 * or as async handlers.
 */function coroutine(gen){return function coroutineHandler(...args){const g=gen(...args);g.next();return g}}function*readLines(path){const fd=_fs2.default.openSync(path,'r');const stats=_fs2.default.fstatSync(fd);for(const line of(0,_genReadlines2.default)(fd,stats.size)){yield parseCsvLine(line.toString())}_fs2.default.closeSync(fd)}function*prepareListGenerator(urls){for(const line of urls){yield parseCsvLine(line)}}function parseCsvLine(line){const[url,selector='',truncate='']=line.split(';');const slug=(0,_slugs2.default)(url);return{url,slug,selector,truncate}}function handleIndexSourceErrors(errorObj){if(errorObj.code==='ENOENT'&&Boolean(errorObj.path)){const dirName=_path2.default.dirname(errorObj.path);_fs2.default.createDirectory(dirName);const fileContents='http://renoirb.com;#contents;';const msg=`File "${errorObj.path}" did not exist, we created one. Try again.`;_fs2.default.writeTextFile(errorObj.path,fileContents,'utf8');throw new Error(msg)}// Handle error codes below #TODO
// if (errorObj.code === 'ENOTFOUND')
console.error('handleIndexSourceErrors',errorObj)}exports.readLines=readLines;exports.coroutine=coroutine;exports.parseCsvLine=parseCsvLine;exports.prepareListGenerator=prepareListGenerator;exports.handleIndexSourceErrors=handleIndexSourceErrors;
//# sourceMappingURL=common.js.map
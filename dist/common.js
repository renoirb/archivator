'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports.cheerioLoad=exports.figureOutTruncateAndSelector=exports.handleIndexSourceErrors=exports.parseCsvLine=exports.coroutine=exports.readLines=exports.readCached=undefined;let readCached=(()=>{var _ref=_asyncToGenerator(function*(file){try{const data=yield fsa.readFile(file,'utf8');return data}catch(err){readCachedError(err);return{}}});return function readCached(_x){return _ref.apply(this,arguments)}})();// Make possible to do extractLinks, markdownify, ... in parallel TODO
let cheerioLoad=(()=>{var _ref2=_asyncToGenerator(function*(recv,configObj={}){return new Promise(function(resolve){return resolve(_cheerio2.default.load(recv,configObj))})});return function cheerioLoad(_x2){return _ref2.apply(this,arguments)}})();/**
 * Given every row in source file .csv
 * http://example.org/a/b.html;selector;truncate
 *
 * selector is the CSS selector where the main content is
 * truncate is a list of CSS selectors to strip off
 */var _fs=require('fs');var _fs2=_interopRequireDefault(_fs);var _path=require('path');var _path2=_interopRequireDefault(_path);var _cheerio=require('cheerio');var _cheerio2=_interopRequireDefault(_cheerio);var _asyncFile=require('async-file');var fsa=_interopRequireWildcard(_asyncFile);var _genReadlines=require('gen-readlines');var _genReadlines2=_interopRequireDefault(_genReadlines);var _slugs=require('./normalizer/slugs');var _slugs2=_interopRequireDefault(_slugs);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step('next',value)},function(err){step('throw',err)})}}return step('next')})}}/**
 * Co Routine - A Generator factory helper
 *
 * Pass a Generator closure and Immediately Invoke that helper
 * so that we can iterate using generators as async handlers.
 *
 * This pattern is used so we can use generators as async consumers
 * or as async handlers.
 */function coroutine(gen){return function coroutineHandler(...args){const g=gen(...args);g.next();return g}}function*readLines(path){const fd=_fs2.default.openSync(path,'r');const stats=_fs2.default.fstatSync(fd);for(const line of(0,_genReadlines2.default)(fd,stats.size)){yield parseCsvLine(line.toString())}_fs2.default.closeSync(fd)}function parseCsvLine(line){const[url,selector='',truncate='']=line.split(';');const slug=(0,_slugs2.default)(url);return{url,slug,selector,truncate}}function handleIndexSourceErrors(errorObj){if(errorObj.code==='ENOENT'&&Boolean(errorObj.path)){const dirName=_path2.default.dirname(errorObj.path);_fs2.default.createDirectory(dirName);const fileContents='http://renoirb.com;#contents;';const msg=`File "${errorObj.path}" did not exist, we created one. Try again.`;_fs2.default.writeTextFile(errorObj.path,fileContents,'utf8');throw new Error(msg)}// Handle error codes below #TODO
// if (errorObj.code === 'ENOTFOUND')
console.error('handleIndexSourceErrors',errorObj)}function readCachedError(errorObj){// Handle error codes below #TODO
switch(errorObj.code){case'ENOENT':// ENOENT: no such file or directory, open '...' Handle differently? #TODO
console.error(`readCachedError: Could not access file at "${errorObj.path}"`);break;default:console.error(`readCachedError: ${errorObj.message}`);break;}}function figureOutTruncateAndSelector(sourceArgument){// If we know exactly where the main content is, otherwise grab the whole
// document body.
const selector=sourceArgument.selector.length===0?'body':`${sourceArgument.selector}`;// Truncate is to strip off any patterns we do not want
// as part of our archived article.
let truncate=sourceArgument.truncate.length===0?'':`${sourceArgument.truncate},`;truncate+='script,style,noscript';return{selector,truncate}}exports.readCached=readCached;exports.readLines=readLines;exports.coroutine=coroutine;exports.parseCsvLine=parseCsvLine;exports.handleIndexSourceErrors=handleIndexSourceErrors;exports.figureOutTruncateAndSelector=figureOutTruncateAndSelector;exports.cheerioLoad=cheerioLoad;
//# sourceMappingURL=common.js.map
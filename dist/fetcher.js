'use strict';/**
 * Archivator
 *
 * Archive URLs into text files
 *
 * Big thanks to https://hackernoon.com/an-ode-to-async-await-7da2dd3c2056#.heq66t6kh
 *
 * * https://github.com/bitinn/node-fetch
 * * https://github.com/cheeriojs/cheerio
 * * https://github.com/davetemplin/async-file
 * * https://github.com/kriasoft/babel-starter-kit/blob/master/package.json
 */Object.defineProperty(exports,'__esModule',{value:true});let handleDocument=(()=>{var _ref=_asyncToGenerator(function*(recv){return recv.text().then(function(payload){return _cheerio2.default.load(payload)}).then(function(shard){return shard.html()})});return function handleDocument(_x){return _ref.apply(this,arguments)}})();let fetchDocument=(()=>{var _ref2=_asyncToGenerator(function*(url){return(0,_nodeFetch2.default)(url).catch(fetchDocumentError)});return function fetchDocument(_x2){return _ref2.apply(this,arguments)}})();let cache=(()=>{var _ref3=_asyncToGenerator(function*(listArchivable){const processed={ok:[],failed:[]};// eslint-disable-line prefer-const
for(const archivable of listArchivable){const dirName=`archive/${archivable.slug}`;// Make parent folder configurable #TODO
const fileName=`${dirName}/cache.html`;yield fs.createDirectory(dirName);if((yield fs.exists(fileName))===false){const response=yield fetchDocument(archivable.url);if(response.ok===true){processed.ok.push(archivable.url);const pageSnippet=yield handleDocument(response);yield fs.writeTextFile(fileName,pageSnippet,'utf8');console.info(`Archived ${fileName}`)}else{processed.failed.push(archivable.url);console.info(`Had problem with ${archivable.url}`)}}else{console.info(`Already exists ${fileName}`)}}});return function cache(_x3){return _ref3.apply(this,arguments)}})();let fetcher=(()=>{var _ref4=_asyncToGenerator(function*(list){yield cache(list);console.log(`Done fetching.\n\n`);return Promise.all(list)});return function fetcher(_x4){return _ref4.apply(this,arguments)}})();var _cheerio=require('cheerio');var _cheerio2=_interopRequireDefault(_cheerio);var _nodeFetch=require('node-fetch');var _nodeFetch2=_interopRequireDefault(_nodeFetch);var _asyncFile=require('async-file');var fs=_interopRequireWildcard(_asyncFile);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step('next',value)},function(err){step('throw',err)})}}return step('next')})}}function fetchDocumentError(errorObj){// Handle error codes below #TODO
// if (errorObj.code === 'ETIMEDOUT')
// if (errorObj.code === 'ENETUNREACH')
console.error(`fetchDocumentError (code ${errorObj.code}: ${errorObj.message}`);return{ok:false}}exports.default=fetcher;
//# sourceMappingURL=fetcher.js.map
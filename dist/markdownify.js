'use strict';let markdownify=(()=>{var _ref=_asyncToGenerator(function*(descriptor){const html=descriptor.cache;const assets=descriptor.assets.assets;const source=descriptor.source;return(0,_common.cheerioLoad)(html,cheerioConfig).then(function(shard){/**
               * Each references dictionary should look like this;
               * ```
               * { 'http://example.org/a.png': '6c65613db26a19d838c0359989f941c303c04474.png',
               *   'http://example.org/a.webm': '5c737acd98c723bbed666bbfb3d14a8e0d34266b.webm' }
               * ```
               */const references=Object.create(null);assets.forEach(function(ref){references[ref.match]=ref.name});return{references,shard}}).then(function({references,shard}){shard('img[src]').each(function(_,element){/**
                   * What we receive looks like this;
                   * ```
                   * { '_': 0,
                   *   'element':
                   *    { type: 'tag',
                   *      name: 'img',
                   *      attribs:
                   *       { src: 'http://example.org/a.png',
                   *         alt: 'A Image Alt text',
                   *         class: 'example img class-name list' },
                   *      children: [],
                   *      next: null,
                   *      prev: {},
                   *      parent: {} } }
                   * ```
                   */shard(element).attr('class',null);const src=shard(element).attr('src');/**
                   * Assuming our references object (see above) has a key
                   * (e.g. http://example.org/a.png) with a matching
                   * value (e.g. 6c65613db26a19d838c0359989f941c303c04474.png)
                   * we replace the img[src] value with it.
                   * That way, our Markdownified file will refer to archived
                   * assets beside it instead of ones from source origin.
                   */const newSrc=typeof references[src]==='string'?references[src]:src+'?err=CouldNotFind';shard(element).attr('src',newSrc)});return shard}).then(function(shard){const{selector,truncate}=(0,_common.figureOutTruncateAndSelector)(source);const title=shard('title').text();shard(truncate).remove();const body=shard(selector).html();const frontMatter={title};return{meta:frontMatter,body}}).then(function(simplified){const dto=[];const meta=simplified.meta;for(const key in meta){if(Object.prototype.hasOwnProperty.call(meta,key)){dto.push(`${key}: "${meta[key]}"`)}}const top=dto.join(`\n`);const bottom=(0,_htmlMd2.default)(simplified.body);return`${top}\n\n---\n\n${bottom}\n`})});return function markdownify(_x){return _ref.apply(this,arguments)}})();let handle=(()=>{var _ref2=_asyncToGenerator(function*(descriptor){const fileName=descriptor.file.name;if(descriptor.file.exists===false||descriptor.file.exists===true&&descriptor.file.overwrite===true){const source=descriptor.source;let contents='';if(Object.prototype.hasOwnProperty.call(descriptor.analyze||{},'keywords')){const keywords=Object.keys(descriptor.analyze.keywords);contents+=`keywords: [${keywords}]\n`}contents+=`url: "${source.url}"\n`;const markdownified=yield markdownify(descriptor);contents+=markdownified;return{fileName,contents}}});return function handle(_x2){return _ref2.apply(this,arguments)}})();let writeTextFile=(()=>{var _ref3=_asyncToGenerator(function*({fileName,contents}){yield fsa.writeTextFile(fileName,contents,'utf8')});return function writeTextFile(_x3){return _ref3.apply(this,arguments)}})();let read=(()=>{var _ref4=_asyncToGenerator(function*(source,overwriteOption){const path=`archive/${source.slug}`;const data=Object.create(null);data.source=source;const cacheFile=`${path}/cache.html`;const cacheExists=yield fsa.exists(cacheFile);if(cacheExists){data.cache=yield(0,_common.readCached)(cacheFile)}const assetsFile=`${path}/assets.json`;const assetsExists=yield fsa.exists(assetsFile);if(assetsExists){const assetsFileContents=yield(0,_common.readCached)(assetsFile);data.assets=JSON.parse(assetsFileContents)}const analyzeFile=`${path}/analyze.json`;const analyzeExists=yield fsa.exists(analyzeFile);if(analyzeExists){const analyzeFileContents=yield(0,_common.readCached)(analyzeFile);data.analyze=JSON.parse(analyzeFileContents)}const targetFileName=`${path}/index.md`;const markdownifiedExists=yield fsa.exists(targetFileName);data.file={exists:markdownifiedExists,name:targetFileName,overwrite:overwriteOption};console.log(`Markdownifying ${data.file.name}`);return data});return function read(_x4,_x5){return _ref4.apply(this,arguments)}})();/**
 * Something is going somewhat as an anti-pattern here.
 * We want Promise.all(...) at each step, and it's not how
 * it is as of now. Needs rework here. TODO
 */var _asyncFile=require('async-file');var fsa=_interopRequireWildcard(_asyncFile);var _htmlMd=require('html-md-2');var _htmlMd2=_interopRequireDefault(_htmlMd);var _common=require('./common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step('next',value)},function(err){step('throw',err)})}}return step('next')})}}const cheerioConfig={normalizeWhitespace:true,xmlMode:false,decodeEntities:true};const URL_LIST='archive/index.csv';const OVERWRITE=true;for(const url of(0,_common.readLines)(URL_LIST)){Promise.resolve(url).then(u=>read(u,OVERWRITE)).then(descriptor=>handle(descriptor)).then(descriptor=>handle(descriptor)).then(handled=>writeTextFile(handled)).catch(_common.handleIndexSourceErrors)}
//# sourceMappingURL=markdownify.js.map
'use strict';/**
 * Transformer
 *
 * Read cached HTML files, transform them so we get only the main content
 */// cheerio, or https://github.com/lapwinglabs/x-ray
// http://noodlejs.com/#Overview
Object.defineProperty(exports,'__esModule',{value:true});let extractLinks=(()=>{var _ref=_asyncToGenerator(function*(recv,source){const p=new Promise(function(resolve){return resolve(_cheerio2.default.load(recv,{}))});return p.then(function(shard){const{selector,truncate}=figureOutTruncateAndSelector(source);shard(truncate).remove();shard(selector);const links=[];shard('a[href]').each(function(_,element){const href=shard(element).attr('href');try{const hrefObj=new _url.URL(href);links.push(`${hrefObj.origin}${hrefObj.pathname}`)}catch(err){}});return links})});return function extractLinks(_x,_x2){return _ref.apply(this,arguments)}})();let markdownify=(()=>{var _ref2=_asyncToGenerator(function*(recv,source){const p=new Promise(function(resolve){return resolve(_cheerio2.default.load(recv,{}))});return p.then(function(shard){const{selector,truncate}=figureOutTruncateAndSelector(source);const title=shard('title').text();shard(truncate).remove();const body=shard(selector).html();const frontMatter={title};return{meta:frontMatter,body}}).then(function(simplified){const dto=[];const meta=simplified.meta;for(const key in meta){if(Object.prototype.hasOwnProperty.call(meta,key)){dto.push(`${key}: "${meta[key]}"`)}}const top=dto.join(`\n`);const bottom=(0,_htmlMd2.default)(simplified.body);return`${top}\n\n---\n\n${bottom}\n`})});return function markdownify(_x3,_x4){return _ref2.apply(this,arguments)}})();let reworkAssetReference=(()=>{var _ref3=_asyncToGenerator(function*(body,assets){const p=new Promise(function(resolve){return resolve(_cheerio2.default.load(body,cheerioConfig))});return p.then(function(shard){/**
     * Each references dictionary should look like this;
     * ```
     * { 'http://example.org/a.png': '6c65613db26a19d838c0359989f941c303c04474.png',
     *   'http://example.org/a.webm': '5c737acd98c723bbed666bbfb3d14a8e0d34266b.webm' }
     * ```
     */const references={};assets.forEach(function(ref){references[ref.match]=ref.name});return{references,shard}}).then(function({references,shard}){shard('img[src]').each(function(_,element){/**
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
       */const newSrc=typeof references[src]==='string'?references[src]:src+'?err=CouldNotFind';shard(element).attr('src',newSrc)});return shard.html()})});return function reworkAssetReference(_x5,_x6){return _ref3.apply(this,arguments)}})();let extractAssets=(()=>{var _ref4=_asyncToGenerator(function*(recv){const p=new Promise(function(resolve){return resolve(_cheerio2.default.load(recv,cheerioConfig))});return p.then(function(shard){// We do not need duplicates
const s=new Set;/**
     * Iterate with other types of assets.
     * TODO
     */shard('body img[src]').each(function(_,element){const potential=shard(element).attr('src');// or is in a blacklist?
const isInlineImage=/;base64,/.test(potential);if(isInlineImage===false){s.add(potential)}});// We can return an Array once done
return[...s]})});return function extractAssets(_x7){return _ref4.apply(this,arguments)}})();/**
 * Rework each asset so we can prepare to fetch
 *
 * Input is a list of resources in many possible format
 *
 * e.g.
 * matches = [ "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg"
 *            ,"https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
 *            ,"https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
 *            ,"//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500"
 *            ,"/wp-content/themes/renoirb/assets/img/zce_logo.jpg" ]
 *
 * source = { url: "http://renoirboulanger.com/page/3/"
 *               ,slug: 'renoirboulanger.com/page/3"}
 *
 * Running handleAssets(matches, source) gives us a cleaned up list of assets where is a good guess
 * the asset might be found so we can make a copy and archive it.
 *
 * Notice:
 * - Each dest file are hashes with extension
 * - Gravatar sample started by //, and below, at src value, we'll have over http
 * - zce_logo.png is in /wp-content/..., but below at src value, it's on renoirboulanger.com
 *
 * e.g.
 * {
 *   "assets": [{
 *     "src": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *     "match": "http://renoirboulanger.com/wp-content/themes/twentyseventeen/assets/images/header.jpg",
 *     "dest": "renoirboulanger.com/page/3/430e2156af17010e0d8ffcd726a95595fa71a4fd.jpg"
 *   },{
 *     "src": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *     "match": "https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png",
 *     "dest": "renoirboulanger.com/page/3/b41de0a18bbb0871b22e0f5c466b3cd2f498807d.png"
 *   },{
 *     "src": "http://www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *     "match": "//www.gravatar.com/avatar/cbf8c9036c204fe85e15155f9d70faec?s=500",
 *     "dest": "renoirboulanger.com/page/3/63dc122dfd3c702e12714fbe4ba744e463c49edb"
 *   },{
 *     "src": "http://renoirboulanger.com/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *     "match": "/wp-content/themes/renoirb/assets/img/zce_logo.jpg",
 *     "dest": "renoirboulanger.com/page/3/840257d7de220958ca4cc05a3c0ee337e2b0401d.jpg"
 *   }]
 * }
 */let handleAssets=(()=>{var _ref5=_asyncToGenerator(function*(matches,source){// console.log('handleAssets', [matches, source]); // DEBUG
const p=new Promise(function(resolve){return resolve(matches)});return p.then(function(m){const reduced=[];m.forEach(function(match){const src=(0,_assets2.default)(source.url,match);const name=(0,_hash2.default)(src);const dest=`${source.slug}/${name}`;reduced.push({src,match,dest,name})});return reduced})});return function handleAssets(_x8,_x9){return _ref5.apply(this,arguments)}})();let downloadAssets=(()=>{var _ref6=_asyncToGenerator(function*(assets){console.log(`    assets:`);console.log(`      length: ${assets.length}`);if(assets.length>0){console.log(`      matches:`);for(const asset of assets){// if (asset.src) is in blacklist #TODO
const assetSrcOrigin=new _url.URL(asset.src);if(domainsBlacklist.includes(assetSrcOrigin.hostname)===false){yield download(asset).catch(downloadError)}}}console.log(`\n`)});return function downloadAssets(_x10){return _ref6.apply(this,arguments)}})();let download=(()=>{var _ref7=_asyncToGenerator(function*({src,dest}){const fileName=`archive/${dest}`;// Make parent folder configurable #TODO
const fileExists=yield fs.exists(fileName);console.log(`      - src: ${src}`);if(fileExists===false){// Should we pass a User-Agent string? #TODO
// ... and a Referrer. As if we downloaded it from a UA?
const recv=yield(0,_nodeFetch2.default)(src);if(recv.ok===true){console.log(`        dest: ${fileName}`);const dest=fs.createWriteStream(fileName);recv.body.pipe(dest);console.log(`        status: OK`)}else{console.log(`        status: ERR, could not download.`)}}});return function download(_x11){return _ref7.apply(this,arguments)}})();let main=(()=>{var _ref8=_asyncToGenerator(function*(sourceList){for(const source of sourceList){console.log(`  ----`);try{const cachedFilePath=`archive/${source.slug}`;// Make parent folder configurable #TODO
const cachedFileName=`${cachedFilePath}/cache.html`;const cached=yield(0,_common.readCached)(cachedFileName);const matches=yield extractAssets(cached);const assets=yield handleAssets(matches,source);const links=yield extractLinks(cached,source);const cacheJsonRepresentation={source,assets,links};// cacheJsonRepresentation.matches = matches; // DEBUG
const cacheJsonFile=`${cachedFilePath}/cache.json`;if((yield fs.exists(cacheJsonFile))===false){yield fs.writeTextFile(cacheJsonFile,JSON.stringify(cacheJsonRepresentation),'utf8')}console.log(`  - source: ${source.url}`);console.log(`    path:   ${cachedFilePath}/`);// console.log(JSON.stringify(cacheJsonRepresentation));
yield downloadAssets(assets);// Hacky. For now. I'll fix this soon.
const markdownifiedFile=`${cachedFilePath}/index.md`;if((yield fs.exists(markdownifiedFile))===false){console.log(`  ... markdownifying\n\n`);let markdownified=`---\nurl: ${source.url}\n`;// This is heavy. Let's not do it unless we really want.
// Not sure we NEVER want to overwrite. Make this configurable?
const reworked=yield reworkAssetReference(cached,assets);markdownified+=yield markdownify(reworked,source);yield fs.writeTextFile(markdownifiedFile,markdownified,'utf8')}else{console.log(`  Already in Markdown!\n\n`)}}catch(err){// Not finished here, need better error handling #TODO
console.error(err)}}});return function main(_x12){return _ref8.apply(this,arguments)}})();let transformer=(()=>{var _ref9=_asyncToGenerator(function*(list){console.log(`Reading archive to gather image assets:`);yield main(list);return Promise.all(list)});return function transformer(_x13){return _ref9.apply(this,arguments)}})();var _url=require('url');var _cheerio=require('cheerio');var _cheerio2=_interopRequireDefault(_cheerio);var _htmlMd=require('html-md-2');var _htmlMd2=_interopRequireDefault(_htmlMd);var _nodeFetch=require('node-fetch');var _nodeFetch2=_interopRequireDefault(_nodeFetch);var _asyncFile=require('async-file');var fs=_interopRequireWildcard(_asyncFile);var _common=require('./common');var _hash=require('./normalizer/hash');var _hash2=_interopRequireDefault(_hash);var _assets=require('./normalizer/assets');var _assets2=_interopRequireDefault(_assets);function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj}else{var newObj={};if(obj!=null){for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key]=obj[key]}}newObj.default=obj;return newObj}}function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}function _asyncToGenerator(fn){return function(){var gen=fn.apply(this,arguments);return new Promise(function(resolve,reject){function step(key,arg){try{var info=gen[key](arg);var value=info.value}catch(error){reject(error);return}if(info.done){resolve(value)}else{return Promise.resolve(value).then(function(value){step('next',value)},function(err){step('throw',err)})}}return step('next')})}}const cheerioConfig={normalizeWhitespace:true,xmlMode:false,decodeEntities:true};const domainsBlacklist=['in.getclicky.com','s7.addthis.com','c.statcounter.com','sb.scorecardresearch.com','pubads.g.doubleclick.net','googleads.g.doubleclick.net'];/**
 * Given every row in source file .csv
 * http://example.org/a/b.html;selector;truncate
 *
 * selector is the CSS selector where the main content is
 * truncate is a list of CSS selectors to strip off
 */function figureOutTruncateAndSelector(sourceArgument){// If we know exactly where the main content is, otherwise grab the whole
// document body.
const selector=sourceArgument.selector.length===0?'body':`${sourceArgument.selector}`;// Truncate is to strip off any patterns we do not want
// as part of our archived article.
let truncate=sourceArgument.truncate.length===0?'':`${sourceArgument.truncate},`;truncate+='script,style,noscript';return{selector,truncate}}function downloadError(errorObj){switch(errorObj.code){case'ECONNREFUSED':console.error(`downloadError (code ${errorObj.code}): Could not download ${errorObj.message}`);break;case'ECONNRESET':console.error(`downloadError (code ${errorObj.code}): Could not continue ${errorObj.message}`);break;default:console.error(`downloadError (code ${errorObj.code}): ${errorObj.message}`,errorObj);break;}return Promise.resolve({})}exports.default=transformer;
//# sourceMappingURL=transformer.js.map
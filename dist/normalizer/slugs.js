'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _url=require('url');/**
 * Slugifier - An URL to filesystem path normalizer
 *
 * For any URL we want to archive,
 * we want a valid filesystem path
 * in which we will archive files to.
 *//**
 * The following passes could be one multi-line
 * but it's easier to debug like that if we need
 * to review the pass rules.
 */function handleSearchParam(urlObjSearchProperty=''){// Explode at &, and sort search params order for consistent results
// ?b=2&a=1&c=  -> [a=1, b=2, c=]
// ?a=1&c=&b=2  -> [a=1, b=2, c=]
const pass=urlObjSearchProperty.replace(/^\?/,'').split('&').sort();// Filter out empty elements
// ?b=2&a=1&c=  -> [a=1, b=2]
// ?b=2&a=1&c   -> [a=1, b=2]
const pass2=pass.map(e=>e.split('='));const pass3=pass2.filter(e=>Boolean(e[1]));const pass4=pass3.map(e=>e.join('/'));const out=String('/'+pass4.join('/')).replace(/pageI?d?/i,'page');return /^\/$/.test(out)?'':out}function handlePathName(urlObjPathName=''){return String(urlObjPathName).replace(/-[a-z0-9]{5,}$/,'').replace(/%40/,'_at_').replace(/\.(action|fcgi|do)/,'').replace(/\/$/,'').replace(/:/,'/').replace(/\/\//,'/').replace(/[@=%&#()~!,]+/g,'').replace(/\.(s?html?|php|xml|aspx?)/,'')}exports.default=url=>{let urlObj={};try{urlObj=new _url.URL(url)}catch(err){throw new Error(url,err)}const search=handleSearchParam(urlObj.search);const pathname=handlePathName(urlObj.pathname);return String(`${urlObj.hostname}${pathname}${search}`).toLowerCase().replace(/^https/,'http').replace(/^http:\/\//,'').replace(/(www\.)/g,'')};
//# sourceMappingURL=slugs.js.map
'use strict';var _fetcher=require('./fetcher');var _fetcher2=_interopRequireDefault(_fetcher);var _transformer=require('./transformer');var _transformer2=_interopRequireDefault(_transformer);var _common=require('./common');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj}}const URL_LIST='archive/index.csv';const[...urls]=(0,_common.readLines)(URL_LIST);/**
 * Something is going somewhat as an anti-pattern here.
 * We want Promise.all(...) at each step, and it's not how
 * it is as of now. Needs rework here. TODO
 */Promise.all(urls).then(u=>(0,_fetcher2.default)(u)).then(u=>(0,_transformer2.default)(u)).catch(_common.handleIndexSourceErrors);
//# sourceMappingURL=archive.js.map
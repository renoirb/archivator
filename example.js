/**
 * Example of how to run fetcher as an ES5 module
 *
 * ```
 * node example.js
 * ```
 */

var fetcher = require('./dist/fetcher').default;

var urls = [];
urls.push(['https://renoirboulanger.com/blog/2015/05/converting-dynamic-site-static-copy/', 'article']);
urls.push(['https://renoirboulanger.com/blog/2015/05/add-openstack-instance-meta-data-info-salt-grains/', 'article']);

fetcher(urls);

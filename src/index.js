'use strict';

import fetcher from './fetcher';

const urls = [];
urls.push(['https://renoirboulanger.com/blog/2015/05/converting-dynamic-site-static-copy/', 'article']);
urls.push(['https://renoirboulanger.com/blog/2015/05/add-openstack-instance-meta-data-info-salt-grains/', 'article']);

fetcher(urls);

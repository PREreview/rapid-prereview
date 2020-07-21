import { PRODUCTION_DOMAIN, DEVELOPMENT_DOMAIN } from '../constants';
import { Feed } from 'feed';
import Router from 'express';
import fetch from 'node-fetch';

const currentEnvironment = process.env.NODE_ENV || 'development';
const baseUrl = currentEnvironment === 'production' ? PRODUCTION_DOMAIN : DEVELOPMENT_DOMAIN;
const reviewsUrl = `${baseUrl}/api/action?q=*:*&include_docs=true`;

const feedFactory = () => {
  return new Feed({
    title: 'Outbreak Science Rapid PREreview',
    description: 'An application for rapid, structured reviews of outbreak-related preprints',
    id: baseUrl,
    link: baseUrl,
    language: 'en',
    copyright: `Outbreak Science Rapid PREreview ${new Date().getFullYear()}`
  });
};

const addReviewToFeed = (feed, review) => {
  const id = review.doc.object.doi || review.doc.object.arXivId;
  const roleId = review.doc.agent.replace('role:', '');
  const link = `${baseUrl}/${id}/?role=${roleId}`;
  feed.addItem({
    title: review.doc.object.name,
    id: review.id,
    link: link,
    description: '*** TODO ***',
    content: '*** TODO ***',
    date: new Date(review.doc.endTime)
  });
};

const router = new Router({ caseSensitive: true });

router.get('/', (req, res, next) => {
  fetch(reviewsUrl).then((response) => response.json())
    .then((response) => {
      const feed = feedFactory();
      response.rows.forEach((review) => addReviewToFeed(feed, review));
      res.setHeader('Content-Type', 'text/xml');
      res.send(feed.rss2());
    });
});

export default router;

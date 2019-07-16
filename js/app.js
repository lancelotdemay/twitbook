import AppTweet from '/js/components/tweet/tweet.js';
import { openDB } from 'idb';
import checkConnectivity from '/js/connection.js';

import './components/user/user-auth.js';

import firebase from 'firebase/app';

(async function(document) {
  const app = document.querySelector('#app');
  const skeleton = app.querySelector('.skeleton');
  const listPage = app.querySelector('[page=list]');

  checkConnectivity(3, 1000);

  document.addEventListener('connection-changed', ({ detail }) => {
    console.log(detail.online);
  });
  skeleton.removeAttribute('active');
  listPage.setAttribute('active', '');

  try {
    const data = await fetch('/data/tweets.json');
    const json = await data.json();

    const database = await openDB('app-store', 1, {
      upgrade(db) {
        db.createObjectStore('tweets');
      }
    });

    if (navigator.onLine) {
      await database.put('tweets', json, 'tweets');
    }

    const articles = await database.get('tweets', 'tweets');
    
    const tweets = json.tweets.map(item => {
      const tweetElement = new AppTweet();
  
      tweetElement.initTweet(item.username,
        item.placeholder,
        item.date,
        item.description);
  
      listPage.appendChild(tweetElement);
  
      return tweetElement;
    });

    document.addEventListener('add-favorit', async e => {
      const updatedArticle = articles.map(article => {
        article.content.title === e.detail.article ? article.favoris = true : article.favoris = false;
        return article;
      });

      await database.put('tweets', updatedArticle, 'tweets');
    });

    const callback = function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tweet = entry.target;
          tweet.swapImage();
        }
      });
    };
  
    const io = new IntersectionObserver(callback);
  
    tweets.forEach(tweet => {
      io.observe(tweet);
    });
  } catch (error) {
    console.error(error, ':(');
  }
})(document);
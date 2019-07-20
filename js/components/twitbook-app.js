import { LitElement, html, css } from 'lit-element';
import '../../layouts/navigation/twitbook-header.js';
import './data/twitbook-data.js';
import './data/twitbook-auth.js';
import './data/twitbook-login.js';
import './data/twitbook-store.js';


import firebase from '@firebase/app';
import moment from 'moment';

class TwitbookApp extends LitElement {

 constructor() {
   super();
   this.user = {};
   this.users = [];
   this.tweet = "";
   this.tweets = [];
   this.likes = [];
   this.retweets = [];
   this.logged = false;

   document.addEventListener('page-changed', () => {
    const router = document.$router;
    this.page = router.getCurrentPage();
   });
 }

 static get properties() {
   return {
     unresolved: {
       type: Boolean,
       reflect: true
     },
     users: Array,
     user: Object,
     logged: Boolean,
     page: String,
     tweet: String,
     tweets: Array,
     logged: Boolean,
     likes: Array,
     retweets: Array,
   };
 }

 static get styles() {
    return css`
    
    `;
  }

 firstUpdated() {
    this.unresolved = false;
    this.data = this.shadowRoot.querySelector("#data");
    this.logged = localStorage.getItem('logged') == 'true' ? true : false;
    if (this.logged) {
      this.likes = localStorage.getItem('likes') != null ? JSON.parse(localStorage.getItem('likes')) : []
      this.retweets = localStorage.getItem('retweets') != null ? JSON.parse(localStorage.getItem('retweets')) : []
    }
 }

 handleLogin(e) {
    this.user = e.detail.user;
    this.logged = localStorage.getItem('logged') == 'true' ? true : false;
 }


 userAdded(e) {
  this.users = e.detail;
}

 sendTweet(e) {
   this.database = firebase.firestore();

   this.database.collection('tweets').add({
     content: e.detail,
     user: {
         id: this.user.uid,
         name: this.user.displayName
      },
     email: this.user.email,
     likes_count: 0,
     retweets_count: 0,
     likes: [],
     retweets: [],
     date: new Date().getTime()
   }).then(snapshot => {
     this.tweet = '';
   });
 }

 tweetAdded(e) {
  this.tweets = e.detail;
  this.tweets.sort(function(a,b){
      return b.date - a.date
    });
}
   
like(tweet) {
    firebase.firestore().collection("tweets").doc(tweet.id).update({
      "likes": firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid),
      "likes_count": tweet.likes_count
    })
}

dislike(tweet) {
  firebase.firestore().collection("tweets").doc(tweet.id).update({
    "likes": firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid),
    "likes_count": tweet.likes_count
  })
}

retweet(tweet) {
  firebase.firestore().collection('retweets').add({
    tweet_id: tweet.id,
    user_id: firebase.auth().currentUser.uid
 })
 this.retweets = [...this.retweets, tweet.id]
 localStorage.setItem('retweets', JSON.stringify(this.retweets))
}

unretweet(tweet) {
  firebase.firestore().collection('retweets').where('tweet_id', '==', tweet.id).where('user_id', '==', firebase.auth().currentUser.uid).get().then(snapshot => {
    snapshot.forEach(function(doc) {
      doc.ref.delete();
    });
  })
  this.retweets = this.retweets.filter(item => item != tweet.id)
  localStorage.setItem('retweets', JSON.stringify(this.retweets))
}


 render() {
   return html`
   <twitbook-store
       collection="tweets"
       @child-changed="${this.tweetAdded}"></twitbook-store>
       <slot name="header"></slot>
    <main id="view">
     ${ this.logged ? html`
      <app-user name="me" ?active="${this.page == 'me'}"></app-user>
      <app-home 
      name="home" .tweets="${this.tweets}" 
      @like-event="${e => {this.like(e.detail);}}" 
      @dislike-event="${e => {this.dislike(e.detail);}}"
      @retweet-event="${e => {this.retweet(e.detail);}}" 
      @unretweet-event="${e => {this.unretweet(e.detail);}}"
      @tweet-sent="${e => {this.sendTweet(e);}}"
      .firebase="${firebase}" 
      .moment="${moment}" 
      .retweets="${this.retweets}"
      .likes="${this.likes}"
      ?active="${this.page == ''}"></app-home>`: html`
      <twitbook-auth></twitbook-auth>
      <twitbook-login @user-logged="${this.handleLogin}" unresolved></twitbook-login>
      `}
</main>`;
 }  

}
customElements.define('twitbook-app', TwitbookApp);
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
     
    form {
      display: flex;
      justify-content: space-between;
      background-color: #18242f;
      padding: 1rem;
      border-bottom: 1px solid white;
    }
    form input {
      background-color: #18242f;
      border: 1px solid cyan;
      padding: 10px;
      width: 100%;
      border-radius: 20px;
      color: white;
    }
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
   e.preventDefault();
   this.database = firebase.firestore();

   this.database.collection('tweets').add({
     content: this.tweet,
     user: {
         id: this.user.uid,
         name: this.user.displayName
        },
     email: this.user.email,
     date: new Date().getTime()
   }).then(snapshot => {
     this.tweet = '';
   });
 }

 tweetAdded(e) {
  this.tweets = e.detail;
  setTimeout(function () {
       window.scrollTo(0, document.body.scrollHeight);
  }, 0);
}
   
like(tweet) {
    firebase.firestore().collection('likes').add({
         tweet_id: tweet.id,
         user_id: firebase.auth().currentUser.uid
    })
    this.likes = [...this.likes, tweet.id]
    localStorage.setItem('likes', JSON.stringify(this.likes))
}

 render() {
   return html`
   <twitbook-store
       collection="tweets"
       @child-changed="${this.tweetAdded}"></twitbook-store>
       <slot name="header"></slot>
        <form @submit="${this.sendTweet}">
               <input
                 type="text"
                 placeholder="Send new tweet ..."
                 .value="${this.tweet}"
                 @input="${e => this.tweet = e.target.value}">
    </form>
   <main id="view">
   <app-user name="me" ?active="${this.page == 'me'}"></app-user>
   <app-home 
      name="home" .tweets="${this.tweets}" 
      @like-event="${e => {this.like(e.detail); e.detail.likes_count += 1}}" 
      .firebase="${firebase}" 
      .moment="${moment}" 
      .retweets="${this.retweets}"
      .likes="${this.likes}"
      ?active="${this.page == 'home'}"></app-home>
</main>`;
 }  

}
customElements.define('twitbook-app', TwitbookApp);
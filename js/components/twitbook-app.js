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
    header {
      height: 48px;
      display: flex;
      border-bottom: solid 1px #eeeeee;
      background-color: #1B2938;
      color: white;
  }

  header span {
      flex-grow: 1;
      margin: auto;
      text-align: center;
  }

  header button {
    color: white;
  }

  button {
  
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
    console.log(this.user)
    this.logged = localStorage.getItem('logged') == 'true' ? true : false;
 }

 logout() {
    firebase.auth().signOut().then(res => {
      this.logged = false
      localStorage.setItem('logged', this.logged)
    })
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
         name: this.user.displayName,
          email: this.user.email,
      },
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
      "likes": tweet.likes,
      "likes_count": tweet.likes_count
    })
}

dislike(tweet) {
  firebase.firestore().collection("tweets").doc(tweet.id).update({
    "likes": tweet.likes,
    "likes_count": tweet.likes_count
  })
}

retweet(tweet) {
  firebase.firestore().collection("tweets").doc(tweet.id).update({
    "retweets": tweet.retweets,
    "retweets_count": tweet.retweets_count
  })
}

unretweet(tweet) {
  firebase.firestore().collection("tweets").doc(tweet.id).update({
    "retweets": tweet.retweets,
    "retweets_count": tweet.retweets_count
  })
}

comment() {
  window.location.href = "/comment"
}


 render() {
   return html`
   <twitbook-store
       collection="tweets"
       @child-changed="${this.tweetAdded}"></twitbook-store>
       <header slot="header"><span style="${this.logged ? 'margin-left: 84px;': ''}">Twitbook </span> ${ this.logged ? html`<button class="logout" @click="${e => this.logout()}">Déconnexion</button>`: html``}</header>
    <main id="view">
     ${ this.logged ? html`
      <app-user name="me" 
      .user="${this.user}"
      .moment="${moment}" 
      .tweets="${this.tweets}" 
      .firebase="${ firebase.auth().currentUser}" 
      ?active="${this.page == 'me'}"></app-user>
      <app-comment 
      .firebase="${firebase}"  
      .user="${this.user}"
      .moment="${moment}" 
      name="comment" 
      ?active="${this.page == "comment"}"></app-comment>
      <app-home 
      name="home" .tweets="${this.tweets}" 
      @like-event="${e => {this.like(e.detail);}}" 
      @dislike-event="${e => {this.dislike(e.detail);}}"
      @retweet-event="${e => {this.retweet(e.detail);}}" 
      @unretweet-event="${e => {this.unretweet(e.detail);}}"
      @tweet-sent="${e => {this.sendTweet(e);}}"
      @comment-event="${e => {this.comment()}}"
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
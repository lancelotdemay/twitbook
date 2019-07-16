import { LitElement, html, css } from 'lit-element';
import '../../layouts/navigation/twitbook-header.js';
import './data/twitbook-data.js';
import './data/twitbook-auth.js';
import './data/twitbook-login.js';
import './data/twitbook-store.js';
import '../../service-worker.js';

import firebase from 'firebase/app';

class TwitbookApp extends LitElement {

 constructor() {
   super();
   this.user = {};
   this.users = [];
   this.tweet = null;
   this.tweets = [];
   this.logged = false;
 }

 static get properties() {
   return {
     unresolved: {
       type: Boolean,
       reflect: true
     },
     users: Array,
     user: Object,
     tweet: AppTweet,
     tweet: Array,
     logged: Boolean
   };
 }

 static get styles() {
    return css`
      :host {
        display: block;
      }
      * {  box-sizing: border-box }
      footer {
        position: fixed;
        bottom: 0;
        width: 100%;
      }
      footer form {
        display: flex;
        justify-content: space-between;
        background-color: #ffffff;
        padding: 0.5rem 1rem;
        width: 100%;
      }
      footer form input {
        width: 100%;
      }
 
      ul {
        position: relative;
        display: flex;
        flex-direction: column;
        list-style: none;
        padding: 0;
        margin: 0;
        margin-bottom: 3em;
      }
 
      ul li {
        display: block;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        background-color: #cecece;
        border-radius: 0 30px 30px 0;
        width: 70%;
      }
      ul li.own {
        align-self: flex-end;
        text-align: right;
        background-color: #16a7f1;
        color: #ffffff;
        border-radius: 30px 0 0 30px;
      }
    `;
  }

 firstUpdated() {
   this.unresolved = false;
   this.data = this.shadowRoot.querySelector("#data");
   this.logged = localStorage.getItem('logged') == 'true' ? true : false;
 }

 handleLogin(e) {
    this.user = e.detail.user;
   this.logged = localStorage.getItem('logged') == 'true' ? true : false;
 }

 sendTweet(e) {
   e.preventDefault();
   this.database = firebase.firestore();

   this.database.collection('tweets').add({
     content: this.tweet,
     user: this.user.uid,
     email: this.user.email,
     date: new Date().getTime()
   }).then(snapshot => {
     this.tweet = '';
   });
 }

 render() {
   return html`
     <section>
       <twitbook-store
       collection="tweets"
       @child-changed="${this.tweetAdded}"></twitbook-store>
       <slot name="header"></slot>
       <main>
         ${console.log(this.logged)}
         ${ !this.logged ?
           html`
             <twitbook-auth></twitbook-auth>
             <twitbook-login @user-logged="${this.handleLogin}"></twitbook-login>
            `: html`
             <h2>Hi, ${this.user.email}</h2>
             <button @click="${this.subscribe}">subscribe</button>
             <ul>
               ${this.tweets.map(tweet => html`
                 <li
                   class="${tweet.user == this.user.uid ? 'own': ''}">
                   <strong>
                   ${tweet.email} said : 
                   </strong>
                   <span>${tweet.content} - ${this.getDate(tweet.date)}</span>
                 </li>
               `)}
             </ul>
           </main>
           <footer>
             <form @submit="${this.sendtweet}">
               <input
                 type="text"
                 placeholder="Send new tweet ..."
                 .value="${this.tweet}"
                 @input="${e => this.tweet = e.target.value}">
               <button type="submit">Send</button>
             </form>
           </footer>
           `
         }
     </section>
   `;
 }

 tweetAdded(e) {
   this.tweets = e.detail;
   setTimeout(function () {
        window.scrollTo(0, document.body.scrollHeight);
   }, 0);
 }

 userAdded(e) {
   this.users = e.detail;
 }

 getDate(timestamp) {
   const date = new Date(timestamp);
   // Hours part from the timestamp
   const hours = date.getHours();
   // Minutes part from the timestamp
   const minutes = "0" + date.getMinutes();
   // Seconds part from the timestamp
   const seconds = "0" + date.getSeconds();

   // Will display time in 10:30:23 format
   return `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;
 }

 sendSubscription() {
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(document.config.publicKey)
        }).then(async subscribtion => {
          subscribtion.id = this.user.uid;
          await fetch('http://localhost:8085/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscribtion)
          })
        });
      });
  }
}

 subscribe() {
  if (('serviceWorker' in navigator) || ('PushManager' in window)) {
    Notification.requestPermission()
      .then((result) => {
        if (result === 'denied') {
          console.log('Permission wasn\'t granted. Allow a retry.');
          return;
        }
        if (result === 'default') {
          console.log('The permission request was dismissed.');
          return;
        }
        console.log('Notification granted', result);
        this.sendSubscription();
        this.urlBase64ToUint8Array(document.config.publicKey);
        // Do something with the granted permission.
      });
  }
}
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
 
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
 
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
customElements.define('twitbook-app', TwitbookApp);
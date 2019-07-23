import { LitElement, html, css } from '../../../node_modules/lit-element/lit-element.js'

export default class Home extends LitElement {
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

      main {
        background-color: #18242f;
      }
 
      ul {
        position: relative;
        display: flex;
        flex-direction: column;
        list-style: none;
        background-color: #18242f;
        padding: 0;
        margin: 0;
        margin-bottom: 3em;
      }
 
      ul li {
        display: block;
        padding: 0.5rem 1rem;
        color: white;
        border-bottom: 1px solid white;
      }

      .comment {
        margin-right: 20px;
        border: 1px solid cyan;
        background-color: #18242f;
        color: white;
      }

      .like, .retweet {
        border: 0px solid;
        width: 18px;
        height: 18px;
        fill: red;
      }
      
      .actions {
        display:flex;
        margin-top: 30px;
      }
      
      span {
          display: flex;
          align-items: center;
          margin-right: 20px;
      }

      .tweet-content {
        margin-right: 20px;
        margin-top: 10px;
      }

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

    constructor() {
      super();
      
      this.tweetText = "";
      this.tweet = null;
      this.tweets = [];
      this.likes = [];
      this.retweets = [];
      this.firebase = null;
      this.moment = null;
    }

    static get properties() {
      return {
        unresolved: {
          type: Boolean,
          reflect: true
        },
        tweetText: String,
        tweet: Object,
        tweets: Array,
        hasLiked: Boolean,
        hasRetweeted: Boolean,
        firebase: Object,
        moment: Object
      }
    }

    firstUpdated(changedProperties){
  
    }

    render() {
        return html`
        <form action="/me">
               <input
                 type="submit"
                 value="My Profile"
                ></form>
        <form @submit="${this.sendTweet}">
               <input
                 type="text"
                 placeholder="Send new tweet ..."
                 .value="${this.tweetText}"
                 @input="${e => this.tweetText = e.target.value}"
                >
    </form>
      <ul>
        ${this.tweets.map(tweet => html`
          <li class="tweet">
            <strong>
            ${tweet.user.name} - ${this.getDate(tweet.date)}
            </strong>
            <br>
            <span class="tweet-content">${tweet.content}</span>

            <div class="actions">
            <button class="comment" @click="${e => this.comment(tweet)}">Commenter</button>
             ${ tweet.likes.find(item => item == this.firebase.auth().currentUser.uid ) ? 
             html`
             <span><button @click="${e => this.dislike(tweet)}"><img class="like" src="../images/heart.svg" /></button> ${tweet.likes_count}</span>
            `:
            html`
             <span><button @click="${e => this.like(tweet)}"><img class="like" src="../images/heart_empty.svg" /> </button> ${tweet.likes_count != 0 ? tweet.likes_count : 0}</span>
            `
           }
           ${ tweet.retweets.find(item => item == this.firebase.auth().currentUser.uid ) ? 
             html`
             <span><button @click="${e => this.unretweet(tweet)}"><img class="retweet" src="../images/unretweet.svg" /></button> ${tweet.retweets_count}</span>
            `:
            html`
             <span><button @click="${e => this.retweet(tweet)}"><img class="retweet" src="../images/retweet.svg" /> </button> ${tweet.retweets_count != 0 ? tweet.retweets_count : 0}</span>
            `}
            </div>
          </li>
        `)}
      </ul>
    </main>
    <footer>
      
    </footer>`;
    }

    sendTweet(e) {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('tweet-sent', { detail: this.tweetText }))
      this.tweetText = "";
    }
   
    getDate(timestamp) {
      return this.moment(timestamp).fromNow()
    }
   
    like(tweet) {
      this.tweet = null;
      this.tweet = tweet
      this.tweet.likes_count += 1
      this.tweet.likes.push(this.firebase.auth().currentUser.uid)
      this.dispatchEvent(new CustomEvent('like-event', { detail: tweet }))
    }
   
    dislike(tweet) {
      this.tweet = null;
      this.tweet = tweet
      this.tweet.likes_count -= 1

      let index = this.tweet.likes.indexOf(tweet)
      this.tweet.likes.splice(index, 1)

      this.dispatchEvent(new CustomEvent('dislike-event', { detail: tweet }))
   }
   
   retweet(tweet) {
    this.tweet = null;
    this.tweet = tweet
    this.tweet.retweets_count += 1
    this.tweet.retweets.push(this.firebase.auth().currentUser.uid)
    this.dispatchEvent(new CustomEvent('retweet-event', { detail: tweet }))
   }
   
   unretweet(tweet) {
    this.tweet = null;
    this.tweet = tweet
    this.tweet.retweets_count -= 1

    let index = this.tweet.retweets.indexOf(tweet)
    this.tweet.retweets.splice(index, 1)

    this.dispatchEvent(new CustomEvent('unretweet-event', { detail: tweet }))
   }

   comment(tweet) {
      localStorage.setItem('tweet', JSON.stringify(tweet)); 

      this.dispatchEvent(new CustomEvent('comment-event'))
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
   
     getUserPage(){
       document.location.href="http://127.0.0.1:8081/user";
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
   
     profil() {  
       this.urlBase64ToUint8Array(document.config.publicKey);
     }
}
customElements.define('app-home', Home);
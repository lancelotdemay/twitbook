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
    `;
  }

    constructor() {
      super();
      
      this.tweet = null;
      this.tweets = [];
      this.likes = [];
      this.retweets = [];
      this.firebase = null;
      this.moment = null;
    }

    static get properties() {
      return {
        tweet: Object,
        tweets: Array,
        hasLiked: Boolean,
        hasRetweeted: Boolean,
        firebase: Object,
        moment: Object
      }
    }

    render() {
        return html`
      <ul>
        ${this.tweets.map(tweet => html`
          <li
            class="tweet">
            <strong>
            ${tweet.user.name} - ${this.getDate(tweet.date)}
            </strong>
            <br>
            <span class="tweet-content">${tweet.content}</span>

            <div class="actions">
            <button class="comment">Commenter</button>
             ${ this.hasLiked(tweet.id) ? 
             html`
             <span><button @click="${e => this.dislike(tweet)}"><img class="like" src="../images/heart.svg" /></button> ${tweet.likes_count}</span>
            `:
            html`
             <span><button @click="${e => this.like(tweet)}"><img class="like" src="../images/heart_empty.svg" /> </button> ${tweet.likes_count != 0 ? tweet.likes_count : 0}</span>
            `
           }
           ${ this.hasRetweeted(tweet.id) ? 
             html`
             <span><button @click="${e => this.unretweet(tweet)}"><img class="retweet" src="../images/unretweet.svg" /></button> ${tweet.retweets_count}</span>
            `:
            html`
             <span><button @click="${e => this.retweet(tweet)}"><img class="retweet" src="../images/retweet.svg" /> </button> ${tweet.retweets_count != 0 ? tweet.likes_count : 0}</span>
            `}
            </div>
          </li>
        `)}
      </ul>
    </main>
    <footer>
      
    </footer>`;
    }



   
    getDate(timestamp) {
      return this.moment(timestamp).fromNow()
    }
   
    like(tweet) {
      this.tweet = tweet
      this.dispatchEvent(new CustomEvent('like-event', { detail: tweet }))
    }
   
    dislike(tweet) {
     console.log("enter dislike")
     this.firebase.firestore().collection('likes').where('tweet_id', '==', tweet.id).where('user_id', '==', this.firebase.auth().currentUser.uid).get().then(snapshot => {
       snapshot.forEach(function(doc) {
         doc.ref.delete();
       });
     })
     this.likes = this.likes.filter(item => item != tweet.id)
     tweet.likes_count -= 1
     localStorage.setItem('likes', JSON.stringify(this.likes))
   }
   
   retweet(tweet) {
     console.log("enter retweet")
     this.firebase.firestore().collection('retweets').add({
        tweet_id: tweet.id,
        user_id: this.firebase.auth().currentUser.uid
     })
     this.retweets = [...this.retweets, tweet.id]
     tweet.retweets_count += 1
     localStorage.setItem('retweets', JSON.stringify(this.retweets))
   }
   
   unretweet(tweet) {
    console.log("enter unretweet")
    this.firebase.firestore().collection('retweets').where('tweet_id', '==', tweet.id).where('user_id', '==', this.firebase.auth().currentUser.uid).get().then(snapshot => {
      snapshot.forEach(function(doc) {
        doc.ref.delete();
      });
    })
    this.retweets = this.retweets.filter(item => item != tweet.id)
    tweet.retweets_count -= 1
    localStorage.setItem('retweets', JSON.stringify(this.retweets))
   }
   
    hasLiked(id) {
       return this.likes.find(function(item){ return item == id })
   }
   
     hasRetweeted(id) {
       return this.retweets.find(function (item) { return item == id })
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
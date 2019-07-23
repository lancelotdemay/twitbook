import { LitElement, html } from '../../../node_modules/lit-element/lit-element.js'

export default class AppUser extends LitElement {
    constructor() {
      super();
      this.user = null
      this.firebase = null;
      this.tweets = [];
      this.moment = null;
    }

    static get properties() {
        return {
          user: Object,
          firebase: Object,
          tweets: Array,
          moment: Object
        };
    }

    render() {
      return html`
        <div class="">
          <div>
            ${this.firebase.displayName}
          </div>
          <div>
          <p>${this.user.followers_count} Abonnements </p> <p> ${this.user.follows_count} Abonnés </p>
          </div>
          ${this.tweets.map(tweet =>  html` 
          ${tweet.user.id == this.firebase.uid ? html`
          <li
            class="tweet">
            <strong>
            ${tweet.user.name} - ${this.getDate(tweet.date)}
            </strong>
            <br>
            <span class="tweet-content">${tweet.content}</span>

            <div class="actions">
            <button class="comment">Commenter</button>
             ${ tweet.likes.find(item => item == this.firebase.uid ) ? 
             html`
             <span><button @click="${e => this.dislike(tweet)}"><img class="like" src="../images/heart.svg" /></button> ${tweet.likes_count}</span>
            `:
            html`
             <span><button @click="${e => this.like(tweet)}"><img class="like" src="../images/heart_empty.svg" /> </button> ${tweet.likes_count != 0 ? tweet.likes_count : 0}</span>
            `
           }
           ${ tweet.likes.find(item => item == this.firebase.uid ) ? 
             html`
             <span><button @click="${e => this.unretweet(tweet)}"><img class="retweet" src="../images/unretweet.svg" /></button> ${tweet.retweets_count}</span>
            `:
            html`
             <span><button @click="${e => this.retweet(tweet)}"><img class="retweet" src="../images/retweet.svg" /> </button> ${tweet.retweets_count != 0 ? tweet.retweets_count : 0}</span>
            `} : 
            </div>
          </li>
           ` : ''}
        `)}
        </div>
      `;
    }
    
    getDate(timestamp) {
      return this.moment(timestamp).fromNow()
    }


    like(tweet) {
      this.tweet = null;
      this.tweet = tweet
      this.tweet.likes_count += 1
      this.tweet.likes.push(this.firebase.uid)
      this.dispatchEvent(new CustomEvent('like-event', { detail: tweet }))
    }
   
    dislike(tweet) {
      this.tweet = null;
      this.tweet = tweet
      this.tweet.likes_count -= 1
      this.dispatchEvent(new CustomEvent('dislike-event', { detail: tweet }))
   }
   
   retweet(tweet) {
    this.tweet = null;
    this.tweet = tweet
    this.tweet.retweets_count += 1
    this.dispatchEvent(new CustomEvent('retweet-event', { detail: tweet }))
   }
   
   unretweet(tweet) {
    this.tweet = null;
    this.tweet = tweet
    this.tweet.retweets_count -= 1
    this.dispatchEvent(new CustomEvent('unretweet-event', { detail: tweet }))
   }
}
customElements.define('app-user', AppUser);
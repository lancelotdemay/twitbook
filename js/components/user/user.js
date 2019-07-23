import { LitElement, html } from '../../../node_modules/lit-element/lit-element.js'

export default class AppUser extends LitElement {
    constructor() {
      super();
      this.user = null
      this.followers = [];
      this.followers_count = 0;
      this.follows = [];
      this.follows_count = 0;
      this.firebase = null;
      this.tweets = [];
      this.moment = null;
    }

    static get properties() {
        return {
          user: Object,
          firebase: Object,
          tweets: Array,
          moment: Object,
          followers: Array,
          followers_count: Number,
          follows: Array,
          follows_count: Number,
        };
    }

    firstUpdated() {
        this.firebase.firestore().collection('users').where('user_id', '==', this.firebase.auth().currentUser.uid).get().then(snapshot => {
          snapshot.docs.forEach(doc => {
            this.followers = doc.data().followers
            this.followers_count = doc.data().followers_count
            this.follows = doc.data().follows
            this.follows_count = doc.data().follows_count
          })
        })
    }

    render() {
      return html`
        <div class="">
          <div>
            ${this.firebase.auth().currentUser.displayName}
          </div>
          <div>
          <p>${this.followers_count > 0 ? this.followers_count : '0'} Abonnements </p> <p> ${this.follows_count > 0 ? this.follows_count : '0'} Abonnés </p>
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
import { LitElement, html, css } from 'lit-element';

export default class AppTweet extends LitElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      tweet: Object,
      firebase: Object,
      moment: Object,
    };
  }

  static get styles() {
    return css`
    
    .tweet {
      background-color: #18242f;
      color: white;
      padding: 20px;
      border: 1px solid white;
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

  render() {
    return html`
    <div class="tweet">
            <strong>
            ${this.tweet.user.name} - ${this.getDate(this.tweet.date)}
            </strong>
            <br>
            <span class="tweet-content">${this.tweet.content}</span>

            <div class="actions">
            <button class="comment" @click="${e => this.comment(this.tweet)}">Commenter</button>
             ${ this.tweet.likes.find(item => item == this.firebase.auth().currentUser.uid ) ? 
             html`
             <span><button  aria-label="dislike button" @click="${e => this.dislike(this.tweet)}"><img alt="heart image" class="like" src="../images/heart.svg" /></button> ${this.tweet.likes_count}</span>
            `:
            html`
             <span><button  aria-label="like button" @click="${e => this.like(this.tweet)}"><img alt="heart empty image" class="like" src="../images/heart_empty.svg" /> </button> ${this.tweet.likes_count != 0 ? this.tweet.likes_count : 0}</span>
            `
           }
           ${ this.tweet.retweets.find(item => item == this.firebase.auth().currentUser.uid ) ? 
             html`
             <span><button  aria-label="unretweet button" @click="${e => this.unretweet(this.tweet)}"><img alt="unretweet image" class="retweet" src="../images/unretweet.svg" /></button> ${this.tweet.retweets_count}</span>
            `:
            html`
             <span><button  aria-label="retweet button" @click="${e => this.retweet(this.tweet)}"><img alt="retweet image" class="retweet" src="../images/retweet.svg" /> </button> ${this.tweet.retweets_count != 0 ? this.tweet.retweets_count : 0}</span>
            `}
            </div>
           </div>`
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

  getDate(timestamp) {
    return this.moment(timestamp).fromNow()
  }
}

customElements.define('app-tweet', AppTweet);
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
    this.email = '';
    this.displayName = '';
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
      email: String,
      displayName: String
    };
  }

  firstUpdated() {

    this.firebase.firestore().collection('users').where('user_id', '==', localStorage.getItem('id_user_profile')).get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        console.log(doc.data());
        this.followers = doc.data().followers
        this.followers_count = doc.data().followers_count
        this.follows = doc.data().follows
        this.follows_count = doc.data().follows_count
        this.displayName = doc.data().name
        this.email = doc.data().email
      })
    })
  }

  render() {
    return html`
        <div class="">
          <div>
            ${this.displayName}
          </div>
          <div>
          <p>${this.followers_count > 0 ? this.followers_count : '0'} Abonnés </p> <p> ${this.follows_count > 0 ? this.follows_count : '0'} Abonnement </p>
          <p>${this.firebase.auth().currentUser.uid == localStorage.getItem('id_user_profile') ? '' : html`<button class='follow' @click='${e => this.follow(localStorage.getItem('id_user_profile'))}'>Follow</button>`} </p>
          </div>
          ${this.tweets.map(tweet => html` 
          ${tweet.user.id == localStorage.getItem('id_user_profile') ? html`
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

  follow(id_follow) {

    let firebase = this.firebase;
    let followers_count = this.followers_count;
    let follows_count = this.follows_count;
    firebase.firestore().collection('users').where('user_id', '==', id_follow).get().then(snapshot => {
        snapshot.docs.forEach(doc => {
          firebase.firestore().collection('users').doc(doc.id).update({
            'followers': firebase.firestore.FieldValue.arrayUnion(this.firebase.auth().currentUser.uid),
            'followers_count': followers_count += 1
          });
        })
    })
    firebase.firestore().collection('users').where('user_id', '==', this.firebase.auth().currentUser.uid).get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        firebase.firestore().collection('users').doc(doc.id).update({
          'follows': firebase.firestore.FieldValue.arrayUnion(id_follow),
          'follows_count': follows_count += 1
        });
      })
  })

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
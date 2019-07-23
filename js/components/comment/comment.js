import { LitElement, html, css } from '../../../node_modules/lit-element/lit-element.js'
import '../tweet/tweet.js'

export default class AppComment extends LitElement {
    constructor() {
      super();
      this.tweet = null;
      this.tweetId = null;
      this.firebase = null;
      this.moment = null;
      this.comment = null;
      this.comments = [];
      this.commentText = "";
    }

    firstUpdated(changedProperties) {
      this.tweetId = JSON.parse(localStorage.getItem('tweet')).id
      this.firebase.firestore().collection("tweets").doc(this.tweetId).get().then(doc => {
        this.tweet = doc.data()
        this.tweet.id = this.tweetId
        if (this.tweet.comments) {
        this.tweet.comments.forEach(comment => {
          this.firebase.firestore().collection("tweets").doc(comment).get().then(doc => {
              this.comments.push(doc.data())
              this.requestUpdate()
          });
        });
      }
      });

      this.user = JSON.parse(localStorage.getItem('user'));
      console.log(this.user)
    }

    static get properties() {
        return {
          tweet: Object,
          comments: Array,
          comment: Object,
          moment: Object,
          firebase: Object,
          tweetId: Number,
          user: Object,
          commentText: String,
        };
    }

    static get styles() {
      return css`
        .comment { 
          padding-left: 20px;
          padding-right: 20px;
          background-color: #18242f;
          color: white;
        }

        h3 {
          margin-top: 0px;
          padding-top: 20px;
        }

        form {
          display: flex;
          justify-content: space-between;
          background-color: #18242f;
          margin-bottom: 20px;
        }
        form input {
          background-color: #18242f;
          border: 1px solid cyan;
          padding: 10px;
          width: 100%;
          border-radius: 20px;
          color: white;
        }

        .comment-item {
          border: 1px solid white;
          padding: 10px;
        }
      `;
    }

    render() {
      return html`
        <app-tweet
            @like-event="${e => {this.like(e.detail);}}" 
            @dislike-event="${e => {this.dislike(e.detail);}}"
            @retweet-event="${e => {this.retweet(e.detail);}}" 
            @unretweet-event="${e => {this.unretweet(e.detail);}}"
            @tweet-sent="${e => {this.sendTweet(e);}}"
            @comment-event="${e => {this.comment()}}"
            .tweet="${this.tweet}" 
            .firebase="${this.firebase}" 
            .moment="${this.moment}"></app-tweet>
        <div class="comment">
        <h3>Commentaires</h3>

        <form @submit="${this.handlePost}">
          <input placeholder="Répondre"
          type="text"
                 .value="${this.commentText}"
                 @input="${e => this.commentText = e.target.value}" />
        </form>

        ${ this.comments.map(comment => html`
            <div class="comment-item">
              <div>
              ${comment.user.name} - ${this.getDate(comment.date)}
            </div>
            <br>
            <div>
              ${comment.content}
            </div>
    </div>
        `)}
        </div>
      `;
    }
   
    getDate(timestamp) {
      return this.moment(timestamp).fromNow()
    }

    like(tweet) {
      console.log(tweet)
      this.firebase.firestore().collection("tweets").doc(tweet.id).update({
        "likes": tweet.likes,
        "likes_count": tweet.likes_count
      })
  }
  
  dislike(tweet) {
    this.firebase.firestore().collection("tweets").doc(tweet.id).update({
      "likes": tweet.likes,
      "likes_count": tweet.likes_count
    })
  }
  
  retweet(tweet) {
    this.firebase.firestore().collection("tweets").doc(tweet.id).update({
      "retweets": tweet.retweets,
      "retweets_count": tweet.retweets_count
    })
  }
  
  unretweet(tweet) {
    this.firebase.firestore().collection("tweets").doc(tweet.id).update({
      "retweets": tweet.retweets,
      "retweets_count": tweet.retweets_count
    })
  }

  handlePost(e) {
      e.preventDefault()
      let id = this.tweet.id
      let comments = this.tweet.comments
      this.firebase.firestore().collection('tweets').add({
        content: this.commentText,
        user: {
            id: this.firebase.auth().currentUser.uid,
            name: this.firebase.auth().currentUser.displayName,
            email: this.firebase.auth().currentUser.email,
         },
        likes_count: 0,
        retweets_count: 0,
        likes: [],
        retweets: [],
        date: new Date().getTime()
      }).then(snapshot => {
        console.log(snapshot)
        this.tweet = '';
        this.requestUpdate()
        console.log(comments)
        this.firebase.firestore().collection('tweets').doc(id).update({
            'comments': comments.push(snapshot.id)
        })
      });
  }
}
customElements.define('app-comment', AppComment);
import { LitElement, html, css } from 'lit-element';

export default class AppTweet extends LitElement {
  constructor() {
    super();
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
      }

      .tweet {
        background-color: #18242F;
        padding: 10px;
        color: white;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid white;
      }
      .tweet a {
        display: block;
        text-decoration: none;
      }

      .tweet figure {
        position: relative;
        min-height: 30vh;
        padding: 0;
        margin: 0;
      }
      .tweet img {
        display: block;
        object-fit: cover;
        width: 100%;
        height: 100%;
        max-height: 40vh;
      }
      .tweet .placeholder {
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      
      /**
        * Persist animation using : animation-fill-mode set to forward 
        * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
        */
      .fade {
        -webkit-animation: fadeout 2s forwards; /* Safari and Chrome */
        -moz-animation: fadeout 2s forwards; /* Firefox */
        -ms-animation: fadeout 2s forwards; /* Internet Explorer */
        -o-animation: fadeout 2s forwards; /* Opera */
        animation: fadeout 2s forwards;
      }

      /* Key frame animation */
      @keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Firefox */
      @-moz-keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      /* Safari and Chrome */
      @-webkit-keyframes fadeout {
        from { opacity: 1; }
        to   { opacity: 0; }
      }

      @media (min-width: 600px) {

      }

      /* Wide layout: when the viewport width is bigger than 460px, layout
      changes to a wide layout. */
      @media (min-width: 460px) {
        .tweet {
          flex-basis: 21%;
        }
        .tweet figure {
          min-height: 20vh;
          height: 20vh;
          overflow: hidden;
        }
      }
    `;
  }

  static get properties() {
    return {
      id: { type: Number },
      username: { type: String },
      date: { type: String },
      src: { type: String },
      text: { type: String },
    };
  }

  initTweet(username, src, date, description) {
    this.username = username;
    this.date = date;
    this.src = src;
    this.description = description;
  }

  swapImage() {
    this.shadowRoot.querySelector('img')
      .src = this.src;
  }
}

customElements.define('app-tweet', AppTweet);
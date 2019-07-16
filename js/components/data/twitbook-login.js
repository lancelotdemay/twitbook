import { LitElement, html } from 'lit-element';
import firebase from 'firebase/app';
import 'firebase/auth';

export class TwitbookLogin extends LitElement {

    constructor() {
        super();
        this.email = '';
        this.password = '';
    }

    static getStyles() {
        return css`
            :host {
                display: block;
            }
        `;
    }

    static get properties(){
        return {
            email: String,
            password: String,
        }
    }

    firstUpdated(){
        this.auth = firebase.auth();
        this.auth.onAuthStateChanged( (user) => {
            if (user) {
                return this.dispatchEvent(new CustomEvent('user-logged', {
                    detail: {
                        user
                    }
                }));
            }
            localStorage.setItem('logged', false);
        });
    
    }

    handlePost(e){
        e.preventDefault();
        if(!this.email | !this.password) return console.error('Email or password are empty or wrong');
        this.auth.signInWithEmailAndPassword(this.email, this.password)
        .then(user => {
            localStorage.setItem('logged', true);
            console.log(user)
        })
    }

    render() {
        return html`
          <h4>Login</h4>
            <form @submit="${this.handlePost}"> 
                <input type="text" @input="${e => this.email = e.target.value}">
                <input type="password" @input="${e => this.password = e.target.value}">
                <button type="submit">Connexion</button>
            </form>
        `;
    }
}
customElements.define('twitbook-login', TwitbookLogin);
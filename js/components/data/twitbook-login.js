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
            console.log(user)
            firebase.firestore().collection('users').where('user_id','==',user.user.uid).get().then(snapshot => {
                snapshot.docs.forEach(doc => {
                    localStorage.setItem('avatar', doc.data().avatar)
                    localStorage.setItem('user_info', doc.data())
                })
            })

            localStorage.setItem('logged', true);
            localStorage.setItem('user', JSON.stringify(user))
            window.location.href= "/"
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
import { LitElement, html, css } from 'lit-element';
import firebase from 'firebase/app';
import 'firebase/auth';

export class TwitbookAuth extends LitElement {

    static get styles() {
        return css`
            :host {
                display: block;
                padding: 10px;
            }

            h4 {
                color: white;
                padding-bottom: 10px;
                margin: 0px;
            }


        `;
    }

    static get properties(){
        return {
            email: String,
            username: String,
            password: String,
        }
    }

    firstUpdated(){
        this.auth = firebase.auth();
        this.database = firebase.firestore();
    }

    handlePost(e){
        e.preventDefault();
        if(!this.email | !this.password) return console.error('Email or password are empty or wrong');
        this.auth.createUserWithEmailAndPassword(this.email, this.password).then(response => {
            let user = response.user

            console.log(this.username)
            user.updateProfile({
                displayName: this.username
            })

            console.log(user)
        })
       
    }

    render() {
        return html`
        <h4>Créer un compte</h4>
            <form @submit="${this.handlePost}"> 
                <div class="input-group">
                    <label for="email" class="label-form">Email: </label>
                    <input id="email" type="email" @input="${e => this.email = e.target.value}">
                </div>
                <input id="username" type="text" @input="${e => this.username = e.target.value}">
                <input type="password" @input="${e => this.password = e.target.value}">
                <button type="submit">Enregistrer</button>
    </form>
        `;
    }
}
customElements.define('twitbook-auth', TwitbookAuth);
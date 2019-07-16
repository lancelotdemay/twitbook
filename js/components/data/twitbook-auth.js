import { LitElement, html } from 'lit-element';
import firebase from 'firebase/app';
import 'firebase/auth';

export class TwitbookAuth extends LitElement {

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
    }

    handlePost(e){
        e.preventDefault();
        if(!this.email | !this.password) return console.error('Email or password are empty or wrong');
        this.auth.createUserWithEmailAndPassword(this.email, this.password)
    }

    render() {
        return html`
        <h4>Create user</h4>
            <form @submit="${this.handlePost}"> 
                <input type="text" @input="${e => this.email = e.target.value}">
                <input type="password" @input="${e => this.password = e.target.value}">
                <button type="submit">Enregistrer</button>
    </form>
        `;
    }
}
customElements.define('twitbook-auth', TwitbookAuth);
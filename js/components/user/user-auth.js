import { LitElement, html } from 'lit-element';
import firebase from 'firebase/app';
import 'firebase/auth';

export class UserAuth extends LitElement {

    static getStyles() {
        return css`
            :host {
                display: block;
            }
        `;
    }

    static getProperties(){
        return {
            email: String,
            password: String
        };
    }

    firstUpdated(){
        this.auth = firebase.auth();
    }

    handlePost(e){
        e.preventDefault();
        if(!this.email | !this.password) return console.error('Email or password are empty');
        this.auth.createUserWithEmailAndPassword(this.email, this.password);
    }

    render() {
        return html`
            <h1>Créer un compte</h1>
            <form @submit="${this.handlePost}"> 
                <input type="text" @input="${e => this.email = e.target.value}">
                <input type="password" @input="${e => this.password = e.target.value}">
                <button type="submit">S'inscrire</button>
            </form>
        `;
    }
}
customElements.define('user-auth', UserAuth);
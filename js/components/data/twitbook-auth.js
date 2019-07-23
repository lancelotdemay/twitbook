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
            avatar: Object
        }
    }

    firstUpdated(){
        this.auth = firebase.auth();
        this.database = firebase.firestore();
    }

    handlePost(e){
        e.preventDefault();
        
        this.image = this.shadowRoot.getElementById('avatar').files[0];
        let base64image = this.getBase64Image(this.image)
       
        if(!this.email | !this.password) return console.error('Email or password are empty or wrong');
        this.auth.createUserWithEmailAndPassword(this.email, this.password).then(response => {
            let user = response.user

            firebase.firestore().collection('users').add({
                'user_id': user.uid,
                'avatar': base64image,
                'follows': [],
                'follows_count': 0,
                'followers': [],
                'followers_count': 0
            })
           
            user.updateProfile({
                displayName: this.username
            })
        })
       
    }

    getBase64Image(img) {
        var canvas = this.shadowRoot.getElementById('canvas');
        canvas.width = 80;
        canvas.height = 80;
        var ctx = canvas.getContext("2d");
        var dataURL = canvas.toDataURL("image/jpeg");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

    render() {
        return html`
        <h4>Créer un compte</h4>
            <form @submit="${this.handlePost}"> 
                <div class="input-group">
                    <label for="email" class="label-form">Email: </label>
                    <input id="email" type="email" @input="${e => this.email = e.target.value}">
                </div>
                <div class="input-group">
                    <label for="avatar" class="label-form">Avatar: </label>
                    <input id="avatar" type="file">
                    <canvas id="canvas" height="80" width="80"></canvas>
                </div>
                <input id="username" type="text" @input="${e => this.username = e.target.value}">
                <input type="password" @input="${e => this.password = e.target.value}">
                <button type="submit">Enregistrer</button>
    </form>
        `;
    }
}
customElements.define('twitbook-auth', TwitbookAuth);
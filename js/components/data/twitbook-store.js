import { LitElement } from 'lit-element';

import firebase from 'firebase/app';
import 'firebase/firestore';

export class TwitbookStore extends LitElement {
    constructor() {
        super();
        this.data = [];
        this.collection = '';
    }

    static get properties() {
        return {
            data: { type: Array },
            collection: String
        };
    }

    firstUpdated() {
        firebase.initializeApp(document.config);

        firebase.firestore().collection(this.collection).orderBy('date', 'desc').onSnapshot(ref => {
            ref.docChanges().forEach(change => {
                const { newIndex, oldIndex, doc, type } = change;

                if (type == 'added') {
                    const dataAdded = doc.data()
                    dataAdded.id = doc.id

                    this.data = [ ...this.data, dataAdded ];
                    this.dispatchEvent(new CustomEvent('child-changed', { detail: this.data }));

                } else if (type == 'removed') {
                    this.data.splice(oldIndex, 1);
                    this.dispatchEvent(new CustomEvent('child-changed', { detail: this.data }));
                }
            });
        });
    }

}
customElements.define('twitbook-store', TwitbookStore);
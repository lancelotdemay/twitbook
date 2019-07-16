import { LitElement, html, css } from 'lit-element';

class TwitbookHeader extends LitElement {

    static get styles() {
        return css`
        :host {
            display: block;
            background-color: #ffffff;
        }
        header {
            height: 48px;
            display: flex;
            justify-content: center;
            border-bottom: solid 1px #eeeeee;
            align-items: center;
        }
        img {
            height: 42px;
            width: 42px;
            display: block;
        }
        `;
    }

    render() {
        return html`
        <header>Twitbook</header>
        `;
    }
}
customElements.define('twitbook-header', TwitbookHeader);
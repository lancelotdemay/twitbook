import { LitElement } from "lit-element";

export default class AppUser extends LitElement {
    constructor() {
      super();
      this.username = "";
      this.password = "";
      this.name = "";
      this.email = "";
      this.firstname = "";
      this.birthdate = "";
      this.creation_date = "";
    }

    static get properties() {
        return {
          username: { type: String },
          password: { type: String },
          name: { type: String },
          email: { type: String },
          firstname: { type: String },
          birthdate: { type: Date },
          creation_date: { type: Date },
        };
    }

    render() {
      return html`
        <div class="">
          <div>
            <p> ${this.name} </p>
            <p> ${this.username} </p>
          </div>
        </div>
      `;
    }
}
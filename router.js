import { LitRouter } from "@syu93/lit-router/pkg/dist-src/lit-router/lit-router.js";
import './js/components/twitbook-app.js';

// Define your routes and the view component associated
const router = new LitRouter([
  {
    name: 'home',
    path: '/'
  },
  {
    name: "profileUser",
    path: "/user",
    component: () => import("./js/components/user/user.js")
  }
]);

// Start the router
router.start();
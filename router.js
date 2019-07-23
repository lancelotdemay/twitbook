//import { LitRouter } from "@syu93/lit-router/pkg/dist-src/lit-router/lit-router.js";
import { LitRouter } from "@syu93/lit-router/pkg/dist-src/lit-router/lit-router";
import './js/components/twitbook-app.js';

// Define your routes and the view component associated
const router = new LitRouter([
  {
    name: 'home',
    path: '/',
    component: () => import("./js/components/home/home.js")
  },
  {
    name: "user",
    path: "/user",
    component: () => import("./js/components/user/user.js")
  },
  {
    name: "comment",
    path: "/comment",
    component: () => import("./js/components/comment/comment.js")
  }
]);

// Start the router
router.start();
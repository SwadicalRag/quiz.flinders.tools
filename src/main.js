import Vue from 'vue'
import VueRouter from "vue-router"
import Vuetify from 'vuetify'

Vue.use(VueRouter);
Vue.use(Vuetify);

import App from './App.vue'

import IndexRoute from "./routes/IndexRoute.vue"
import QuizRoute from "./routes/QuizRoute.vue"

const routes = [
    {
        path: "/",
        component: IndexRoute
    },
    {
        path: "/quiz",
        component: QuizRoute
    },
];

const router = new VueRouter({
    routes
});

new Vue({
    el: '#app',
    render: h => h(App),
    router,
});

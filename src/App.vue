<template>
    <v-app id="app">
        <v-navigation-drawer temporary v-model="drawer" light>
            <v-list class="pt-0" dense>
                <v-list-item v-for="item in items" :key="item">
                    <v-list-tile router :href="item.href">
                        <v-list-tile-action>
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar fixed class="deep-orange" light>
            <v-toolbar-side-icon light @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title>quiz.flinders.tools</v-toolbar-title>
        </v-toolbar>
        <main>
            <v-container fluid>
                <router-view></router-view>
            </v-container>
        </main>

        <v-snackbar
            :timeout="toast.timeout"
            :top="toast.y === 'top'"
            :bottom="toast.y === 'bottom'"
            :right="toast.x === 'right'"
            :left="toast.x === 'left'"
            v-model="toast.snackbar">
            {{ toast.msg }}
            <v-btn flat class="pink--text" @click.native="toast.snackbar = false">Close</v-btn>
        </v-snackbar>
    </v-app>
</template>

<script>
    import "persist-js";

    Persist.remove("cookie");
    let store = new Persist.Store("flinders-tools");

    window._SHARED = {
        getValue(key) {
            return JSON.parse(store.get(key));
        },
        setValue(key,val) {
            console.log("SET",key,val);
            return store.set(key,JSON.stringify(val));
        },
        toast(msg,timeout,ypos,xpos) {
            window._SHARED._toast.snackbar = false;

            window._SHARED._toast.msg = msg || "";
            window._SHARED._toast.timeout = timeout || 6000;
            window._SHARED._toast.x = xpos || "";
            window._SHARED._toast.y = ypos || "bottom";

            window._SHARED._toast.snackbar = true;
        }
    };

    export default {
        data () {
            return {
                toast: {
                    snackbar: false,
                    txt: "placeholder",
                    timeout: 6000,
                    x: "",
                    y: "",
                },
                shared: window._SHARED,
                drawer: false,
                items: [
                    {
                        icon: 'list',
                        title: 'Question Bank',
                        href: "/"
                    },
                    {
                        icon: 'assessment',
                        title: 'Quiz Me',
                        href: "/quiz"
                    },
                ],
            }
        },
        created() {
            window._SHARED._toast = this.toast;
        }
    }
</script>

<style lang="stylus">
    @import './stylus/main'
</style>

<template>
    <v-container>
        <v-layout row wrap>
            <v-flex xs12>
                <v-data-table
                    v-bind:headers="headers"
                    v-bind:items="database"
                    v-bind:search="search"
                    selected-key="enabled"
                    v-model="selected"
                    class="elevation-1">
                    <template slot="headers" scope="props">
                        <span v-tooltip:bottom="{ 'html': props.item.text }">
                            {{ props.item.text }}
                        </span>
                    </template>
                    <template slot="items" scope="props">
                        <td>
                            <v-checkbox
                                @click.native.stop="enableQuiz(props.item.id,props.selected)"
                                primary
                                hide-details
                                v-model="props.selected">
                            </v-checkbox>
                        </td>
                        <td class="text-xs-right">{{ props.item.name }}</td>
                        <td class="text-xs-right">{{ props.item.questions.length }}</td>
                        <td class="text-xs-right">
                            <v-btn large error light @click.native.stop="deleteQuiz(props.item.id)">Delete</v-btn>
                        </td>
                    </template>
                </v-data-table>
            </v-flex>
            <v-flex xs12>
                <v-btn large primary light @click.native.stop="addQuizJSONModal = true">Add Quiz JSON</v-btn>
                <v-btn large primary light @click.native.stop="masterJSONModal = true">View/Edit Master JSON Database</v-btn>
                <v-btn large primary light @click.native.stop="importMasterJSONModal = true">Merge Master JSON Database</v-btn>
                <v-btn large primary light tag="a" href="https://github.com/SwadicalRag/quiz.flinders.tools/raw/master/quiz2json.user.js">Install FLO userscript</v-btn>
            </v-flex>
        </v-layout>

        <v-layout row justify-center>
            <v-dialog v-model="addQuizJSONModal">
                <v-card>
                    <v-card-row>
                        <v-card-text>
                            <h2 class="title">Add a Quiz</h2>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row>
                        <v-card-text class="subheading grey--text">
                            <v-text-field
                                v-model="curQuiz.name"
                                name="Name"
                                label="Name"></v-text-field>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row>
                        <v-card-text class="subheading grey--text">
                            <v-text-field
                                v-model="curQuiz.json"
                                name="JSON"
                                label="JSON"
                                @keyup.enter.native="addQuiz"></v-text-field>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row actions>
                        <v-spacer></v-spacer>
                        <v-btn flat v-on:click.native="addQuizJSONModal = false" class="primary--text">Cancel</v-btn>
                        <v-btn flat v-on:click.native="addQuiz" class="primary--text">Add</v-btn>
                    </v-card-row>
                </v-card>
            </v-dialog>
        </v-layout>

        <v-layout row justify-center>
            <v-dialog v-model="masterJSONModal">
                <v-card>
                    <v-card-row>
                        <v-card-text>
                            <h2 class="title">Master JSON Database</h2>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row>
                        <v-card-text class="subheading grey--text">
                            <v-text-field
                                class="master-json-clipboard-ft"
                                v-model="masterJSON"
                                name="JSON"
                                label="JSON"
                                multi-line></v-text-field>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row actions>
                        <v-spacer></v-spacer>
                        <v-btn flat v-on:click.native="masterJSONModal = false" class="primary--text">Cancel</v-btn>
                        <v-btn flat v-on:click.native="updateMaster" class="primary--text">Update</v-btn>
                    </v-card-row>
                </v-card>
            </v-dialog>
        </v-layout>

        <v-layout row justify-center>
            <v-dialog v-model="importMasterJSONModal">
                <v-card>
                    <v-card-row>
                        <v-card-text>
                            <h2 class="title">Merge Master JSON Database</h2>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row>
                        <v-card-text class="subheading grey--text">
                            <v-text-field
                                class="master-json-clipboard-ft"
                                v-model="importMasterJSON"
                                name="JSON"
                                label="JSON"
                                multi-line></v-text-field>
                        </v-card-text>
                    </v-card-row>
                    <v-card-row actions>
                        <v-spacer></v-spacer>
                        <v-btn flat v-on:click.native="importMasterJSONModal = false" class="primary--text">Cancel</v-btn>
                        <v-btn flat v-on:click.native="mergeMaster" class="primary--text">Update</v-btn>
                    </v-card-row>
                </v-card>
            </v-dialog>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    name: "indexroute",
    data () {
        return {
            masterJSON: "[]",
            importMasterJSON: "",
            masterJSONModal: false,
            addQuizJSONModal: false,
            importMasterJSONModal: false,
            curQuiz: {
                name: "",
                json: "",
            },
            shared: window._SHARED,
            search: "",
            selected: [],
            headers: [
                { text: 'Enabled', value: 'enabled' },
                { text: 'Name', value: 'name' },
                { text: 'Questions', value: 'questions.length' },
                { text: 'Actions', value: '', sortable: false },
            ],
            database: [

            ],
        }
    },
    methods: {
        enableQuiz(quizID,enabled) {
            // update all
            if(this.database[quizID].enabled) {
                this.database[quizID].enabled = false;
                this.updateQuizzes();
            }
            else {
                for(let i=0;i < this.database.length;i++) {
                    // this.database[i].enabled = false;

                    for(let i2=0;i2 < this.selected.length;i2++) {
                        if(this.selected[i2] == this.database[i]) {
                            this.database[i].enabled = true;
                            break;
                        }
                    }
                }
            }

            this.shared.setValue("question-db",this.database);
            this.masterJSON = JSON.stringify(this.database);
        },
        addQuiz() {
            this.addQuizJSONModal = false;
            try {
                let parsed = JSON.parse(this.curQuiz.json);

                this.database.push({
                    name: this.curQuiz.name,
                    enabled: true,
                    questions: parsed,
                });
            }
            catch(e) {
                this.shared.toast(`Couldn't add quiz... (${e})`)
            }

            this.updateQuizzes();
            this.shared.setValue("question-db",this.database);
            this.masterJSON = JSON.stringify(this.database);
        },
        deleteQuiz(id) {
            this.database.splice(id,1);

            this.updateQuizzes();

            this.shared.setValue("question-db",this.database);
            this.masterJSON = JSON.stringify(this.database);
        },
        updateQuizzes() {
            this.selected = [];
            for(let i=0;i < this.database.length;i++) {
                this.database[i].id = i;

                if(this.database[i].enabled) {
                    this.selected.push(this.database[i]);
                }
            }
        },
        updateMaster() {
            this.masterJSONModal = false;
            try {
                let parsed = JSON.parse(this.masterJSON);

                this.database = parsed;

                this.updateQuizzes();
                this.shared.setValue("question-db",this.database);
                this.masterJSON = JSON.stringify(this.database);
            }
            catch(e) {
                this.shared.toast(`Couldn't update master JSON database... (${e})`)
            }
        },
        mergeMaster() {
            this.importMasterJSONModal = false;
            try {
                let parsed = JSON.parse(this.importMasterJSON);

                for(let i=0;i < parsed.length;i++) {
                    let quiz = parsed[i];

                    this.database.push(quiz);
                }

                this.updateQuizzes();
            }
            catch(e) {
                this.shared.toast(`Couldn't merge JSON database... (${e})`)
            }
        },
    },
    created() {
        this.database = this.shared.getValue("question-db");

        if(!this.database) {
            this.shared.toast("Initialising database...");
            this.database = [];
            this.shared.setValue("question-db",this.database);
        }

        this.masterJSON = JSON.stringify(this.database);

        for(let i=0;i < this.database.length;i++) {
            this.database[i].id = i;

            if(this.database[i].enabled) {
                this.selected.push(this.database[i]);
            }
        }
    },
    mounted() {

    },
    beforeDestroy() {

    },
}
</script>

<style>

</style>

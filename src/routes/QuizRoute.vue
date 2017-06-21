<template>
    <v-container>
        <v-layout row wrap v-if="question">
            <v-flex xs12>
                <h5> {{ question.data.stem }}
                    <small>
                        (from {{ question.from }})
                    </small>
                </h5>
            </v-flex>
            <v-flex xs12>
                <div v-for="answerData in options">
                    <b v-if="feedback && (question.data.correctOption == answerData.letter)">
                        <v-radio :disabled="!!feedback" :label="`${answerData.letter}. ${answerData.option}`" v-model="chosenAns" :value="answerData.letter" primary dark hide-details></v-radio>
                    </b>
                    <span v-else>
                        <v-radio :disabled="!!feedback" :label="`${answerData.letter}. ${answerData.option}`" v-model="chosenAns" :value="answerData.letter" primary dark hide-details></v-radio>
                    </span>
                </div>
            </v-flex>
            <v-flex xs12 v-if="feedback">
                <v-card class="green darken-1 white--text mt-3" v-if="correct">
                    <v-card-text>
                        <div>{{ feedback }}</div>
                    </v-card-text>
                </v-card>
                <v-card class="red darken-1 white--text mt-3" v-else>
                    <v-card-text>
                        <div>{{ feedback }}</div>
                    </v-card-text>
                </v-card>
                <br>
            </v-flex>
            <v-flex xs12 v-else>
                <v-btn large primary light @click.native.stop="check">Check</v-btn>
            </v-flex>
            <v-flex xs12 v-if="feedback">
                <v-btn large primary light @click.native.stop="next">Next Question</v-btn>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    name: "quizroute",
    data () {
        return {
            shared: window._SHARED,
            questionBank: [],
            options: [],
            question: false,
            chosenAns: "",
            correct: true,
            feedback: false,
        }
    },
    methods: {
        getRandomIntInclusive(min, max) {
            // gloriously pasted from the MDN
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        randomQuestion() {
            this.question = this.questionBank[this.getRandomIntInclusive(0,this.questionBank.length - 1)];
            this.options = JSON.parse(JSON.stringify(this.question.data.options)); // lazy asshole object copying
        },
        check() {
            if(this.chosenAns !== "") {
                if(this.chosenAns == this.question.data.correctOption) {
                    this.correct = true;
                    this.feedback = "Correct!";
                }
                else {
                    this.correct = false;
                    this.feedback = `Incorrect... The correct answer is ${this.question.data.correctOption}`;
                }

                for(let i=0;i < this.options.length;i++) {
                    if(this.options[i].letter == this.questions.data.correctOption) {
                        this.$set(this.options[i],"highlight",true);
                    }
                }
            }
            else {
                this.shared.toast("Please choose an option");
            }
        },
        next() {
            this.feedback = false;
            this.chosenAns = "";
            this.randomQuestion();
        }
    },
    created() {
        let database = this.shared.getValue("question-db");

        for(let i1=0;i1 < database.length;i1++) {
            let quiz = database[i1];
            if(!quiz.enabled) {continue;}
            for(let i2=0;i2 < quiz.questions.length;i2++) {
                let question = quiz.questions[i2];

                this.questionBank.push({
                    data: question,
                    from: quiz.name,
                });
            }
        }

        console.log("OK")

        this.randomQuestion();
        console.log(this.question)
    },
    mounted() {

    },
    beforeDestroy() {

    },
}
</script>

<style>

</style>

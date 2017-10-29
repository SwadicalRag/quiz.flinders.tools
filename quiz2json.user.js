// ==UserScript==
// @name        Quiz2JSON
// @match   http://flo.flinders.edu.au/mod/quiz/review.php?*
// @match   https://flo.flinders.edu.au/mod/quiz/review.php?*
// @version     1.1
// @downloadURL https://github.com/SwadicalRag/quiz.flinders.tools/raw/master/quiz2json.user.js
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

function RPC_Clipboard(text) {
    GM_setClipboard(text);
};

const exportFunction2 = exportFunction || function(func, scope, options) {
    if (options && options.defineAs) {
        scope[options.defineAs] = func;
    }
    return func;
};

unsafeWindow.__flo_q2j_clip = exportFunction2 (RPC_Clipboard, unsafeWindow);

function main() {
    console.log("Q2JSON loaded.");

    let data = {};

    let questions = [];
    data.questions = questions;

    data.quizName = $(".breadcrumb li:last").text();

    data.fullSubjectCode = $(".breadcrumb li:nth-child(2)").text();
    data.fullSubjectName = $(".coursetitle").text();

    $(".que").each(function() {
        let question = {};

        question.stem = $(this).find(".qtext").text().trim();
        question.options = []; // {option: string,letter: string}[]

        let answerFormat = 0;

        let feedback = $(this).find(".specificfeedback").text();

        let correctOptionRaw = $(this).find(".rightanswer").text();

        if(correctOptionRaw.match(/^The correct answer is: /)) {
            correctOptionRaw = correctOptionRaw.match(/^The correct answer is: (.+)/)[1];
        }
        else if(correctOptionRaw.match(/^The correct answer is ['"]/)) {
            correctOptionRaw = correctOptionRaw.match(/^The correct answer is ['"]([^'"]+)/)[1];
            answerFormat = 1;
        }

        correctOptionRaw = correctOptionRaw ? correctOptionRaw.trim() : "";

        if(!correctOptionRaw) {
            alert("Couldn't find correct option for question " + question.stem);
        }

        $(this).find(".answer div").each(function() {
            let text = $(this).text();

            let optionLetter = text.trim().match(/^[a-zA-Z]+/)[0];

            let optionText = text.trim().match(/^[a-zA-Z]+\.\s*(.+)/);

            if(!optionText && (answerFormat == 1)) {
                question.options.push({
                    option: "",
                    letter: text.trim(),
                });

                if(text.trim() == correctOptionRaw) {
                    question.correctOption = optionLetter;
                }

                return;
            }
            else if(optionText && (answerFormat == 0)) {
                optionText = optionText[1];

                question.options.push({
                    option: optionText,
                    letter: optionLetter
                });

                if(optionText == correctOptionRaw) {
                    question.correctOption = optionLetter;
                }
            }
        });

        if(!question.correctOption) {
            alert("Couldn't set correct option for question " + question.stem);
        }

        questions.push(question);
    });

    // console.log(questions);
    function __internal_copyQuizToClipboard() {
        __flo_q2j_clip(JSON.stringify(data));
    }
    window.copyQuizToClipboard = __internal_copyQuizToClipboard;

    $("#block-region-side-post .othernav").append(
        $("<a></a>")
            .attr("href","javascript:copyQuizToClipboard()")
            .text("Copy quiz to clipboard")
    );
}

// Call main() in the page scope
var script = document.createElement("script");
script.textContent = "(" + main.toString() + ")();";
document.body.appendChild(script);

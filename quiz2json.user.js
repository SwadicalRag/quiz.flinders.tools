// ==UserScript==
// @name        Quiz2JSON
// @match   http://flo.flinders.edu.au/mod/quiz/review.php?*
// @match   https://flo.flinders.edu.au/mod/quiz/review.php?*
// @version     1
// @downloadURL https://github.com/SwadicalRag/quiz.flinders.tools/raw/master/quiz2json.user.js
// @grant       GM_setClipboard
// @run-at      document-end
// ==/UserScript==

function RPC_Clipboard(text) {
    GM_setClipboard(text);
};

unsafeWindow.__flo_q2j_clip = exportFunction (RPC_Clipboard, unsafeWindow);

function main() {
    console.log("JA?");

    let questions = [];

    $(".que").each(function() {
        let question = {};

        question.stem = $(this).find(".qtext").text().trim();
        question.options = []; // {option: string,letter: string}[]

        let correctOptionRaw = $(this).find(".rightanswer").text().trim();

        if(correctOptionRaw.match(/^The correct answer is: /)) {
            correctOptionRaw = correctOptionRaw.match(/^The correct answer is: (.+)/)[1];
        }

        $(this).find(".answer div").each(function() {
            let text = $(this).text();

            let optionLetter = text.trim().match(/^[a-zA-Z]+/)[0];
            let optionText = text.trim().match(/^[a-zA-Z]+\.\s*(.+)/)[1];

            question.options.push({
                option: optionText,
                letter: optionLetter
            });

            if(optionText == correctOptionRaw) {
                question.correctOption = optionLetter;
            }
        });

        questions.push(question);
    });

    // console.log(questions);
    function __internal_copyQuizToClipboard() {
        __flo_q2j_clip(JSON.stringify(questions));
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

// ==UserScript==
// @name        ENC2JSON
// @match   http://www.easynotecards.com/notecard_set/*
// @match   https://www.easynotecards.com/notecard_set/*
// @version     1
// @downloadURL https://github.com/SwadicalRag/quiz.flinders.tools/raw/master/enc2json.user.js
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

    $(".vs-card").each(function() {
        let question = {};

        question.stem = $(this).find(".text > p").first().text().trim();
        question.options = []; // {option: string,letter: string}[]

        let correctOptionRaw = $(this).find(".def").text().trim();
        let correctOption;

        if(correctOptionRaw.match(/^The correct answer is: /)) {
            correctOptionRaw = correctOptionRaw.match(/^The correct answer is: ([\s\S]+)/)[1].trim().replace(/[\r\n]/g,"").replace(/\s+/g," ");
        }
        else if(correctOptionRaw.trim().match(/^[a-e]$/)) {
            correctOption = correctOptionRaw.trim();
        }
        else if(correctOptionRaw.trim().match(/^([a-e])\. ([\s\S]+)$/)) {
            correctOption = correctOptionRaw.trim().match(/^([a-e])\. ([\s\S]+)$/)[1].replace(/[\r\n]/g,"").replace(/\s+/g," ");
        }
        else if(correctOptionRaw.trim().match(/^[1-5]$/)) {
            correctOption = correctOptionRaw.trim();
        }

        question.correctOption = correctOption;

        let idx = 1;
        $(this).find(".text > ol > li").each(function() {
            let text = $(this).text();

            let optionText = text.trim();

            question.options.push({
                option: optionText,
                letter: idx.toString(),
            });

            if(!correctOption && (optionText == correctOptionRaw)) {
                question.correctOption = idx.toString();
            }

            idx++;
        });

        if(question.options.length == 0) {
            $(this).find("p").each(function() {
                let text = $(this).text();

                let optionLetter = text.trim().match(/^[a-zA-Z]+/);
                let optionText = text.trim().match(/^[a-zA-Z]+\.\s*([\s\S]+)/);

                if(!(optionLetter && optionText)) {
                    return;
                }

                optionLetter = optionLetter[0].trim().replace(/[\r\n]/g,"").replace(/\s+/g," ");
                optionText = optionText[1].trim().replace(/[\r\n]/g,"").replace(/\s+/g," ");

                question.options.push({
                    option: optionText,
                    letter: optionLetter
                });

                if(optionText == correctOptionRaw) {
                    question.correctOption = optionLetter;
                }
            });
        }

        if(!question.correctOption) {
            console.log(correctOptionRaw)
        }
        else {
            questions.push(question);
        }
    });

    // console.log(questions);
    function __internal_copyQuizToClipboard() {
        __flo_q2j_clip(JSON.stringify(questions));
    }
    window.copyQuizToClipboard = __internal_copyQuizToClipboard;

    $(".ui-grid-d.set-activities").append(
        $("<div></div>").append(
            $("<a></a>")
                .attr("href","javascript:copyQuizToClipboard()")
                .text("Copy")
                .addClass("ui-link")
        )
        .addClass("ui-block-a")
    );
}

// Call main() in the page scope
var script = document.createElement("script");
script.textContent = "(" + main.toString() + ")();";
document.body.appendChild(script);

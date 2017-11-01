// ==UserScript==
// @name        Quiz2JSON
// @match       http://flo.flinders.edu.au/mod/quiz/review.php?*
// @match       https://flo.flinders.edu.au/mod/quiz/review.php?*
// @version     1.3
// @downloadURL https://github.com/SwadicalRag/quiz.flinders.tools/raw/master/quiz2json.user.js
// @updateURL   https://github.com/SwadicalRag/quiz.flinders.tools/raw/master/quiz2json.user.js
// @grant       GM_setClipboard
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

// dependencies

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function uuidv4(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(x){var n=16*Math.random()|0;return("x"==x?n:3&n|8).toString(16)})}

/**
*
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
*
**/
function SHA1(r){function o(r,o){return r<<o|r>>>32-o}function e(r){var o,e="";for(o=7;o>=0;o--)e+=(r>>>4*o&15).toString(16);return e}var t,a,h,n,C,c,f,d,A,u=new Array(80),g=1732584193,i=4023233417,s=2562383102,S=271733878,m=3285377520,p=(r=function(r){r=r.replace(/\r\n/g,"\n");for(var o="",e=0;e<r.length;e++){var t=r.charCodeAt(e);t<128?o+=String.fromCharCode(t):t>127&&t<2048?(o+=String.fromCharCode(t>>6|192),o+=String.fromCharCode(63&t|128)):(o+=String.fromCharCode(t>>12|224),o+=String.fromCharCode(t>>6&63|128),o+=String.fromCharCode(63&t|128))}return o}(r)).length,l=new Array;for(a=0;a<p-3;a+=4)h=r.charCodeAt(a)<<24|r.charCodeAt(a+1)<<16|r.charCodeAt(a+2)<<8|r.charCodeAt(a+3),l.push(h);switch(p%4){case 0:a=2147483648;break;case 1:a=r.charCodeAt(p-1)<<24|8388608;break;case 2:a=r.charCodeAt(p-2)<<24|r.charCodeAt(p-1)<<16|32768;break;case 3:a=r.charCodeAt(p-3)<<24|r.charCodeAt(p-2)<<16|r.charCodeAt(p-1)<<8|128}for(l.push(a);l.length%16!=14;)l.push(0);for(l.push(p>>>29),l.push(p<<3&4294967295),t=0;t<l.length;t+=16){for(a=0;a<16;a++)u[a]=l[t+a];for(a=16;a<=79;a++)u[a]=o(u[a-3]^u[a-8]^u[a-14]^u[a-16],1);for(n=g,C=i,c=s,f=S,d=m,a=0;a<=19;a++)A=o(n,5)+(C&c|~C&f)+d+u[a]+1518500249&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(a=20;a<=39;a++)A=o(n,5)+(C^c^f)+d+u[a]+1859775393&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(a=40;a<=59;a++)A=o(n,5)+(C&c|C&f|c&f)+d+u[a]+2400959708&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;for(a=60;a<=79;a++)A=o(n,5)+(C^c^f)+d+u[a]+3395469782&4294967295,d=f,f=c,c=o(C,30),C=n,n=A;g=g+n&4294967295,i=i+C&4294967295,s=s+c&4294967295,S=S+f&4294967295,m=m+d&4294967295}return(A=e(g)+e(i)+e(s)+e(S)+e(m)).toLowerCase()}

// Q2JSON code

function RPC_Clipboard(data) {
    // to maintain some degree of anonymity in case something goes wrong
    // i know, i know, SHA1 isn't secure blah blah
    // it's fast, if someone had the list of names of all students in a subject,
    // and we only hashed their full name, it's easy to brute force to identify
    // who dumped their quiz. that's why i'm salting it with a random sqlite value
    // i manage. this sqlite value is used for identification purposes only.
    // the university administration doesn't normally have access to this value
    // and cannot use it to identify students unless they really explicitly wanted to
    function getIdentityHash() {
        if(GM_getValue("Q2JSON.identity")) {
            return GM_getValue("Q2JSON.identity");
        }

        let id = uuidv4();

        GM_setValue("Q2JSON.identity",id);

        return id;
    }

    data.fromUserID = SHA1(data.fromUserName + getIdentityHash());
    delete data.fromUserName;

    let text = JSON.stringify(data);

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

    data.fromUserName = $(".usertext").text();

    let collector = function() {
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
            let text = $(this).find("label").text();
            if(!text) {return;}

            let optionLetter = text.trim().match(/^[a-zA-Z]+/)[0];

            let optionText = text.trim().match(/^[a-zA-Z]+\.\s*(.+)/);

            if(!optionText && (answerFormat == 1)) {
                question.options.push({
                    option: "",
                    letter: text.trim(),
                    feedback: $(this).find(".specificfeedback").text(),
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
    };

    $(".que.multichoice").each(collector);
    $(".que.truefalse").each(collector);

    let hasShortAnswer = $(".que.shortanswer").length > 0;
    let hasMatching = $(".que.match").length > 0;

    let warnings = "";

    if(hasShortAnswer) {
        warnings += "(warning, short answer questions are not copied)";
    }
    if(hasMatching) {
        warnings += " (warning, extended matching questions are not copied)";
    }

    function __internal_copyQuizToClipboard() {
        __flo_q2j_clip(data);
    }
    window.copyQuizToClipboard = __internal_copyQuizToClipboard;

    $("#block-region-side-post .othernav").append(
        $("<a></a>")
            .attr("href","javascript:copyQuizToClipboard()")
            .text("Copy quiz to clipboard")
    );

    if(warnings) {
        $("#block-region-side-post .othernav").append(
            $("<i></i>")
                .text(warnings)
        );
    }
}

// Call main() in the page scope
var script = document.createElement("script");
script.textContent = "(" + main.toString() + ")();";
document.body.appendChild(script);

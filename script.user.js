// ==UserScript==
// @name         WriteEmoji button
// @namespace    https://discordapp.com/
// @version      1.0.0
// @description  Adds a list item for writing texts using emojis
// @author       Dmitry221060
// @run-at       document-start
// @include      https://discordapp.com/channels/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require      https://raw.githubusercontent.com/yanatan16/nanoajax/master/nanoajax.min.js
// @grant        unsafeWindow
// @grant        window.localStorage
// ==/UserScript==

(function() {
    'use strict';
    const token = window.localStorage.token;
    if (!token) return console.log('[WriteEmoji button] token is not found');

    if (Notification && Notification.permission == "default") Notification.requestPermission();

    unsafeWindow.$ = jQuery;
    unsafeWindow.writeEmoji = function (msgId, content) {
        let emoteList = {
            "back": ["🔙"],
            "cool": ["🆒"],
            "free": ["🆓"],
            "soon": ["🔜"],
            "abc": ["🔤"],
            "atm": ["🏧"],
            "end": ["🔚"],
            "new": ["🆕"],
            "sos": ["🆘"],
            "top": ["🔝"],
            "ab": ["🆎"],
            "cl": ["🆑"],
            "ng": ["🆖"],
            "ok": ["🆗"],
            "on": ["🔛"],
            "tm": ["™"],
            "up": ["🆙"],
            "vs": ["🆚"],
            "wc": ["🚾"],
            "a": ["🇦","🅰","4⃣","🔼"],
            "b": ["🇧","🅱","8⃣"],
            "c": ["🇨","↪","🌜","©"],
            "d": ["🇩","▶","↩"],
            "e": ["🇪","📧","🇪🇸","💶"],
            "f": ["🇫"],
            "g": ["🇬","☪"],
            "h": ["🇭","%23%E2%83%A3","⏸","♓"],
            "i": ["🇮","ℹ","🥄","📍","1⃣"],
            "j": ["🇯","🌶"],
            "k": ["🇰"],
            "l": ["🇱","👢"],
            "m": ["🇲","Ⓜ","♏","♍"],
            "n": ["🇳","♑","⚡","📈"],
            "o": ["🇴","🅾","⭕","🔄","0⃣"],
            "p": ["🇵","🅿","🏳","🏴","🏁","🚩"],
            "q": ["🇶"],
            "r": ["🇷","®"],
            "s": ["🇸","💲","5⃣","💰","💵"],
            "t": ["🇹","✝","⬆"],
            "u": ["🇺","⛎"],
            "v": ["🇻","🔽","✔","☑","✅"],
            "w": ["🇼","〰"],
            "x": ["🇽","✖","❌","❎"],
            "y": ["🇾","💴","💹","♈"],
            "z": ["🇿"],
            "10": ["🔟"],
            "0": ["0⃣"],
            "1": ["1⃣"],
            "2": ["2⃣"],
            "3": ["3⃣"],
            "4": ["4⃣"],
            "5": ["5⃣"],
            "6": ["6⃣"],
            "7": ["7⃣"],
            "8": ["8⃣"],
            "9": ["9⃣"],
            "!": ["❗","❕"],
            "?": ["❓","❔"],
            "+": ["➕"],
            "-": ["➖"]
        };
        let wordsOfEmoji = []; //Массив со словами, написанными реакциями
        content = content.replace(/\s+/g, ' ').toLowerCase().split(' ');
        let tempContent = content.concat(); //concat нужен чтобы поместить в переменную копию массива, а не ссылку на него
        stop:
        for (let i = 0; i < content.length; i++) {
            let lettersCount = 0;
            wordsOfEmoji[i] = [];
            cont:
            for (let k = 0; k < 15; k++) { //Этот цикл нужен чтобы заменять на реакции повторяющиеся буквы. 15 - ограничение, чтобы избежать рекурсии
                for (let letter in emoteList) { //Ищем в слове всевозможные буквы
                    let index = tempContent[i].indexOf(letter);
                    if (index + 1) {
                        if (emoteList[letter].length) {
                            wordsOfEmoji[i][index] = emoteList[letter][0];
                            lettersCount += letter.length;
                            tempContent[i] = tempContent[i].replace(letter, ' '); //Корректируем индекс, чтобы избежать проблем с длинными эмоциями
                            emoteList[letter].splice(0, 1);
                            if (lettersCount == content[i].length) break cont;
                        } else if (letter.length == 1) { //Если не хватает одиночной буквы
                            new Notification("WriteEmoji button", {body: 'You use too much "' + letter + '"'});
                            break stop;
                        }
                    }
                }
                if (k == 15) {
                    new Notification("WriteEmoji button", {body: "You do something wrong"});
                    break stop;
                }
            }
            if (i + 1 == content.length) { //Если последнее слово обработано
                wordsOfEmoji = [].concat.apply([], wordsOfEmoji).filter(String); //Объединить все подмассивы и вырезать пустые значения
                setEmoji(msgId, wordsOfEmoji, 0);
            }
        }

        function setEmoji(msgId, lettersToWrite, setedLetters) {
            nanoajax.ajax({
                url: 'https://discordapp.com/api/v6/channels/' + window.location.pathname.split('/').pop() + '/messages/' + msgId + '/reactions/' +
                     lettersToWrite[setedLetters] + '/@me',
                method: 'PUT',
                headers: {
                    authorization: token.replace(/^"|"$/g, ''),
                    "content-type": "application/json"
                }
            }, resCode => {
                if (resCode == 429) return setTimeout(() => { setEmoji(msgId, lettersToWrite, setedLetters); }, 100);
                if (resCode != 400 && ++setedLetters != lettersToWrite.length) setEmoji(msgId, lettersToWrite, setedLetters);
            });
        }
    };

    $('body').on('click', '.btn-option', function () {
        let elem = $(this.parentElement.parentElement.parentElement)[0];
        let messageID = elem[Object.keys(elem).filter(e => e.indexOf("__reactInternal") + 1)].return.return.key;
        (function buildButton() {
            if ($('.option-popout.small-popout-box').length) {
                $('.option-popout.small-popout-box').append(
                    '<div onclick="$(\'#WriteEmojiInput\').attr(\'style\', \'display: block; position: absolute; left: -33px; bottom: 0px;\');' +
                    '$(\'#WriteEmojiInput\').focus();" class="btn-item">' +
                        'WriteEmoji' +
                        '<input id="WriteEmojiInput" style="display: none; position: absolute; left: 100px;" data-msgId="' + messageID + '" type="text">' +
                    '</div>'
                );
            } else {
                setTimeout(() => { buildButton(); }, 50);
            }
        })();
    });

    $('body').on('keypress, keyup, keydown', '#WriteEmojiInput', function (e) {
        if (e.keyCode != 13) return;
        e.preventDefault();
        writeEmoji(this.dataset.msgid, this.value.replace(/[^a-zA-Z0-9\!\?\+\- ]/g, ''));
    });
})();
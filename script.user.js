// ==UserScript==
// @name         WriteEmoji button
// @namespace    https://discordapp.com/
// @version      1.1.3
// @description  Adds a list item for writing texts using emojis
// @author       Dmitry221060
// @include      https://discordapp.com/channels/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// ==/UserScript==

const optionsContainer = ".itemGroup-1tL0uz",
      optionsButton    = ".button-3Jq0g9";
setTimeout(run, 2000);
function run() {
    'use strict';
    $('body').append('<iframe id="WriteEmojiLS" style="display:none"></iframe>');
    const token = $('#WriteEmojiLS')[0].contentWindow.localStorage.token;
    $('#WriteEmojiLS').remove();
    if (!token || token == "null") {
        if (window.location.pathname == "/login") return $(document).on("click", 'form[class*="authBox"] button[type="submit"]', () => {setTimeout(run, 5000)});
        return console.log('[WriteEmoji button] token is not found');
    }
    if (Notification && Notification.permission == "default") Notification.requestPermission();

    window.writeEmoji = function (msgId, content) {
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
            "l": ["🇱","👢","📐"],
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
        let words = content.concat();
        stop:
        for (let i = 0; i < content.length; i++) { //TODO переделать с нуля
            let lettersCount = 0;
            wordsOfEmoji[i] = [];
            cont:
            for (let k = 0; k < 15; k++) { //Заменяем повторяющиеся буквы на реакции. 15 - ограничение, чтобы избежать рекурсии
                for (let letter in emoteList) { //Ищем в слове всевозможные буквы
                    let index = words[i].indexOf(letter);
                    if (index + 1) {
                        if (emoteList[letter].length) {
                            wordsOfEmoji[i][index] = emoteList[letter][0];
                            lettersCount += letter.length;
                            words[i] = words[i].replace(letter, letter.split(/./).join(" ")); //Заменяем каждую букву, для которой нашли сопоставление на пробел(чтобы избежать проблем с длинными реакциями)
                            emoteList[letter].splice(0, 1); //Убираем реакцию из списка возможных для проставления
                            if (lettersCount == content[i].length) break cont;
                        } else if (letter.length == 1) {
                            new Notification("WriteEmoji button", {body: 'You use too much "' + letter + '"'});
                            break stop;
                        }
                    }
                }
            }
        }

        let finished = false;
        //Из-за появляющейся кнопки "Реакции" - нужно перемещать нашу кнопку в конец списка
        const MO = new MutationObserver(() => {
            if (finished) MO.disconnect();
            const listItem = document.querySelector(".itemGroup-1tL0uz > div:first-child");
            if (listItem.children[0].id != "WriteEmojiItem") return;
            $(listItem).appendTo($(listItem).parent());
        });
        MO.observe(document.querySelector(optionsContainer), {childList: true, subtree: true});
        wordsOfEmoji = Array.prototype.concat.apply([], wordsOfEmoji).filter(String); //Объединить все подмассивы и вырезать пустые значения
        setEmoji(msgId, wordsOfEmoji, 0);

        function setEmoji(msgId, lettersToWrite, setedLetters) {
            if (setedLetters >= lettersToWrite.length) return finished = true;
            $.ajax({
                url: 'https://discordapp.com/api/v6/channels/' + window.location.pathname.split('/')[3] + '/messages/' + msgId + '/reactions/' +
                     lettersToWrite[setedLetters] + '/@me',
                method: 'PUT',
                headers: {
                    authorization: token.replace(/^"|"$/g, ''),
                    "content-type": "application/json"
                },
                complete: res => {
                    if (res.status == 429) return setTimeout(() => { setEmoji(msgId, lettersToWrite, setedLetters); }, 100);
                    if (res.status == 400) {
                        finished = true;
                        throw new Error("[WriteEmoji button] Bad Request:\n" + JSON.stringify(res));
                    }
                    setEmoji(msgId, lettersToWrite, ++setedLetters);
                }
            });
        }
    };

    $('body').on('click', optionsButton, function () {
        let elem = $(this.parentElement.parentElement.parentElement)[0];
        let temp = elem[Object.keys(elem).filter(e => e.indexOf("__reactInternal") + 1)];
        while (!temp.key) temp = temp.return; //Находим ID сообщения
        (function buildButton() {
            if ($(optionsContainer).length) {
                $(optionsContainer).append(
                    '<div tabindex="0" class="item-1Yvehc itemBase-tz5SeC clickable-11uBi- item-2J1YMK" role="menuitem" ' +
                    'style="overflow: visible;">' +
                        '<div id="WriteEmojiItem" class="label-JWQiNe">' +
                            'WriteEmoji' +
                            '<input id="WriteEmojiInput" style="display: none;" ' +
                            'data-msgid="' + temp.key + '" type="text">' +
                        '</div>' +
                        '<div class="hint-22uc-R"></div>' +
                    '</div>'
                );
            } else setTimeout(buildButton, 50);
        })();
    });

    $('body').on('click', '#WriteEmojiItem', () => {
        $('#WriteEmojiInput').attr('style', 'display: block; position: absolute; left: calc(50% - 66px); bottom: 0px;');
        $('#WriteEmojiInput').focus();
    });

    $('body').on('keypress, keyup, keydown', '#WriteEmojiInput', function (e) {
        if (e.keyCode != 13) return;
        e.preventDefault();
        writeEmoji(this.dataset.msgid, this.value.replace(/[^a-zA-Z0-9\!\?\+\- ]/g, ''));
    });
}

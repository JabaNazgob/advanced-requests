import { AdvancedRequestsApp } from "./main.js";
import { Constants as C, visualNoverIsActive } from "./const.js";

Hooks.once('init', function() {
    const registerSettings = (key, _scope = 'world', _config = true, _type = Boolean, _default = true, _filePicker = null, onChange = () => {}, _choices = null, _range = null) => {
        game.settings.register(C.ID, key, {
        ...{
            name: game.i18n.localize(`${C.ID}.settings.${key}`),
            hint: game.i18n.localize(`${C.ID}.settings.${key}Hint`),
            scope: _scope,
            config: _config,
            type: _type,
            default: _default,
            onChange: onChange,
        }, 
        ...(_filePicker ? {filePicker: _filePicker} : {}),
        ...(_choices ? { choices: _choices } : {}),
        ...(_range ? { range: _range } : {})
    });
    }

    // Синхронизация с Visual Novel
    registerSettings("visualNovelSync", "world", visualNoverIsActive(), Boolean, true)

    // Воспроизводить звук при создании заявок
    registerSettings("soundCreate", "client", true, Boolean, true)
    // Громкость звука при создании заявок
    registerSettings("soundCreateVolume", "client", true, Number, 50, null, null, null, {min: 0, max: 100, step: 1})
    // Воспроизводить звук при активации заявок
    registerSettings("soundActivate", "client", true, Boolean, true)
    // Громкость звука при активации заявок
    registerSettings("soundActivateVolume", "client", true, Number, 50, null, null, null, {min: 0, max: 100, step: 1})
    // Использовать громкость звука Интерфейса фаундри
    registerSettings("useFoundryInterfaceVolume", "client", true, Boolean, true)
    // Сообщение при активации заявок
    registerSettings("messageActivate", "client", true, Boolean, true)
    // Ширина поля заявок в Свободном окне зависит от количества заявок
    registerSettings("widthDependOnQueue", "client", true, Boolean, false, null, reRender)
    // Звук заявок (путь к файлу)
    registerSettings("reqClickSound", "client", true, String, "modules/advanced-requests/assets/samples/fingerSnapping.wav", "audio")
    // Что использовать для заявок
    const ufrChooseList = {
        "playerToken": game.i18n.localize(`${C.ID}.settings.ufrPlayerToken`),
        "playerActor": game.i18n.localize(`${C.ID}.settings.ufrPlayerActor`),
        "token": game.i18n.localize(`${C.ID}.settings.ufrToken`), 
        "actor": game.i18n.localize(`${C.ID}.settings.ufrActor`), 
        "user": game.i18n.localize(`${C.ID}.settings.ufrUser`), 
        "controlled": game.i18n.localize(`${C.ID}.settings.ufrControlled`), 
        "custom": game.i18n.localize(`${C.ID}.settings.ufrCustom`)
    };
    registerSettings("useForRequests", "client", true, String, "playerToken", null, false, ufrChooseList)
    // ID выбранного игроком Актёра
    registerSettings("selectedActorId", "client", true, String, "")
    // Кастомное изображение для заявок
    registerSettings("customImage", "client", true, String, "", "image")
    // Кастомное имя для заявок
    registerSettings("customName", "client", true, String, "")
    // Высота списка заявок под чатом
    registerSettings("chatQueueHeight", "client", true, Number, 60, null, changeChatQueueHeight)
    // Положение окна заявок
    registerSettings("requestsPosition", "client", true, String, "chat", null, updatePosition, {"chat": game.i18n.localize(`${C.ID}.settings.qpChat`), "freeScreen": game.i18n.localize(`${C.ID}.settings.qpFreeScreen`)})
    // zIndex окна заявок
    registerSettings("freeScreenZIndex", "client", true, Number, 10, null, reRender)

    // Отображать заявки:
    // - 1-й уровень заявок
    registerSettings("firstRequest", "world", true, Boolean, true, null, updateChatRequestButtons)
    // - 2-й уровень заявок
    registerSettings("secondRequest", "world", true, Boolean, true, null, updateChatRequestButtons)
    // - 3-й уровень заявок
    registerSettings("thirdRequest", "world", true, Boolean, true, null, updateChatRequestButtons)

    // СКРЫТЫЕ
    // Очередь заявок
    registerSettings("queue", "world", false, Array, [])
    // Данные окна заявок в свободке
    registerSettings("freeScreenData", "client", false, Object, {})
});

Hooks.on("ready", () => {
    AdvancedRequestsApp.activate();
})

function changeChatQueueHeight() {
    const chatQueueEl = document.getElementById("advanced-requests-chat-body");
    if (chatQueueEl) {
        const elHeight = game.settings.get(C.ID, "chatQueueHeight")
        chatQueueEl.style.minHeight = `${elHeight}px`
        chatQueueEl.style.maxHeight = `${elHeight}px`
    }
}

function updateChatRequestButtons() {
    const buttonsBoxEl = document.getElementById("advanced-requests-chat-body")?.querySelector(".ar-chat-buttons")
    if (buttonsBoxEl) {
        buttonsBoxEl.innerHTML = "";
        ["first", "second", "third"].forEach((reqLevel, i) => {
            if (!game.settings.get(C.ID, `${reqLevel}Request`)) return
            const button = document.createElement('div')
            button.className = `ar-chat-button ar-level-${i}`
            button.innerHTML = `<i class="fa-${i == 0 ? "regular" : "solid"} fa-hand${i == 2 ? "-sparkles" : ""} ar-request-icon"></i>`
            button.dataset.tooltip = game.i18n.localize(`${C.ID}.buttons.${reqLevel}RequestTooltip`)
            button.addEventListener("click", async () => {
                await addRequest(i)
            })
            buttonsBoxEl.append(button)
        })
    }
    AdvancedRequestsApp._render()
}

function reRender() {
    AdvancedRequestsApp._render()
}

function updatePosition(value) {
    AdvancedRequestsApp._render();
    document.getElementById("advanced-requests-chat-body").style.display = (value == "chat" ? null : "none")
}
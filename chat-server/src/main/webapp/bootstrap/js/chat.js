let socket;
const groupChatName = "群聊室";
let defaultHeadImg = "../img/dog.png";
let currentChatUserNick = groupChatName;
let currentChatUserId;

const myNick = GetQueryString("nick");
const webSocketUrl = "ws://localhost:7979/websocket?userId=" + myNick;
let me;

const GROUP_CHAT_MESSAGE_CODE = 2;
const SYSTEM_MESSAGE_CODE = 5;
const PRIVATE_CHAT_MESSAGE_CODE = 1;
const PING_MESSAGE_CODE = 3;

const TYPE_NORMAL_SYSTEM_MESSGAE = 1;
const TYPE_UPDATE_USERCOUNT_SYSTEM_MESSGAE = 2;
const TYPE_UPDATE_USERLIST_SYSTEM_MESSGAE = 3;
const TYPE_PERSONAL_SYSTEM_MESSGAE = 4;

function systemMessage(data) {
    switch (data.type) {
        case TYPE_UPDATE_USERLIST_SYSTEM_MESSGAE:
            let users = data.ext.userList;
            $('#userCount').text("在线人数：" + users.length);
            
            let userList = $("#userList");
            let repeatBox = $("#repeatBox");
            let appendString;
            userList.text("");
            userList.append(
                '<div class="chat_item" onClick="chooseUser(null, null)" style="z-index: ">' +
                '<img class="avatar img-circle" src="../img/chatroom.png" style="height: 50px;width: 50px">' +
                '<img id="redPoint" class="img-circle" src="../img/redPoint.png" style="height: 10px;width: 10px;position: absolute;left: 60;display: none">' +
                '<div style="color: white;font-size: large">群聊室</div>' +
                '</div>');
            users.forEach(function (user) {
                userList.append(
                    '<div class="chat_item" onClick="chooseUser(\'' + user + '\',\'' + user + '\')">' +
                    '<img class="avatar img-circle" src=' + defaultHeadImg + ' style="height: 50px;width: 50px">' +
                    '<img id="redPoint-' + user + '" class="img-circle" src="../img/redPoint.png" style="height: 10px;width: 10px;position: absolute;left: 60;display: none">' +
                    '<div style="color: white;font-size: large">' + user + '</div>' +
                    '</div>');
                appendString =
                    ['<div class="box" id="box-' + user + '" style="display: none">',
                        '    <div class="textareaHead" id="textareaHead">' + user + '</div>',
                        '    <div class="textarea scroll" id="responseContent-' + user + '"></div>',
                        '    <form onSubmit="return false;">',
                        '        <label>',
                        '            <textarea class="box_ft" name="message" id="sendTextarea-' + user + '"></textarea>',
                        '        </label>',
                        '        <div class="send"><button class="sendButton" onClick="sendMessageToUser(this.form.message.value, currentChatUserId)">发送</button></div>',
                        '    </form>',
                        '</div>'].join("");
                repeatBox.append(appendString);
            });
            break;
    }
}

function websocket() {
	me = new Object();
	me.userId = GetQueryString('nick')
    if (!window.WebSocket) {
        window.WebSocket = window.MozWebSocket;
    }
    if (window.WebSocket) {
        socket = new WebSocket(webSocketUrl);
        socket.onmessage = function (event) {
            let data = JSON.parse(event.data);
            console.log(JSON.stringify(data));
            switch (data.code) {
                case GROUP_CHAT_MESSAGE_CODE:
                    if (data.sendUserId !== me.userId) {
                        $("#responseContent").append(
                            "   <div class='chatMessageBox'>" +
                            "       <img class='chatAvatar' src='" + defaultHeadImg + "'>" +
                            "       <div class='chatTime'>" + data.username + "&nbsp;&nbsp; " + data.sendTime + "</div>" +
                            "       <div class='chatMessgae'><span>" + data.msg + "</span></div>" +
                            "   </div>");
                    } else {
                        $("#responseContent").append(
                            "   <div class='chatMessageBox_me'>" +
                            "       <img class='chatAvatar_me' src='" + defaultHeadImg + "'>" +
                            "       <div class='chatTime'>" + data.sendTime + "&nbsp;&nbsp; " + data.username + "</div>" +
                            "       <div class='chatMessgae_me'><span>" + data.msg + "</span></div>" +
                            "   </div>");
                    }
                    updateRedPoint(null);
                    boxScroll(document.getElementById("responseContent"));
                    break;
                case SYSTEM_MESSAGE_CODE:
                    systemMessage(data);
                    boxScroll(document.getElementById("responseContent"));
                    break;
                case PING_MESSAGE_CODE:
                	sendPong();
                	break;
                case PRIVATE_CHAT_MESSAGE_CODE:
                    if (data.sendUserId !== me.userId) {
                        $("#responseContent-" + data.sendUserId).append(
                            "   <div class='chatMessageBox'>" +
                            "       <img class='chatAvatar' src='" + defaultHeadImg + "'>" +
                            "       <div class='chatTime'>" + data.sendUserId + "&nbsp;&nbsp;  " + data.sendTime + "</div>" +
                            "       <div class='chatMessgae'><span>" + data.msg + "</span></div>" +
                            "   </div>");
                    } else {
                        $("#responseContent-" + data.receiverUserId).append(
                            "   <div class='chatMessageBox_me'>" +
                            "       <img class='chatAvatar_me' src=" + defaultHeadImg + ">" +
                            "       <div class='chatTime'>" + data.sendTime + "&nbsp;&nbsp; " + data.sendUserId + "</div>" +
                            "       <div class='chatMessgae_me'><span>" + data.msg + "</span></div>" +
                            "   </div>");
                    }
                    if (data.sendUserId != me.userId) {
                    	updateRedPoint(data.sendUserId);
                    }
                    boxScroll(document.getElementById("responseContent-" + data.sendUserId));
                    break;
                
            }
        };
        socket.onopen = function () {
            loginSend();
        };
        socket.onclose = function () {
            quitSend();
        };
        return true;
    } else {
        alert("您的浏览器不支持WebSocket");
        return false;
    }
}

function loginSend() {
    let object = {};
    object.code = 1000;
    object.username = myNick;
    send(JSON.stringify(object));
}

function quitSend() {
    let object = {};
    object.code = 1001;
    object.username = myNick;
    send(JSON.stringify(object));
}


function sendPong() {
    let object = {};
    object.code = 4;
    send(JSON.stringify(object));
}

function sendMessageToUser(message, id) {
    if (message === "" || message == null) {
        alert("信息不能为空~");
        return;
    }
    let object = {};
    object.code = 1;
    object.username = myNick;
    object.sendUserId = me.userId;
    object.receiverUserId = id;
    object.msg = message;
    $('#sendTextarea-' + id).val("");
    send(JSON.stringify(object));
}

function sendMessage(message) {
    if (message === "" || message == null) {
        alert("信息不能为空~");
        return;
    }
    let object = {};
    object.code = 2;
    object.username = myNick;
    object.msg = message;
    object.sendUserId = me.userId;
    $('#sendTextarea').val("");
    send(JSON.stringify(object));
}

function send(message) {
    if (!window.WebSocket) {
        return;
    }
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        alert("WebSocket连接没有建立成功！！");
    }
}

function chooseUser(username, id) {
    let box = $("#box");
    if (username != null) {
        $("#redPoint-" + id).css("display", "none");
        if (currentChatUserNick === groupChatName) {
            $("#box-" + id).css("display", "block");
            box.css("display", "none");
            currentChatUserNick = username;
            currentChatUserId = id;
        } else if (currentChatUserNick !== groupChatName && currentChatUserId !== id) {
            $("#box-" + id).css("display", "block");
            $("#box-" + currentChatUserId).css("display", "none");
            currentChatUserNick = username;
            currentChatUserId = id;
        }
    } else if (username === null && currentChatUserNick !== groupChatName) {
        $("#redPoint").css("display", "none");
        $("#box-" + id).css("display", "none");
        box.css("display", "block");
        currentChatUserNick = groupChatName;
    }
}

/**
 * 新消息红点提醒
 * @param id
 */
function updateRedPoint(id) {
    if (id == null && currentChatUserNick !== groupChatName) {
        $("#redPoint").css("display", "block");
    } else if (currentChatUserId !== id && id !== me.id) {
        $("#redPoint-" + id).css("display", "block");
    }
}

/**
 * Get 请求获取参数
 * @return {null}
 * @param name 参数名
 */
function GetQueryString(name) {
    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return unescape(decodeURI(decodeURI(r[2])));
    }
    return null;
}

/**
 * 滚动条置底
 * @param o document.getElementById("id")
 */
function boxScroll(o) {
    o.scrollTop = o.scrollHeight;
}
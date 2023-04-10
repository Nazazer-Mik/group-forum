let id = sessionStorage.getItem("id");
let activeRoom = "main";
let decades = 0;

const moreBtn = `
<a class = "load__more" id = "load__more" onclick = "LoadMore()">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path d="M5.029 2.217a6.5 6.5 0 019.437 5.11.75.75 0 101.492-.154 8 8 0 00-14.315-4.03L.427 1.927A.25.25 0 000 2.104V5.75A.25.25 0 00.25 6h3.646a.25.25 0 00.177-.427L2.715 4.215a6.491 6.491 0 012.314-1.998zM1.262 8.169a.75.75 0 00-1.22.658 8.001 8.001 0 0014.315 4.03l1.216 1.216a.25.25 0 00.427-.177V10.25a.25.25 0 00-.25-.25h-3.646a.25.25 0 00-.177.427l1.358 1.358a6.501 6.501 0 01-11.751-3.11.75.75 0 00-.272-.506z"></path><path d="M9.06 9.06a1.5 1.5 0 11-2.12-2.12 1.5 1.5 0 012.12 2.12z"></path></svg>
</a>`;

if (!id)
    window.location.href = "../";


window.addEventListener('load', () => {
    let headH = document.getElementById("head").offsetHeight;
    document.getElementById("right").style.top = headH + "px";
    LoadPosts();
    LoadMembers();
})

async function publishMsg() 
{
    let msg = document.getElementById('msg');

    if (msg.value.match(/^\s+$/) || msg.value == "")
        return;

    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id': id, 'room': activeRoom, 'time': GetTime(), 'message': msg.value})
    }

    let res = await fetch('/publish', options);

    if (res.ok)
        msg.value = "";
    GoTo(activeRoom);
}

async function LoadPosts()
{
    decades++;
    let ms = document.getElementById('main-stream');
    let blocks = "";
    let msgs = [];

    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({dec: decades, room: activeRoom})
    }

    let res = await fetch('/get-posts', options);
    let objs = await res.json();

    objs.forEach( e => {
        blocks += GetMsgBlock(e);
        msgs.push({message: e.message, nickname: e.username});
    });

    blocks += moreBtn;
    
    ms.insertAdjacentHTML("beforeEnd", blocks);
    let bs = document.getElementsByClassName('msg-body');
    let ns = document.getElementsByClassName('msg-author-nickname');
    for (let i = 0; i < bs.length; i++)
    {
        bs[i].insertAdjacentText("afterBegin", msgs[i].message);
        ns[i].insertAdjacentText("afterBegin", msgs[i].nickname);
    }
}

async function LoadMembers()
{
    let m = document.getElementById('members');
    let blocks = "";
    let names = [];

    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({room: activeRoom})
    }

    let res = await fetch('/get-members', options);
    let objs = await res.json();

    objs.forEach( m => {
        blocks += GetMemberBlock(m);
        names.push(m.username);
    });
    
    m.insertAdjacentHTML("beforeEnd", blocks);
    let mn = document.getElementsByClassName('member__nickname');
    for (let i = 0; i < mn.length; i++)
    {
        mn[i].insertAdjacentText("afterBegin", names[i]);
    }
}

function GetMsgBlock(obj)
{
    let time_public = new Date(obj.time);
    return `<div class = "msg-box">
    <div class = "msg-author-line">
        <img src = "../images/avatars/CursedCat.jpg" class = "msg-author-img">
        <div class = "divider"></div>
        <div class = "msg-author-nickname"></div>
        <div class = "divider"></div>
        <div class = "publish-time">${time_public.toLocaleString()}</div>
        </div>
        <div class="msg-body"></div>
    </div>`;
}

function GetMemberBlock(mem)
{
    return `
    <div class = "member">
        <img src = "../images/avatars/CursedCat.jpg" class = "member__photo">
        <div class = "member__nickname"></div>
    </div>
    `;
}

function GoTo(rm)
{
    activeRoom = rm;
    document.getElementById('main-stream').innerHTML = "";
    LoadPosts();
}

function GetTime()
{
  let tm = new Date();
  return tm.getDate() + '/' + (tm.getMonth()+1) + '/' +
  tm.getFullYear() + '@' + tm.getHours() + ':' +
  tm.getMinutes() + ':' + tm.getSeconds();
}
const bd = "solid 3px #F15025";


function ChangeScr(source, mode)
{
    let menu = document.querySelector(".menu");
    let elem = document.querySelector(`.${source}`);

    switch(mode)
    {
        case 'add':
            menu.classList.add("goaway");
            setTimeout(() => {
                    menu.style.display = "none";
                    elem.style.display = "block";   
            }, 700);
            setTimeout(() => {elem.classList.add("goin");} , 800);
            break;
        case 'remove':
            elem.classList.remove("goin");
            setTimeout(() => {
                elem.style.display = "none";
                menu.style.display = "block";
            }, 700);
            setTimeout(() => {menu.classList.remove("goaway");} , 800);
            break;
    }
}

async function SendReg()
{
    let email = document.getElementById('email');
    let pass1 = document.getElementById('pass1');
    let pass2 = document.getElementById('pass2');
    let username = document.getElementById('username');
    let errdiv = document.getElementById("err");

    [email, username, pass1, pass2].forEach((e) => {
        e.style.border = "none";
    });

    try
    {
        if (!email.value.match(/^[\d\w-\.!@#$%^&*]+@([\d\w-]+\.)+[\d\w-]+$/i))
        {
            email.style.border = bd;
            throw new Error("Wrong email adress!");
        } 
        if (!username.value.match(/\S+/))
        {
            username.style.border = bd;
            throw new Error("Please, enter username!");
        }
        if (!pass1.value.match(/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{8,}/))
        {
            pass1.style.border = bd;
            throw new Error("The password is weak! It must contain at least 8 characters(1+ digit, 1+ uppercase letter, 1+ lowercase letter)!");
        }
        if (pass1.value != pass2.value)
        {
            pass1.style.border = pass2.style.border = bd;
            throw new Error("The first password does not match the second!");
        }
    } 
    catch(err)
    {
        errdiv.innerHTML = err.message;
        return;
    }

    errdiv.innerHTML = "";
    
    let user = {
        "email": email.value,
        "username": username.value,
        "password": pass1.value
    }

    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }

    let res = await fetch('/register', options);

    if (!res.ok)
    {
        errdiv.innerHTML = "Server died..."
        return;
    } 

    let stat = await res.text();
     if (stat != "ok")
     {
        errdiv.innerHTML = stat;
        return;
     }

    ChangeScr('registration', 'remove');
}

async function SendLog()
{
    let email = document.getElementById('lemail');
    let pass = document.getElementById('lpass');
    let errdiv = document.getElementById('err1');

    [email, pass].forEach((e) => e.style.border = "none");

    if (email.value == "")
    {
        email.style.border = bd;
        err.innerHTML = "Please, fill the email field!";
        return;
    } else if (pass.value == "")
    {
        pass.style.border = bd;
        err.innerHTML = "Please, fill the password field!";
        return;
    }

    err.innerHTML = "";

    let user = {
        "email": email.value,
        "password": pass.value
    }

    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }

    let res = await fetch('/login', options);

    if (!res.ok)
    {
        errdiv.innerHTML = "Server died..."
        return;
    } 

    let stat = await res.text();

    switch (stat)
    {
        case '1':
            err.innerHTML = "Error! There are no users with such email adress!";
            email.style.border = bd;
            break;
        case '2':
            err.innerHTML = "Error! Wrong password!";
            pass.style.border = bd;
            break;
        default:
            sessionStorage.setItem("id", stat);
            console.log(stat)
            window.location.href = "/forum";
            break;
    }
}
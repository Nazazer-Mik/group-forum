async function checkForRedirect()
{
    let id = sessionStorage.getItem("id");

    if(!id)
        return;

    let options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id': id})
    }

    let res = await fetch('/exist', options);
    let exist = await res.text();

    switch (exist)
    {
        case 'yes':
            window.location.href = "/forum";
            break;
        case 'no':
            sessionStorage.clear();
            break;
    }
}

checkForRedirect();
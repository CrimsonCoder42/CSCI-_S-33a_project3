document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#submit').addEventListener('click', send_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-list').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#view-type').innerHTML = `<h3>New Email</h3>`
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}


// takes all info from values and passes to API when promised is finished it loads sent mailbox
function send_email() {

    fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        .then(response => response.json())
        .then(result => {

            load_mailbox('sent')

        });

}


function read_email(id) {
    let currentHeader = document.querySelector('#view-type').innerText
    console.log(currentHeader)
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#emails-list').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-type').innerHTML = `<h3>${currentHeader} Email</h3>`
    // Clear out composition fields

// fetch email by ID and pass values to fill_in_values to populate input values

    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {

            console.log(email);
            fill_in_values(email)

        });

}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-list').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#view-type').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // fetch will load requested mail box and call function emailListDisplay() passing in all data.
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {

            emails.forEach(email => {
                console.log(email)
                emailListDisplay(email)
            })

        });
}


function emailListDisplay(data) {

    //Extract ID, sender, subject, timestamp, emails read

    let emails = data
    let emailID = emails.id
    let sender = emails.sender
    let subject = emails.subject
    let timestamp = emails.timestamp
    let read = emails.read
    let archive = emails.archived


    //add classes in the loop below
    let classes = ["mb-0 text-muted", "text-dark", "text-muted"]
    let content = [sender, subject, timestamp]


    // check to see if the tr elements already exist if not create, if they do delete.
    var elementID = document.getElementById(emailID);
    if (typeof (elementID) != 'undefined' && elementID != null) {

        elementID.remove()
    }

    let element = createElement("tr", emailID, read);
    document.querySelector('#emails').append(element);

    //generate and appendChild td and span, all info to span.
    for (let i = 0; i < 3; i++) {
        var tdId = `td${i}` + emailID
        const td = createElement("td", tdId)
        document.getElementById(emailID).appendChild(td)
        spanID = tdId + "span" + i
        const span1 = listenElement("a", spanID, archive, emailID)
        span1.className = classes[i]
        span1.innerHTML = content[i]
        document.getElementById(tdId).appendChild(span1);
    }

        btnID = tdId + "btn"
        const span2 = listenElement("button", btnID, archive, emailID)
        span2.className = "btn btn-primary btn-sm"
        span2.innerText = "Archive"
        document.getElementById(tdId).append(span2);

}

// creates/returns elements and adds an event listener effects color based on bool
function listenElement(ele, id, bool, att) {

    if (ele == "button") {
        const element = document.createElement(ele);
        element.id = id
        element.bool = bool
        element.setAttribute('data-index', att)

        element.addEventListener('click', function () {
        console.log(this.id, this.bool, this.dataset.index)
        archive(this.dataset.index, this.bool)

        });
        return element
    }

    const element = document.createElement(ele);
    element.classes = id
    element.bool = bool
    element.setAttribute('data-index', att)


    element.addEventListener('click', function () {
        console.log(this.dataset.index, this.bool)
        read_email(this.dataset.index)

    });
    return element
}

//creates/returns an element without event listener
function createElement(ele, id, bool) {
    const element = document.createElement(ele);
    element.id = id

    if (bool == false) {
        element.style.backgroundColor = '#E6E6E3'
    }
    return element
}

function fill_in_values(data) {
    // takes in all info to populate email clicked called on line 43
    let header = document.querySelector('#view-type').innerText

    let timeDate = data.timestamp
    let body = data.body
    let subject = data.subject
    let sender = data.sender
    let receiver = data.recipients

//if the main title says Sent Email we load the sent format else we load the inbox format

    if (header == "Sent Email"){

        document.querySelector('#email-sender').innerText = "Me";
        document.querySelector('#email-receiver').innerText = sender;
        document.querySelector('#dateTime').innerText = timeDate;
        document.querySelector('#email-subject').innerText = subject;
        document.querySelector('#email-body').value = body;

    } else {

        document.querySelector('#email-sender').innerText = sender;
        document.querySelector('#email-receiver').innerText = "Me";
        document.querySelector('#dateTime').innerText = timeDate;
        document.querySelector('#email-subject').innerText = subject;
        document.querySelector('#email-body').value = body;


     fetch(`/emails/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
      })
    }

}

function archive(id, bool) {

    let newBool = bool == true ? false : true;

    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: newBool
        })
      })

    load_mailbox('inbox');
    }


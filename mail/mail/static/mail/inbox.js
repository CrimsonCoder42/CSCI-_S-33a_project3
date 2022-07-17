document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#submit').addEventListener('click', send_email);
    document.querySelector('#email_replay').addEventListener('click', reply);

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

// load_mailbox calls functions below to generate view of email list. Each list is a different view for a cleaner interface.
    if (mailbox == 'inbox') {
        inbox()
    } else if (mailbox == 'sent') {
        sent()
    } else if(mailbox == 'archive') {
        archive()
    }
}

//reply button, function takes innerText and value elements and replaces in compose email.
function reply() {

    let senderEmail = document.querySelector('#email-sender').innerText
    let subject = document.querySelector('#email-subject').innerText
    let body = document.getElementById('email-body').value
    let datetime = document.querySelector('#dateTime').innerText
    compose_email()
    document.querySelector('#compose-recipients').value = senderEmail
    document.querySelector('#compose-subject').value = `Re: ${subject}`
    document.querySelector('#compose-body').value = `on ${datetime}, ${senderEmail} wrote: ${body}`
}


function inbox(){

    document.querySelector('#inbox_emails').style.display = 'block';
    document.querySelector('#sent_emails').style.display = 'none';
    document.querySelector('#archive_emails').style.display = 'none';

    fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
            emails.forEach(email => {
                createList(email, 'inbox', '#inbox_emails')
            })
        });
}


function sent(){
    document.querySelector('#inbox_emails').style.display = 'none';
    document.querySelector('#sent_emails').style.display = 'block';
    document.querySelector('#archive_emails').style.display = 'none';
    document.querySelector('#toFrom').innerText = "To";

    fetch('/emails/sent')
        .then(response => response.json())
        .then(emails => {
            emails.forEach(email => {
                createList(email, 'sent', '#sent_emails')
            })
        });
}


function archive(){
    document.querySelector('#inbox_emails').style.display = 'none';
    document.querySelector('#sent_emails').style.display = 'none';
    document.querySelector('#archive_emails').style.display = 'block';

    fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
            emails.forEach(email => {
                createList(email, 'archive', '#archive_emails')
            })
        });
}

//abstracts out the rows and emails for each view for code reduction.
function createList(email, name, querySelect) {

                // classes and content linked to each email row
                let classes = ["mb-0 text-muted", "text-dark", "text-muted"]
                let content = [email.sender, email.subject, email.timestamp]

                // check to see if the tr elements already exist if not create, if they do delete.
                var elementID = document.getElementById(`name${email.id}`);
                if (typeof (elementID) != 'undefined' && elementID != null) {

                        elementID.remove()
                }

                // creates a row for each email and fills in info depending on pramas
                let nameID = `name${email.id}`
                let element = createElement("tr", nameID, email.read);
                document.querySelector(querySelect).append(element);
                for (let i = 0; i < 3; i++) {
                    var tdId = `td${i}` + email.id + name
                    const td = createElement("td", tdId)
                    document.getElementById(nameID).appendChild(td)
                    spanID = tdId + "span" + i
                    const span1 = listenElement("a", spanID, email.archived, email.id)
                    span1.className = classes[i]
                    span1.innerHTML = content[i]
                    document.getElementById(tdId).appendChild(span1);
                }

                // makes sure archive button is added Only for archive and inbox.
                if(name == 'archive' || name == 'inbox'){

                    let buttonTitle = 'archive'

                //checks to make sure archive get a different button title
                    if (name == 'archive') {
                        buttonTitle = 'Unarchive'
                    }

                    btnID = tdId + "btn"
                    const archiveButton = listenElement("button", btnID, email.archived, email.id)
                    archiveButton.className = "btn btn-primary btn-sm"
                    archiveButton.innerText = buttonTitle
                    document.getElementById(tdId).append(archiveButton);

                }

}

// creates/returns elements and adds an event listener effects color based on bool and sets data attribute
function listenElement(ele, id, bool, att) {

    if (ele == "button") {
        const element = document.createElement(ele);
        element.id = id
        element.bool = bool
        element.setAttribute('data-index', att)

        element.addEventListener('click', function () {
        console.log(this.id, this.bool, this.dataset.index)
        archiveEmail(this.dataset.index, this.bool)

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

    let receiver = data.recipients
    let whoSent = data.sender

    if (header == "Sent Email"){
        whoSent =  "Me"
    }
        document.querySelector('#email-sender').innerText = whoSent;
        document.querySelector('#email-receiver').innerText = whoSent;
        document.querySelector('#dateTime').innerText = data.timestamp;
        document.querySelector('#email-subject').innerText = data.subject;
        document.querySelector('#email-body').value = data.body;

    // updates read for particular email
     fetch(`/emails/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
      })
}

// Once an email has been archived or unarchived, load the user’s inbox. Since inbox defaults simple reload location.reload() is cleaner.
function archiveEmail(id, bool) {
    console.log("archive", bool)
    let newBool = bool == true ? false : true;

    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: newBool
            })
        }).then( location.reload() )
    }




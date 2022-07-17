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


    if (mailbox == 'inbox') {
        inbox()
    } else if (mailbox == 'sent') {
        sent()
    } else if(mailbox == 'archive') {
        archive()
    }

}

//reply button function
function reply() {

    let senderEmail = document.querySelector('#email-sender').innerText
    let subject = document.querySelector('#email-subject').innerText
    let body = document.getElementById('email-body').value
    console.log(body)
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
                console.log(email)


                let classes = ["mb-0 text-muted", "text-dark", "text-muted"]
                let content = [email.sender, email.subject, email.timestamp]


    // check to see if the tr elements already exist if not create, if they do delete.
                var elementID = document.getElementById(`inbox${email.id}`);
                if (typeof (elementID) != 'undefined' && elementID != null) {

                        elementID.remove()
                }

                let inboxID = `inbox${email.id}`
                let element = createElement("tr", inboxID, email.read);
                document.querySelector('#inbox_emails').append(element);
                for (let i = 0; i < 3; i++) {
                    var tdId = `td${i}` + email.id + "input"
                    const td = createElement("td", tdId)
                    document.getElementById(inboxID).appendChild(td)
                    spanID = tdId + "span" + i
                    const span1 = listenElement("a", spanID, email.archived, email.id)
                    span1.className = classes[i]
                    span1.innerHTML = content[i]
                    document.getElementById(tdId).appendChild(span1);
                }

               btnID = tdId + "btn"
               const archiveButton = listenElement("button", btnID, email.archived, email.id)
               archiveButton.className = "btn btn-primary btn-sm"
               archiveButton.innerText = "Archive"
               document.getElementById(tdId).append(archiveButton);
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
                console.log(email)


                let classes = ["mb-0 text-muted", "text-dark", "text-muted"]
                let content = [email.recipients, email.subject, email.timestamp]


    // check to see if the tr elements already exist if not create, if they do delete.
                var elementID = document.getElementById(`sent${email.id}`);
                if (typeof (elementID) != 'undefined' && elementID != null) {

                        elementID.remove()
                }

                let sentID = `sent${email.id}`
                let element = createElement("tr", sentID, email.read);
                document.querySelector('#sent_emails').append(element);
                for (let i = 0; i < 3; i++) {
                    var tdId = `td${i}` + sentID + "sent"
                    const td = createElement("td", tdId)
                    document.getElementById(sentID).appendChild(td)
                    spanID = tdId + "span" + i
                    const span1 = listenElement("a", spanID, email.archived, email.id)
                    span1.className = classes[i]
                    span1.innerHTML = content[i]
                    document.getElementById(tdId).appendChild(span1);
                }


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
                console.log(email)

                let classes = ["mb-0 text-muted", "text-dark", "text-muted"]
                let content = [email.sender, email.subject, email.timestamp]


    // check to see if the tr elements already exist if not create, if they do delete.
                var elementID = document.getElementById(`archive${email.id}`);
                if (typeof (elementID) != 'undefined' && elementID != null) {

                        elementID.remove()
                }

                let archiveID = `archive${email.id}`
                let element = createElement("tr", archiveID, email.read);
                document.querySelector('#archive_emails').append(element);
                for (let i = 0; i < 3; i++) {
                    var tdId = `td${i}` + email.id + "archive"
                    const td = createElement("td", tdId)
                    document.getElementById(archiveID).appendChild(td)
                    spanID = tdId + "span" + i
                    const span1 = listenElement("a", spanID, email.archived, email.id)
                    span1.className = classes[i]
                    span1.innerHTML = content[i]
                    document.getElementById(tdId).appendChild(span1);
                }

               btnID = tdId + "btn"
               const archiveButton = listenElement("button", btnID, email.archived, email.id)
               archiveButton.className = "btn btn-primary btn-sm"
               archiveButton.innerText = "Unarchive"
               document.getElementById(tdId).append(archiveButton);
            })

        });
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




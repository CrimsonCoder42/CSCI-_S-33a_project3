document.addEventListener('DOMContentLoaded', function() {

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

function read_email(id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-list').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-type').innerHTML = `<h3>New Email</h3>`
  // Clear out composition fields



  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {

    console.log(email);
    fill_in_values(email.sender, email.subject, email.body)

});




}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-list').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#view-type').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

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

//add classes in the loop below
    let classes = ["mb-0 text-muted","text-dark", "text-muted" ]
    let content = [sender, subject, timestamp]


// check to see if the tr elements already exist if not create, if they do delete
    var elementID =  document.getElementById(emailID);
    if(typeof(elementID) != 'undefined' && elementID != null){

       elementID.remove()
        }

	let element = listenElement("tr", emailID, read);
    document.querySelector('#emails').append(element);

//generate and appendChild td and span, all info to span.
    for(let i = 0; i < 3; i++) {
        let tdId = `td${i}`+ emailID
        const td = createElement("td", tdId)
        document.getElementById(emailID).appendChild(td)
        spanID = tdId + "span" + i
        const span1 = createElement("span", spanID)
        span1.className = classes[i]
        span1.innerHTML = content[i]
        document.getElementById(tdId).appendChild(span1);
    }

}

// creates/returns elements and adds an event listener
function listenElement(ele, id, bool) {
    const element = document.createElement(ele);
    element.id = id
    if (bool == false) {
        element.style.backgroundColor = '#E6E6E3'
    }
    element.addEventListener('click', function() {
        console.log(this.id)
        read_email(this.id)

        });
    return element
}

//creates/returns a function without event listener
function createElement(ele, id) {
    const element = document.createElement(ele);
    element.id = id

    return element
}


function send_email () {

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
    // Print result
    console.log(result);
});

}

function fill_in_values(sender, subject, value) {
// takes in all info to populate email clicked called on line 43

    document.querySelector('#email-sender').value = sender;
    document.querySelector('#email-subject').value = subject;
    document.querySelector('#email-body').value = value;
}
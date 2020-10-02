const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Story = require('../models/story');

//login landing page
//get route
router.get('/', ensureGuest, (req, res) => {
  res.render('login', {layout: 'login',});
});


//dashboard
//get route
router.get('/dashboard', ensureAuth, async (req, res) => {
  try{
    const stories = await Story.find({ user: req.user.id}).lean()
    res.render('dashboard',{
      name:req.user.firstName, stories
    })
  } catch (err) {
console.error(err)
res.render('error/500')
  }

});

//get route
router.get('/contact', ensureAuth, (req, res) => {
  res.render('contact');
});

router.post('/send', (req, res) => {
  const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Phone: ${req.body.phone}</li>
        <li>Subject: ${req.body.subject}</li>
      </ul>
      <h3>Message</h3>
      <p>${req.body.message}</p>
    `;



    let transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "5c45eea5672f36",
        pass: "70b8eb187fa5d5"
      }
    });



  // setup email data with unicode symbols
  let mailOptions = {
    from: req.body.email, // sender address
    to: 'minnahogbu@gmail.com', // list of receivers
    subject: 'Message From QuickCook', // Subject line
    text: req.body.message, // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.render('message', { msg: 'Your Email Has Been Sent Successfully' });
  });
});

module.exports = router;
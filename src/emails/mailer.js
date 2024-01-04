const nodemailer =require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: 'fortijc@gmail.com',
    pass: 'vhhd pdng sulh wikh'
  }
});


transporter.verify().then(()=>{
    console.log('ready for send emails');
});

module.exports = transporter;

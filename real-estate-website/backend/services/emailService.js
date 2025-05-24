const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// Function to send verification email
const sendVerificationEmail = async (email, token, userId) => {
  // Base URL for verification (should be configurable via environment variable)
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/verify-email?token=${token}&id=${userId}`;
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@realestate.com',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
          <p>
            <a 
              href="${verificationUrl}" 
              style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;"
            >
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail
}; 
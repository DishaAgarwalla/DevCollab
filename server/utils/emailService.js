const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"DevCollab" <${process.env.EMAIL_FROM || 'noreply@devcollab.com'}>`,
      to,
      subject,
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to DevCollab! 🚀';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to DevCollab</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; background: #f9fafb; }
        .content h2 { color: #1f2937; margin-top: 0; }
        .content p { color: #4b5563; margin: 16px 0; }
        .feature-list { list-style: none; padding: 0; margin: 20px 0; }
        .feature-list li { padding: 8px 0; color: #4b5563; display: flex; align-items: center; gap: 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: #ffffff; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body style="margin: 0; padding: 20px; background: #f3f4f6;">
      <div class="container">
        <div class="header">
          <h1>Welcome to DevCollab! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>Welcome to DevCollab! We're thrilled to have you join our community of developers.</p>
          <p>Here's what you can do next:</p>
          <ul class="feature-list">
            <li>🎯 <strong>Complete your profile</strong> - Add your skills and experience</li>
            <li>🔍 <strong>Explore projects</strong> - Find projects that match your interests</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects" class="button">Explore Projects →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DevCollab. All rights reserved.</p>
          <p>Connect, collaborate, and build amazing projects together.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(user.email, subject, html);
};

// Send join request email to project owner
const sendJoinRequestEmail = async (projectOwner, requester, project) => {
  const subject = `🔔 New Join Request for "${project.title}"`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Join Request</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; background: #f9fafb; }
        .info-box { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6366F1; }
        .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: white; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Join Request! 🔔</h1>
        </div>
        <div class="content">
          <h2>Hi ${projectOwner.name},</h2>
          <p><strong>${requester.name}</strong> has requested to join your project.</p>
          <div class="info-box">
            <p style="margin: 0 0 10px;"><strong>📁 Project:</strong> ${project.title}</p>
            <p style="margin: 0 0 10px;"><strong>👤 Requester:</strong> ${requester.name}</p>
            <p style="margin: 0;"><strong>📧 Email:</strong> ${requester.email}</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/requests" class="button">Review Request →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DevCollab. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(projectOwner.email, subject, html);
};

// Send request accepted email
const sendRequestAcceptedEmail = async (requester, project, ownerName) => {
  const subject = `🎉 Your request to join "${project.title}" was accepted!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Request Accepted</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10B981, #059669); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; background: #f9fafb; }
        .button { display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: white; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Request Accepted! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${requester.name},</h2>
          <p>Great news! <strong>${ownerName}</strong> has accepted your request to join <strong>"${project.title}"</strong>.</p>
          <p>You can now:</p>
          <ul>
            <li>💬 Chat with team members</li>
            <li>📋 View and manage tasks</li>
            <li>📎 Share files and resources</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/team/${project._id}" class="button">Go to Project →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DevCollab. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(requester.email, subject, html);
};

// Send task assigned email
const sendTaskAssignedEmail = async (assignee, task, project, assignerName) => {
  const subject = `📋 New Task Assigned: "${task.title}"`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Task Assigned</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #F59E0B, #D97706); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; background: #f9fafb; }
        .info-box { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #F59E0B; }
        .button { display: inline-block; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: white; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Task Assigned! 📋</h1>
        </div>
        <div class="content">
          <h2>Hi ${assignee.name},</h2>
          <p><strong>${assignerName}</strong> has assigned you a new task.</p>
          <div class="info-box">
            <p style="margin: 0 0 10px;"><strong>📝 Task:</strong> ${task.title}</p>
            <p style="margin: 0 0 10px;"><strong>🎯 Priority:</strong> ${task.priority || 'Medium'}</p>
            ${task.dueDate ? `<p style="margin: 0;"><strong>📅 Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/team/${project._id}?tab=tasks" class="button">View Task →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DevCollab. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(assignee.email, subject, html);
};

// Send mention email
const sendMentionEmail = async (mentionedUser, project, message, mentionerName) => {
  const subject = `🔔 ${mentionerName} mentioned you in "${project.title}"`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You were mentioned</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; background: #f9fafb; }
        .message-box { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #8B5CF6; font-style: italic; }
        .button { display: inline-block; background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: white; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You were mentioned! 🔔</h1>
        </div>
        <div class="content">
          <h2>Hi ${mentionedUser.name},</h2>
          <p><strong>${mentionerName}</strong> mentioned you in a message.</p>
          <div class="message-box">
            <p style="margin: 0; color: #4b5563;">"${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"</p>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${project._id}" class="button">View Message →</a>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} DevCollab. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail(mentionedUser.email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendJoinRequestEmail,
  sendRequestAcceptedEmail,
  sendTaskAssignedEmail,
  sendMentionEmail,
};
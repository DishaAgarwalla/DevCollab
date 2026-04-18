// Email Templates Configuration
// This file contains reusable email template parts

// Base template wrapper
const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366F1, #8B5CF6); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; background: #f9fafb; }
    .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; background: white; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
    .info-box { background: white; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6366F1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DevCollab</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} DevCollab. All rights reserved.</p>
      <p>Connect, collaborate, and build amazing projects together.</p>
      <p style="margin-top: 10px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #6366F1; text-decoration: none;">Visit Website</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// Welcome email template
const welcomeTemplate = (userName) => baseTemplate(`
  <h2 style="color: #1f2937; margin-top: 0;">Welcome to DevCollab, ${userName}! 🎉</h2>
  <p style="color: #4b5563; line-height: 1.6;">We're excited to have you join our community of developers. You're now part of a platform where amazing projects come to life through collaboration.</p>
  
  <div class="info-box">
    <h3 style="margin-top: 0;">✨ Quick Start Guide</h3>
    <ul style="color: #4b5563; padding-left: 20px;">
      <li>Complete your profile with your skills and experience</li>
      <li>Explore projects that match your interests</li>
      <li>Create your own project and invite teammates</li>
      <li>Start collaborating using tasks, chat, and file sharing</li>
    </ul>
  </div>
  
  <div style="text-align: center;">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects" class="button">Explore Projects →</a>
  </div>
`, 'Welcome to DevCollab');

// Join request template
const joinRequestTemplate = (ownerName, requesterName, projectTitle, projectId) => baseTemplate(`
  <h2 style="color: #1f2937; margin-top: 0;">New Join Request 🔔</h2>
  <p style="color: #4b5563; line-height: 1.6;">Hi ${ownerName},</p>
  <p style="color: #4b5563; line-height: 1.6;"><strong>${requesterName}</strong> has requested to join your project.</p>
  
  <div class="info-box">
    <p style="margin: 0 0 10px;"><strong>📁 Project:</strong> ${projectTitle}</p>
    <p style="margin: 0;"><strong>👤 Requester:</strong> ${requesterName}</p>
  </div>
  
  <div style="text-align: center;">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/requests" class="button">Review Request →</a>
  </div>
`, 'New Join Request');

// Request accepted template
const requestAcceptedTemplate = (requesterName, projectTitle, projectId) => baseTemplate(`
  <h2 style="color: #1f2937; margin-top: 0;">Request Accepted! 🎉</h2>
  <p style="color: #4b5563; line-height: 1.6;">Hi ${requesterName},</p>
  <p style="color: #4b5563; line-height: 1.6;">Great news! Your request to join <strong>"${projectTitle}"</strong> has been accepted.</p>
  
  <div class="info-box">
    <h3 style="margin-top: 0;">What you can do now:</h3>
    <ul style="color: #4b5563; margin-bottom: 0;">
      <li>💬 Chat with team members in real-time</li>
      <li>📋 View and manage project tasks</li>
      <li>📎 Share files and resources</li>
      <li>🚀 Start contributing to the project</li>
    </ul>
  </div>
  
  <div style="text-align: center;">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/team/${projectId}" class="button">Go to Project →</a>
  </div>
`, 'Request Accepted');

// Task assigned template
const taskAssignedTemplate = (assigneeName, taskTitle, projectTitle, projectId, priority, dueDate) => baseTemplate(`
  <h2 style="color: #1f2937; margin-top: 0;">New Task Assigned 📋</h2>
  <p style="color: #4b5563; line-height: 1.6;">Hi ${assigneeName},</p>
  <p style="color: #4b5563; line-height: 1.6;">You have been assigned a new task.</p>
  
  <div class="info-box">
    <p style="margin: 0 0 10px;"><strong>📝 Task:</strong> ${taskTitle}</p>
    <p style="margin: 0 0 10px;"><strong>🎯 Priority:</strong> ${priority || 'Medium'}</p>
    ${dueDate ? `<p style="margin: 0;"><strong>📅 Due Date:</strong> ${dueDate}</p>` : ''}
  </div>
  
  <div style="text-align: center;">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/team/${projectId}?tab=tasks" class="button">View Task →</a>
  </div>
`, 'New Task Assigned');

// Mention template
const mentionTemplate = (mentionedName, mentionerName, projectTitle, projectId, messagePreview) => baseTemplate(`
  <h2 style="color: #1f2937; margin-top: 0;">You were mentioned! 🔔</h2>
  <p style="color: #4b5563; line-height: 1.6;">Hi ${mentionedName},</p>
  <p style="color: #4b5563; line-height: 1.6;"><strong>${mentionerName}</strong> mentioned you in a message.</p>
  
  <div class="info-box">
    <p style="margin: 0; font-style: italic; color: #4b5563;">"${messagePreview}"</p>
  </div>
  
  <div style="text-align: center;">
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${projectId}" class="button">View Message →</a>
  </div>
`, 'You were mentioned');

module.exports = {
  baseTemplate,
  welcomeTemplate,
  joinRequestTemplate,
  requestAcceptedTemplate,
  taskAssignedTemplate,
  mentionTemplate,
};

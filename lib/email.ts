import { Resend } from 'resend';

// Initialize Resend client
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
  }
  return new Resend(apiKey);
}

// Send project invitation email
export async function sendProjectInvitationEmail({
  to,
  projectName,
  inviterName,
  role,
}: {
  to: string;
  projectName: string;
  inviterName: string;
  role: string;
}) {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@projectflow.app';
  
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `You've been invited to collaborate on ${projectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Project Invitation</h2>
          <p>Hello,</p>
          <p>${inviterName} has invited you to collaborate on <strong>${projectName}</strong> as a <strong>${role}</strong>.</p>
          <p>Log in to the application to start collaborating on this project.</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          <p>Thanks,<br>The ProjectFlow Team</p>
        </div>
      `,
    });
    
    return { success: true, messageId: result.data?.id || 'sent' };
  } catch (error: any) {
    console.error("Failed to send invitation email:", error);
    return { success: false, error: error.message };
  }
}

// Send role update email
export async function sendRoleUpdateEmail({
  to,
  projectName,
  updaterName,
  newRole,
}: {
  to: string;
  projectName: string;
  updaterName: string;
  newRole: string;
}) {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@projectflow.app';
  
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Your role has been updated in ${projectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Role Update</h2>
          <p>Hello,</p>
          <p>${updaterName} has updated your role in <strong>${projectName}</strong>.</p>
          <p>Your new role is: <strong>${newRole}</strong></p>
          <p>Log in to the application to see your updated permissions.</p>
          <p>If you have any questions about this change, please contact the project owner or administrator.</p>
          <p>Thanks,<br>The ProjectFlow Team</p>
        </div>
      `,
    });
    
    return { success: true, messageId: result.data?.id || 'sent' };
  } catch (error: any) {
    console.error("Failed to send role update email:", error);
    return { success: false, error: error.message };
  }
}

// Send removal notification email
export async function sendRemovalEmail({
  to,
  projectName,
  removerName,
}: {
  to: string;
  projectName: string;
  removerName: string;
}) {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@projectflow.app';
  
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `You've been removed from ${projectName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Project Removal</h2>
          <p>Hello,</p>
          <p>${removerName} has removed you from the project <strong>${projectName}</strong>.</p>
          <p>If you believe this was done in error, please contact the project owner or administrator.</p>
          <p>Thanks,<br>The ProjectFlow Team</p>
        </div>
      `,
    });
    
    return { success: true, messageId: result.data?.id || 'sent' };
  } catch (error: any) {
    console.error("Failed to send removal email:", error);
    return { success: false, error: error.message };
  }
}

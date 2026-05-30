import { resend, FROM_EMAIL } from "./index";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] To: ${to}, Subject: ${subject}`);
    return;
  }
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}

export async function sendWorkspaceInvite({
  to,
  workspaceName,
  inviterName,
  inviteUrl,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteUrl: string;
}) {
  await sendEmail({
    to,
    subject: `${inviterName} invited you to ${workspaceName} on DevTrack`,
    html: `
      <h2>You've been invited to ${workspaceName}</h2>
      <p>${inviterName} has invited you to join their workspace on DevTrack.</p>
      <p><a href="${inviteUrl}">Accept Invitation</a></p>
    `,
  });
}

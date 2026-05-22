import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

// ─── BRAND TOKENS ───

const gold = "#d4a853";
const goldLight = "#e8c06a";
const goldSoft = "rgba(212, 168, 83, 0.12)";
const goldGlow = "rgba(212, 168, 83, 0.06)";
const bg = "#060a17";
const bgCard = "#0c1125";
const bgWell = "#0f1429";
const cream = "#ece8e1";
const muted = "#7d7c7a";
const line = "rgba(255,255,255,0.06)";
const radius = "16px";

// ─── LOGO MARK (geometric H) ───

const logoMark = `
  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
    <tr>
      <td style="text-align: center;">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="28" height="28" rx="8" stroke="${gold}" stroke-width="1.5" fill="none"/>
          <path d="M10 10h4l4 6 4-6h4" stroke="${gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M10 22V16l6 6V16" stroke="${gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5"/>
        </svg>
      </td>
    </tr>
  </table>
`;

// ─── GEOMETRIC DIVIDER ───

function divider() {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 36px 0;">
      <tr>
        <td style="height: 1px; background: linear-gradient(90deg, transparent, ${goldSoft}, transparent);"></td>
      </tr>
    </table>
  `;
}

// ─── FOOTER ───

const footerBlock = `
  ${divider()}
  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
    <tr>
      <td style="text-align: center; padding-bottom: 8px;">
        <span style="color: ${gold}; font-size: 16px; font-weight: 400; letter-spacing: 0.08em; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">HERMESHIRE</span>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-bottom: 4px;">
        <span style="color: ${muted}; font-size: 12px; letter-spacing: 0.04em;">AI Hiring Copilot</span>
      </td>
    </tr>
    <tr>
      <td style="text-align: center;">
        <span style="color: ${muted}; font-size: 11px; opacity: 0.6;">Powered by Hermes-4-70B</span>
      </td>
    </tr>
  </table>
`;

// ─── WRAPPER ───

function wrapHtml(body: string): string {
  return `
    <div style="background: ${bg}; padding: 48px 20px; margin: 0; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- Background grid pattern -->
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; opacity: 0.015; background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px); background-size: 48px 48px;"></div>

      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; margin: 0 auto;">
        <tr>
          <td style="background: linear-gradient(145deg, ${bgCard}, ${bgWell}); border-radius: ${radius}; padding: 48px 44px; border: 1px solid ${line}; box-shadow: 0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03);">

            <!-- Gold accent glow -->
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 36px;">
              <tr>
                <td style="height: 3px; background: linear-gradient(90deg, transparent, ${gold} 20%, ${goldLight} 50%, ${gold} 80%, transparent); border-radius: 2px; box-shadow: 0 0 20px ${goldGlow};"></td>
              </tr>
            </table>

            ${logoMark}
            ${body}
            ${footerBlock}

          </td>
        </tr>
      </table>
    </div>
  `;
}

// ─── CTA BUTTON ───

function ctaButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto 28px;">
      <tr>
        <td style="border-radius: 10px; background: linear-gradient(135deg, ${gold} 0%, ${goldLight} 100%); box-shadow: 0 4px 24px ${goldGlow}, 0 1px 3px rgba(0,0,0,0.2); text-align: center; padding: 14px 40px;">
          <a href="${href}" style="color: #000; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.01em; display: block;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// ─── CLI COMMAND BLOCK ───

function cliBlock(commands: string[]) {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="background: rgba(0,0,0,0.4); border: 1px solid ${line}; border-radius: 10px; padding: 20px 24px;">
          <p style="margin: 0 0 12px; color: ${gold}; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">CLI Quick Actions</p>
          <code style="display: block; color: ${cream}; font-size: 13px; line-height: 1.8; font-family: 'SF Mono', 'Fira Code', monospace;">
            ${commands.map(c => `${c}<br>`).join("")}
          </code>
        </td>
      </tr>
    </table>
  `;
}

// ─── PUBLIC API ───

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set. Skipping email send.");
    return { success: false, error: "Resend not configured" };
  }

  const from = process.env.EMAIL_FROM || "HermesHire <notifications@hermes-hire.xyz>";

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: wrapHtml(html),
  });

  if (error) {
    console.error("Resend error:", error);
    return { success: false, error };
  }

  return { success: true, id: data?.id };
}

/**
 * Candidate onboarding invitation.
 */
export async function sendCandidateInviteEmail(params: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName?: string;
  companyDescription?: string;
  onboardLink: string;
}) {
  const company = params.companyName || "the company";

  return sendEmail({
    to: params.candidateEmail,
    subject: `You're invited to interview for ${params.jobTitle} at ${company}`,
    html: `
      <p style="color: ${cream}; font-size: 26px; font-weight: 300; letter-spacing: -0.01em; margin: 0 0 6px; text-align: center;">
        You're invited
      </p>
      <p style="color: ${muted}; font-size: 14px; text-align: center; margin: 0 0 28px;">
        Interview invitation from HermesHire
      </p>

      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
        Hi <strong style="color: ${cream};">${params.candidateName}</strong>,
      </p>
      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
        You have been invited to interview for the role of
        <strong style="color: ${gold};">${params.jobTitle}</strong>
        at <strong style="color: ${gold};">${company}</strong>.
        The AI hiring team has reviewed your profile and would like to learn more about you.
      </p>

      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background: rgba(255,255,255,0.02); border: 1px solid ${line}; border-radius: 10px; margin: 24px 0;">
        <tr>
          <td style="padding: 20px 24px; border-bottom: 1px solid ${line};">
            <p style="color: ${muted}; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em;">Position</p>
            <p style="color: ${cream}; font-size: 15px; margin: 0;">${params.jobTitle}</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 24px; border-bottom: 1px solid ${line};">
            <p style="color: ${muted}; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em;">Company</p>
            <p style="color: ${cream}; font-size: 15px; margin: 0;">${company}</p>
          </td>
        </tr>
        ${params.companyDescription ? `
        <tr>
          <td style="padding: 20px 24px;">
            <p style="color: ${muted}; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.06em;">About</p>
            <p style="color: ${cream}; font-size: 14px; line-height: 1.6; margin: 0;">${params.companyDescription}</p>
          </td>
        </tr>
        ` : ""}
      </table>

      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 8px;">
        To proceed, please submit your resume and details using the link below.
      </p>

      ${ctaButton("Submit Your Application", params.onboardLink)}

      <p style="color: ${muted}; font-size: 13px; text-align: center; margin: 0;">
        This invitation was sent via the HermesHire CLI.
      </p>
    `,
  });
}

/**
 * Interview feedback notification for manager.
 */
export async function sendFeedbackNotificationEmail(params: {
  managerName: string;
  managerEmail: string;
  candidateName: string;
  jobTitle: string;
}) {
  return sendEmail({
    to: params.managerEmail,
    subject: `Interview feedback: ${params.candidateName} — ${params.jobTitle}`,
    html: `
      <p style="color: ${cream}; font-size: 26px; font-weight: 300; letter-spacing: -0.01em; margin: 0 0 6px; text-align: center;">
        Feedback Ready
      </p>
      <p style="color: ${muted}; font-size: 14px; text-align: center; margin: 0 0 28px;">
        Awaiting your review
      </p>

      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
        Hi <strong style="color: ${cream};">${params.managerName}</strong>,
      </p>
      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
        Interview feedback has been submitted for
        <strong style="color: ${gold};">${params.candidateName}</strong>
        for the role of <strong style="color: ${gold};">${params.jobTitle}</strong>.
      </p>

      ${cliBlock([
        `hermes auth --as carol`,
        `hermes review list`,
        `hermes review show ${params.candidateName}`,
        `hermes review hire ${params.candidateName}`,
      ])}
    `,
  });
}

/**
 * Hired notification for candidate.
 */
export async function sendHiredEmail(params: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
}) {
  return sendEmail({
    to: params.candidateEmail,
    subject: `You've been hired for ${params.jobTitle} 🎉`,
    html: `
      <p style="color: ${cream}; font-size: 32px; font-weight: 300; text-align: center; margin: 0 0 4px;">
        🎉
      </p>
      <p style="color: ${cream}; font-size: 26px; font-weight: 300; letter-spacing: -0.01em; margin: 0 0 6px; text-align: center;">
        Welcome to the team
      </p>
      <p style="color: ${muted}; font-size: 14px; text-align: center; margin: 0 0 28px;">
        You're hired
      </p>

      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
        Hi <strong style="color: ${cream};">${params.candidateName}</strong>,
      </p>
      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
        Congratulations! We are pleased to inform you that you have been selected for
        <strong style="color: ${gold};">${params.jobTitle}</strong>.
      </p>

      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background: ${goldSoft}; border: 1px solid rgba(212,168,83,0.2); border-radius: 10px; margin: 24px 0;">
        <tr>
          <td style="padding: 24px; text-align: center;">
            <p style="color: ${gold}; font-size: 28px; margin: 0 0 8px;">◈</p>
            <p style="color: ${cream}; font-size: 14px; margin: 0;">Decision made via HermesHire CLI</p>
          </td>
        </tr>
      </table>

      <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0;">
        Someone from the team will reach out shortly with next steps. We look forward to having you onboard.
      </p>
    `,
  });
}

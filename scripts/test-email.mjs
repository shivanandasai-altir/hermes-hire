import { Resend } from "resend";

const r = new Resend("re_6SENfZnm_NBL5oiSxC5wo4HqA723UH5eB");

const gold = "#d4a853";
const goldLight = "#e8c06a";
const goldSoft = "rgba(212,168,83,0.12)";
const goldGlow = "rgba(212,168,83,0.06)";
const bg = "#060a17";
const bgCard = "#0c1125";
const bgWell = "#0f1429";
const cream = "#ece8e1";
const muted = "#7d7c7a";
const line = "rgba(255,255,255,0.06)";

const html = `
<div style="background: ${bg}; padding: 48px 20px; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 560px; margin: 0 auto;">
    <tr>
      <td style="background: linear-gradient(145deg, ${bgCard}, ${bgWell}); border-radius: 16px; padding: 48px 44px; border: 1px solid ${line}; box-shadow: 0 8px 48px rgba(0,0,0,0.4);">

        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 36px;">
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, transparent, ${gold} 20%, ${goldLight} 50%, ${gold} 80%, transparent); border-radius: 2px; box-shadow: 0 0 20px ${goldGlow};"></td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 24px;">
          <tr><td style="text-align: center;">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="8" stroke="${gold}" stroke-width="1.5" fill="none"/>
              <path d="M10 10h4l4 6 4-6h4" stroke="${gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              <path d="M10 22V16l6 6V16" stroke="${gold}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.5"/>
            </svg>
          </td></tr>
        </table>

        <p style="color: ${cream}; font-size: 26px; font-weight: 300; text-align: center; margin: 0 0 6px;">You're invited</p>
        <p style="color: ${muted}; font-size: 14px; text-align: center; margin: 0 0 28px;">Interview invitation from HermesHire</p>

        <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">Hi <strong>Shivananda</strong>,</p>
        <p style="color: ${cream}; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
          You have been invited to interview for <strong style="color: ${gold};">Senior Frontend Engineer</strong>
          at <strong style="color: ${gold};">Altir</strong>.
        </p>

        <table cellpadding="0" cellspacing="0" border="0" style="width:100%; background:rgba(255,255,255,0.02); border:1px solid ${line}; border-radius:10px; margin:24px 0;">
          <tr>
            <td style="padding:20px 24px; border-bottom:1px solid ${line};">
              <p style="color:${muted}; font-size:12px; margin:0 0 4px; text-transform:uppercase; letter-spacing:0.06em;">Position</p>
              <p style="color:${cream}; font-size:15px; margin:0;">Senior Frontend Engineer</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px; border-bottom:1px solid ${line};">
              <p style="color:${muted}; font-size:12px; margin:0 0 4px; text-transform:uppercase; letter-spacing:0.06em;">Company</p>
              <p style="color:${cream}; font-size:15px; margin:0;">Altir</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <p style="color:${muted}; font-size:12px; margin:0 0 4px; text-transform:uppercase; letter-spacing:0.06em;">About</p>
              <p style="color:${cream}; font-size:14px; line-height:1.6; margin:0;">Altir is an AI-native hiring platform that helps teams collaborate across the complete recruitment workflow. We're building the future of hiring.</p>
            </td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 28px;">
          <tr>
            <td style="border-radius:10px; background:linear-gradient(135deg, ${gold}, ${goldLight}); box-shadow:0 4px 24px ${goldGlow}; text-align:center; padding:14px 40px;">
              <a href="https://hermes-hire.xyz/onboard/abc123" style="color:#000; text-decoration:none; font-size:15px; font-weight:600; display:block;">Submit Your Application</a>
            </td>
          </tr>
        </table>

        <p style="color:${muted}; font-size:13px; text-align:center; margin:0;">Sent via HermesHire CLI</p>

        <table cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:36px 0;">
          <tr><td style="height:1px; background:linear-gradient(90deg, transparent, ${goldSoft}, transparent);"></td></tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
          <tr><td style="text-align:center; padding-bottom:8px;"><span style="color:${gold}; font-size:16px; font-weight:400; letter-spacing:0.08em;">HERMESHIRE</span></td></tr>
          <tr><td style="text-align:center; padding-bottom:4px;"><span style="color:${muted}; font-size:12px;">AI Hiring Copilot</span></td></tr>
          <tr><td style="text-align:center;"><span style="color:${muted}; font-size:11px; opacity:0.6;">Powered by Hermes-4-70B</span></td></tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;

const { data, error } = await r.emails.send({
  from: "HermesHire <notifications@hermes-hire.xyz>",
  to: "shivanandasai.38@gmail.com",
  subject: "You're invited — Senior Frontend Engineer at Altir",
  html,
});

if (error) console.error("Error:", error);
else console.log("Sent:", data?.id);

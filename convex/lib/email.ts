import { render } from "@react-email/render";

/** Render an email template by workflow name. Returns subject, html, text. */
export async function assembleEmail(workflow: string, data: Record<string, any> = {}) {
  let EmailComponent;
  try {
    // Import the template dynamically so unused templates don't bloat the bundle.
    const mod = await import(`../../src/emails/${workflow}`);
    EmailComponent = mod.default || mod;
  } catch {
    // Template file doesn't exist.
    return null;
  }
  if (!EmailComponent || typeof EmailComponent !== "function") {
    return null;
  }

  const fullData: any = { ...data };

  const html = await render(EmailComponent({ data: fullData }), { pretty: true });
  const subject = (EmailComponent as any).Subject || `Concord Landscaping: ${workflow}`;
  const text = html.replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").trim();
  return { subject, html, text };
}

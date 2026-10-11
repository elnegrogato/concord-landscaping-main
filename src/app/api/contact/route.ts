import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend conditionally if key exists
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  projectDetails: string;
  service?: string;
  // Communication consent (required before outbound follow-up).
  consentGiven: boolean;
  consentSourcePage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.projectDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, email, projectDetails' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Consent is required before we can send any follow-up communication.
    if (!body.consentGiven) {
      return NextResponse.json(
        { error: 'You must consent to be contacted before we can process your request.' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Log the lead locally (includes consent record for compliance).
    console.log('📩 New lead received:', {
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      phone: body.phone || 'N/A',
      service: body.service || 'General',
      details: body.projectDetails,
      consentGiven: body.consentGiven,
      consentSourcePage: body.consentSourcePage || 'home',
      timestamp,
    });

    // Operationalize lead management with Resend if API key is present
    if (resend) {
      const { error } = await resend.emails.send({
        from: 'Concord Landscaping Website <leads@concordlandscaping.com>', // MUST BE A VERIFIED DOMAIN in Resend
        to: ['info@concordlandscaping.com'], // The business owner's email
        subject: `New Lead: ${body.service || 'General Inquiry'} from ${body.firstName} ${body.lastName}`,
        html: `
          <h2>New Website Inquiry</h2>
          <p><strong>Name:</strong> ${body.firstName} ${body.lastName}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>Phone:</strong> ${body.phone || 'Not provided'}</p>
          <p><strong>Service of Interest:</strong> ${body.service || 'Not specified'}</p>
          <br />
          <h3>Project Details:</h3>
          <p>${body.projectDetails.replace(/\n/g, '<br />')}</p>
          <br />
          <p style="font-size: 12px; color: #666;"><strong>Consent:</strong> The lead consented to be contacted via email/phone on submission. Source page: ${
            body.consentSourcePage || 'home'
          }. See our <a href="https://concordlandscaping.com/privacy">Privacy Policy</a>.</p>
        `,
      });

      if (error) {
        console.error('Resend error sending email:', error);
        // We still return success to the user so we don't leak server errors,
        // but log the error internally.
      } else {
        console.log('✅ Email notification sent via Resend.');
      }
    } else {
      console.warn('⚠️ No RESEND_API_KEY found in environment. Email notification bypassed.');
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We\'ve received your request and will be in touch within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

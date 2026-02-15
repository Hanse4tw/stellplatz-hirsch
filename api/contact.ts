import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { anreise, abreise, name, email, telefon, personen, hund, nachricht } = req.body;

    const htmlContent = `
      <h2>Neue Reservierungsanfrage</h2>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Name</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>E-Mail</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Telefon</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${telefon || 'Nicht angegeben'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Anreise</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${anreise}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Abreise</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${abreise}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Personen</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${personen}</td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Hund dabei?</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${hund}</td>
        </tr>
        ${nachricht ? `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;"><strong>Nachricht</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${nachricht}</td>
        </tr>
        ` : ''}
      </table>
      <p style="margin-top: 20px; color: #666;">
        Diese Anfrage wurde über das Kontaktformular auf stellplatz-hirsch.de gesendet.
      </p>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Stellplatz Hirsch <onboarding@resend.dev>',
      to: ['juc.jetzinger@t-online.de'],
      replyTo: email,
      subject: `Reservierungsanfrage von ${name} (${anreise} - ${abreise})`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Serverfehler' });
  }
}

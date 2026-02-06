import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactEmailData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: string;
  message: string;
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  translation: '翻訳について',
  webDesign: 'ホームページ制作について',
  print: '印刷物制作について',
  combo: '事業内容の組み合わせについて',
  other: 'その他',
};

/**
 * 管理者向け通知メールを送信
 */
export async function sendAdminNotificationEmail(data: ContactEmailData): Promise<void> {
  const inquiryTypeLabel = INQUIRY_TYPE_LABELS[data.inquiryType] || data.inquiryType;
  
  const subject = `【お問い合わせ】${inquiryTypeLabel} - ${data.name}様より`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
        新しいお問い合わせ
      </h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">お問い合わせ内容</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 120px;">お名前</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">メールアドレス</td>
            <td style="padding: 8px 0; color: #1e293b;">
              <a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a>
            </td>
          </tr>
          ${data.company ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">会社名</td>
            <td style="padding: 8px 0; color: #1e293b;">${data.company}</td>
          </tr>
          ` : ''}
          ${data.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">電話番号</td>
            <td style="padding: 8px 0; color: #1e293b;">
              <a href="tel:${data.phone}" style="color: #2563eb; text-decoration: none;">${data.phone}</a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: #64748b;">お問い合わせ種別</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${inquiryTypeLabel}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">メッセージ</h3>
        <p style="color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
        <p>このメールはNectereのお問い合わせフォームから自動送信されました。</p>
      </div>
    </div>
  `;
  
  const text = `
新しいお問い合わせ

お名前: ${data.name}
メールアドレス: ${data.email}
${data.company ? `会社名: ${data.company}\n` : ''}${data.phone ? `電話番号: ${data.phone}\n` : ''}お問い合わせ種別: ${inquiryTypeLabel}

メッセージ:
${data.message}

---
このメールはNectereのお問い合わせフォームから自動送信されました。
  `.trim();
  
  const contactEmail = process.env.CONTACT_EMAIL || 'contact@nectere.jp';
  const fromName = process.env.CONTACT_FROM_NAME || 'Nectere';
  
  await resend.emails.send({
    from: `${fromName} <onboarding@resend.dev>`,
    to: contactEmail,
    subject,
    html,
    text,
  });
}

/**
 * ユーザー向け自動返信メールを送信
 */
export async function sendAutoReplyEmail(data: ContactEmailData): Promise<void> {
  const inquiryTypeLabel = INQUIRY_TYPE_LABELS[data.inquiryType] || data.inquiryType;
  
  const subject = 'お問い合わせを受け付けました - Nectere';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
        お問い合わせありがとうございます
      </h2>
      
      <div style="margin: 30px 0;">
        <p style="color: #1e293b; line-height: 1.8;">
          ${data.name}様
        </p>
        <p style="color: #1e293b; line-height: 1.8;">
          この度は、Nectereにお問い合わせいただき、誠にありがとうございます。<br>
          以下の内容でお問い合わせを受け付けました。
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">お問い合わせ内容</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; width: 140px;">お問い合わせ種別</td>
            <td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${inquiryTypeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">メッセージ</td>
            <td style="padding: 8px 0; color: #1e293b; white-space: pre-wrap;">${data.message}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
        <p style="color: #1e293b; margin: 0; font-weight: 600;">
          ✓ 担当者より24時間以内にご返信いたします
        </p>
      </div>
      
      <div style="margin: 30px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="color: #1e293b; margin-top: 0;">営業時間のご案内</h3>
        <p style="color: #64748b; margin: 5px 0;">平日 9:00 - 18:00</p>
        <p style="color: #64748b; margin: 5px 0; font-size: 14px;">
          ※土日祝日にいただいたお問い合わせは、翌営業日以降の対応となります。
        </p>
      </div>
      
      <div style="margin: 30px 0;">
        <p style="color: #1e293b; line-height: 1.8;">
          ご不明な点がございましたら、お気軽にお問い合わせください。<br>
          今後とも、Nectereをよろしくお願いいたします。
        </p>
      </div>
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #1e293b; font-weight: 600; margin: 5px 0;">Nectere</p>
        <p style="color: #64748b; margin: 5px 0; font-size: 14px;">
          Email: contact@nectere.jp<br>
          Tel: 03(6820)9037
        </p>
      </div>
      
      <div style="margin-top: 20px; color: #64748b; font-size: 12px;">
        <p>このメールは自動送信されています。このメールに返信いただいても対応できませんので、ご了承ください。</p>
      </div>
    </div>
  `;
  
  const text = `
お問い合わせありがとうございます

${data.name}様

この度は、Nectereにお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

お問い合わせ種別: ${inquiryTypeLabel}

メッセージ:
${data.message}

✓ 担当者より24時間以内にご返信いたします

【営業時間のご案内】
平日 9:00 - 18:00
※土日祝日にいただいたお問い合わせは、翌営業日以降の対応となります。

ご不明な点がございましたら、お気軽にお問い合わせください。
今後とも、Nectereをよろしくお願いいたします。

---
Nectere
Email: contact@nectere.jp
Tel: 03(6820)9037

このメールは自動送信されています。このメールに返信いただいても対応できませんので、ご了承ください。
  `.trim();
  
  const fromName = process.env.CONTACT_FROM_NAME || 'Nectere';
  
  await resend.emails.send({
    from: `${fromName} <onboarding@resend.dev>`,
    to: data.email,
    subject,
    html,
    text,
  });
}

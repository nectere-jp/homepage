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
  nobilva: 'Nobilva（学習支援）について',
  teachit: 'Teach It（教育アプリ）について',
  interview: '取材のご依頼',
  other: 'その他',
};

// Nectere ブランドカラー（トップページと統一）
const STYLE = {
  fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif",
  blue: '#316F94',      // 見出し・リンク
  pink: '#FA6B82',     // アクセント
  pinkLight: '#fff5f6',
  text: '#374151',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  radius: '12px',
} as const;

/**
 * 管理者向け通知メールを送信
 */
export async function sendAdminNotificationEmail(data: ContactEmailData): Promise<void> {
  const inquiryTypeLabel = INQUIRY_TYPE_LABELS[data.inquiryType] || data.inquiryType;
  
  const subject = `【お問い合わせ】${inquiryTypeLabel} - ${data.name}様より`;
  
  const html = `
    <div style="font-family: ${STYLE.fontFamily}; max-width: 600px; margin: 0 auto; padding: 24px; color: ${STYLE.text};">
      <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid ${STYLE.blue};">
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${STYLE.blue};">Nectere</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: ${STYLE.textMuted};">Bringing humanity back to technology.</p>
      </div>

      <h2 style="color: ${STYLE.blue}; font-size: 18px; font-weight: 700; margin: 0 0 20px; padding-left: 12px; border-left: 4px solid ${STYLE.pink};">
        新しいお問い合わせ
      </h2>
      
      <div style="background-color: ${STYLE.pinkLight}; padding: 20px; border-radius: ${STYLE.radius}; margin: 20px 0; border: 1px solid ${STYLE.border};">
        <h3 style="color: ${STYLE.blue}; font-size: 14px; font-weight: 700; margin: 0 0 12px;">お問い合わせ内容</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted}; width: 120px; font-size: 14px;">お名前</td>
            <td style="padding: 8px 0; color: ${STYLE.text}; font-weight: 600;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted};">メールアドレス</td>
            <td style="padding: 8px 0; color: ${STYLE.text};">
              <a href="mailto:${data.email}" style="color: ${STYLE.blue}; text-decoration: none;">${data.email}</a>
            </td>
          </tr>
          ${data.company ? `
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted};">会社名</td>
            <td style="padding: 8px 0; color: ${STYLE.text};">${data.company}</td>
          </tr>
          ` : ''}
          ${data.phone ? `
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted};">電話番号</td>
            <td style="padding: 8px 0; color: ${STYLE.text};">
              <a href="tel:${data.phone}" style="color: ${STYLE.blue}; text-decoration: none;">${data.phone}</a>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted};">お問い合わせ種別</td>
            <td style="padding: 8px 0; color: ${STYLE.text}; font-weight: 600;">${inquiryTypeLabel}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #ffffff; border: 1px solid ${STYLE.border}; padding: 20px; border-radius: ${STYLE.radius}; margin: 20px 0;">
        <h3 style="color: ${STYLE.blue}; font-size: 14px; font-weight: 700; margin: 0 0 12px;">メッセージ</h3>
        <p style="color: ${STYLE.text}; line-height: 1.6; white-space: pre-wrap; margin: 0;">${data.message}</p>
      </div>
      
      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid ${STYLE.border}; color: ${STYLE.textMuted}; font-size: 12px;">
        <p style="margin: 0;">このメールはNectereのお問い合わせフォームから自動送信されました。</p>
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
  
  const contactEmailRaw = process.env.CONTACT_EMAIL || 'contact@nectere.jp';
  const contactEmails = contactEmailRaw.split(',').map((e) => e.trim()).filter(Boolean);
  if (contactEmails.length === 0) {
    throw new Error('CONTACT_EMAIL is not configured. Set at least one recipient.');
  }
  const fromName = process.env.CONTACT_FROM_NAME || 'Nectere';
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: contactEmails,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('[sendAdminNotificationEmail] Resend error:', error);
    throw new Error(`Failed to send admin notification: ${error.message}`);
  }
}

/**
 * ユーザー向け自動返信メールを送信
 */
export async function sendAutoReplyEmail(data: ContactEmailData): Promise<void> {
  const inquiryTypeLabel = INQUIRY_TYPE_LABELS[data.inquiryType] || data.inquiryType;
  
  const subject = 'お問い合わせを受け付けました - Nectere';
  
  const html = `
    <div style="font-family: ${STYLE.fontFamily}; max-width: 600px; margin: 0 auto; padding: 24px; color: ${STYLE.text};">
      <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid ${STYLE.blue};">
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${STYLE.blue};">Nectere</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: ${STYLE.textMuted};">Bringing humanity back to technology.</p>
      </div>

      <h2 style="color: ${STYLE.blue}; font-size: 18px; font-weight: 700; margin: 0 0 20px; padding-left: 12px; border-left: 4px solid ${STYLE.pink};">
        お問い合わせありがとうございます
      </h2>
      
      <div style="margin: 24px 0;">
        <p style="color: ${STYLE.text}; line-height: 1.8; margin: 0 0 8px;">
          ${data.name}様
        </p>
        <p style="color: ${STYLE.text}; line-height: 1.8; margin: 0;">
          この度は、Nectereにお問い合わせいただき、誠にありがとうございます。<br>
          以下の内容でお問い合わせを受け付けました。
        </p>
      </div>
      
      <div style="background-color: ${STYLE.pinkLight}; padding: 20px; border-radius: ${STYLE.radius}; margin: 20px 0; border: 1px solid ${STYLE.border};">
        <h3 style="color: ${STYLE.blue}; font-size: 14px; font-weight: 700; margin: 0 0 12px;">お問い合わせ内容</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted}; width: 140px; font-size: 14px;">お問い合わせ種別</td>
            <td style="padding: 8px 0; color: ${STYLE.text}; font-weight: 600;">${inquiryTypeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${STYLE.textMuted}; vertical-align: top;">メッセージ</td>
            <td style="padding: 8px 0; color: ${STYLE.text}; white-space: pre-wrap;">${data.message}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: ${STYLE.pinkLight}; border-left: 4px solid ${STYLE.pink}; padding: 16px; margin: 20px 0; border-radius: 0 ${STYLE.radius} ${STYLE.radius} 0;">
        <p style="color: ${STYLE.text}; margin: 0; font-weight: 600;">
          ✓ 担当者より24時間以内にご返信いたします
        </p>
      </div>
      
      <div style="margin: 24px 0; padding: 20px; border: 1px solid ${STYLE.border}; border-radius: ${STYLE.radius};">
        <h3 style="color: ${STYLE.blue}; font-size: 14px; font-weight: 700; margin: 0 0 8px;">営業時間のご案内</h3>
        <p style="color: ${STYLE.textMuted}; margin: 4px 0; font-size: 14px;">平日 9:00 - 18:00</p>
        <p style="color: ${STYLE.textMuted}; margin: 4px 0; font-size: 13px;">
          ※土日祝日にいただいたお問い合わせは、翌営業日以降の対応となります。
        </p>
      </div>
      
      <div style="margin: 24px 0;">
        <p style="color: ${STYLE.text}; line-height: 1.8; margin: 0;">
          ご不明な点がございましたら、お気軽にお問い合わせください。<br>
          今後とも、Nectereをよろしくお願いいたします。
        </p>
      </div>
      
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid ${STYLE.border};">
        <p style="color: ${STYLE.blue}; font-weight: 700; margin: 0 0 8px;">Nectere</p>
        <p style="color: ${STYLE.textMuted}; margin: 0; font-size: 14px;">
          Email: contact@nectere.jp<br>
          Tel: 03(6820)9037
        </p>
      </div>
      
      <div style="margin-top: 20px; color: ${STYLE.textMuted}; font-size: 12px;">
        <p style="margin: 0;">このメールは自動送信されています。このメールに返信いただいても対応できませんので、ご了承ください。</p>
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
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: data.email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('[sendAutoReplyEmail] Resend error:', error);
    throw new Error(`Failed to send auto-reply: ${error.message}`);
  }
}

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

// ─── Nobilva 無料学習相談 ───────────────────────────────────

const NOBILVA_STYLE = {
  fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif",
  accent: '#e8734a',
  accentLight: '#fef7f4',
  text: '#374151',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  radius: '12px',
} as const;

export interface DiagnosisEmailData {
  name: string;
  email: string;
  phone?: string;
  grade: string;
  club: string;
  concerns: string[];
  concernOther?: string;
  careerDirection?: string;
  source?: string;
  scheduleSlots: string[];
  scheduleCustom?: string;
  noSlotAvailable?: boolean;
}

function formatSchedule(data: DiagnosisEmailData): string {
  if (data.noSlotAvailable) return `候補なし — ${data.scheduleCustom || ''}`;
  return data.scheduleSlots.join(' / ') || '未選択';
}

function formatConcerns(data: DiagnosisEmailData): string {
  return [...data.concerns, data.concernOther].filter(Boolean).join('、') || '未入力';
}

/**
 * 管理者向け：学習相談申し込み通知
 */
export async function sendDiagnosisAdminEmail(data: DiagnosisEmailData): Promise<void> {
  const subject = `【Nobilva 学習相談】${data.name}様より申し込み`;
  const schedule = formatSchedule(data);
  const concerns = formatConcerns(data);

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted}; width: 140px; font-size: 14px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text}; font-weight: 500;">${value}</td>
    </tr>`;

  const html = `
    <div style="font-family: ${NOBILVA_STYLE.fontFamily}; max-width: 600px; margin: 0 auto; padding: 24px; color: ${NOBILVA_STYLE.text};">
      <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid ${NOBILVA_STYLE.accent};">
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${NOBILVA_STYLE.accent};">Nobilva</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: ${NOBILVA_STYLE.textMuted};">無料学習相談 申し込み通知</p>
      </div>

      <h2 style="color: ${NOBILVA_STYLE.accent}; font-size: 18px; font-weight: 700; margin: 0 0 20px; padding-left: 12px; border-left: 4px solid ${NOBILVA_STYLE.accent};">
        新しい学習相談の申し込み
      </h2>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; padding: 20px; border-radius: ${NOBILVA_STYLE.radius}; margin: 20px 0; border: 1px solid ${NOBILVA_STYLE.border};">
        <h3 style="color: ${NOBILVA_STYLE.accent}; font-size: 14px; font-weight: 700; margin: 0 0 12px;">基本情報</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${row('お名前', data.name)}
          ${row('メール', `<a href="mailto:${data.email}" style="color: ${NOBILVA_STYLE.accent}; text-decoration: none;">${data.email}</a>`)}
          ${data.phone ? row('電話番号', `<a href="tel:${data.phone}" style="color: ${NOBILVA_STYLE.accent}; text-decoration: none;">${data.phone}</a>`) : ''}
          ${row('学年', data.grade)}
          ${row('野球の所属', data.club)}
        </table>
      </div>

      <div style="background-color: #ffffff; border: 1px solid ${NOBILVA_STYLE.border}; padding: 20px; border-radius: ${NOBILVA_STYLE.radius}; margin: 20px 0;">
        <h3 style="color: ${NOBILVA_STYLE.accent}; font-size: 14px; font-weight: 700; margin: 0 0 12px;">ヒアリング情報</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${row('お悩み・ご状況', concerns)}
          ${row('志望進路', data.careerDirection || '未入力')}
          ${row('きっかけ', data.source || '未入力')}
        </table>
      </div>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; border-left: 4px solid ${NOBILVA_STYLE.accent}; padding: 16px; margin: 20px 0; border-radius: 0 ${NOBILVA_STYLE.radius} ${NOBILVA_STYLE.radius} 0;">
        <p style="color: ${NOBILVA_STYLE.text}; margin: 0; font-weight: 700;">希望日時</p>
        <p style="color: ${NOBILVA_STYLE.text}; margin: 6px 0 0;">${schedule}</p>
      </div>

      <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid ${NOBILVA_STYLE.border}; color: ${NOBILVA_STYLE.textMuted}; font-size: 12px;">
        <p style="margin: 0;">このメールはNobilva学習相談フォームから自動送信されました。</p>
      </div>
    </div>
  `;

  const text = `
Nobilva 無料学習相談 — 新規申し込み

お名前: ${data.name}
メール: ${data.email}
${data.phone ? `電話番号: ${data.phone}\n` : ''}学年: ${data.grade}
野球の所属: ${data.club}
お悩み: ${concerns}
志望進路: ${data.careerDirection || '未入力'}
きっかけ: ${data.source || '未入力'}
希望日時: ${schedule}

---
このメールはNobilva学習相談フォームから自動送信されました。
  `.trim();

  const contactEmailRaw = process.env.CONTACT_EMAIL || 'contact@nectere.jp';
  const contactEmails = contactEmailRaw.split(',').map((e) => e.trim()).filter(Boolean);
  if (contactEmails.length === 0) {
    throw new Error('CONTACT_EMAIL is not configured.');
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
    console.error('[sendDiagnosisAdminEmail] Resend error:', error);
    throw new Error(`Failed to send diagnosis admin notification: ${error.message}`);
  }
}

/**
 * ユーザー向け：学習相談申し込み確認メール
 */
export async function sendDiagnosisAutoReplyEmail(data: DiagnosisEmailData): Promise<void> {
  const subject = '【Nobilva】無料学習相談のお申し込みを受け付けました';
  const schedule = formatSchedule(data);

  const html = `
    <div style="font-family: ${NOBILVA_STYLE.fontFamily}; max-width: 600px; margin: 0 auto; padding: 24px; color: ${NOBILVA_STYLE.text};">
      <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid ${NOBILVA_STYLE.accent};">
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${NOBILVA_STYLE.accent};">Nobilva</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: ${NOBILVA_STYLE.textMuted};">部活と勉強の両立を支える学習管理</p>
      </div>

      <h2 style="color: ${NOBILVA_STYLE.accent}; font-size: 18px; font-weight: 700; margin: 0 0 20px; padding-left: 12px; border-left: 4px solid ${NOBILVA_STYLE.accent};">
        無料学習相談のお申し込みありがとうございます
      </h2>

      <div style="margin: 24px 0;">
        <p style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 0 0 8px;">
          ${data.name}様
        </p>
        <p style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 0;">
          この度は、Nobilva無料学習相談にお申し込みいただき、誠にありがとうございます。<br>
          以下の内容でお申し込みを受け付けました。
        </p>
      </div>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; padding: 20px; border-radius: ${NOBILVA_STYLE.radius}; margin: 20px 0; border: 1px solid ${NOBILVA_STYLE.border};">
        <h3 style="color: ${NOBILVA_STYLE.accent}; font-size: 14px; font-weight: 700; margin: 0 0 12px;">お申し込み内容</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted}; width: 140px; font-size: 14px;">お名前</td>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text}; font-weight: 600;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted};">学年</td>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text};">${data.grade}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted};">希望日時</td>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text};">${schedule}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; border-left: 4px solid ${NOBILVA_STYLE.accent}; padding: 16px; margin: 20px 0; border-radius: 0 ${NOBILVA_STYLE.radius} ${NOBILVA_STYLE.radius} 0;">
        <p style="color: ${NOBILVA_STYLE.text}; margin: 0; font-weight: 600;">
          担当メンターより、24時間以内に日程確定のご連絡をいたします。
        </p>
      </div>

      <div style="margin: 24px 0; padding: 20px; border: 1px solid ${NOBILVA_STYLE.border}; border-radius: ${NOBILVA_STYLE.radius};">
        <h3 style="color: ${NOBILVA_STYLE.accent}; font-size: 14px; font-weight: 700; margin: 0 0 8px;">学習相談について</h3>
        <ul style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 8px 0; padding-left: 20px;">
          <li>オンラインで30分程度の面談です</li>
          <li>お子さんの現状を伺い、具体的な学習プランをご提案します</li>
          <li>無理な勧誘は一切いたしません</li>
        </ul>
      </div>

      <div style="margin: 24px 0;">
        <p style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 0;">
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid ${NOBILVA_STYLE.border};">
        <p style="color: ${NOBILVA_STYLE.accent}; font-weight: 700; margin: 0 0 8px;">Nobilva（Nectere）</p>
        <p style="color: ${NOBILVA_STYLE.textMuted}; margin: 0; font-size: 14px;">
          Email: contact@nectere.jp
        </p>
      </div>

      <div style="margin-top: 20px; color: ${NOBILVA_STYLE.textMuted}; font-size: 12px;">
        <p style="margin: 0;">このメールは自動送信されています。このメールに返信いただいても対応できませんので、ご了承ください。</p>
      </div>
    </div>
  `;

  const text = `
無料学習相談のお申し込みありがとうございます

${data.name}様

この度は、Nobilva無料学習相談にお申し込みいただき、誠にありがとうございます。
以下の内容でお申し込みを受け付けました。

お名前: ${data.name}
学年: ${data.grade}
希望日時: ${schedule}

担当メンターより、24時間以内に日程確定のご連絡をいたします。

【学習相談について】
- オンラインで30分程度の面談です
- お子さんの現状を伺い、具体的な学習プランをご提案します
- 無理な勧誘は一切いたしません

ご不明な点がございましたら、お気軽にお問い合わせください。

---
Nobilva（Nectere）
Email: contact@nectere.jp

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
    console.error('[sendDiagnosisAutoReplyEmail] Resend error:', error);
    throw new Error(`Failed to send diagnosis auto-reply: ${error.message}`);
  }
}

// ─── 面談日時確定メール ───────────────────────────────────

export interface ScheduleConfirmEmailData {
  userName: string;
  userEmail: string;
  staffName: string;
  date: string;       // "6/05（木）"
  time: string;       // "18:00-18:30"
}

export async function sendScheduleConfirmEmail(data: ScheduleConfirmEmailData): Promise<void> {
  const subject = '【Nobilva】面談日時が確定しました';

  const html = `
    <div style="font-family: ${NOBILVA_STYLE.fontFamily}; max-width: 600px; margin: 0 auto; padding: 24px; color: ${NOBILVA_STYLE.text};">
      <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid ${NOBILVA_STYLE.accent};">
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${NOBILVA_STYLE.accent};">Nobilva</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: ${NOBILVA_STYLE.textMuted};">部活と勉強の両立を支える学習管理</p>
      </div>

      <h2 style="color: ${NOBILVA_STYLE.accent}; font-size: 18px; font-weight: 700; margin: 0 0 20px; padding-left: 12px; border-left: 4px solid ${NOBILVA_STYLE.accent};">
        面談日時が確定しました
      </h2>

      <p style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 0 0 16px;">
        ${data.userName}様<br>
        無料学習相談の日時が確定しましたのでお知らせいたします。
      </p>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; padding: 20px; border-radius: ${NOBILVA_STYLE.radius}; margin: 20px 0; border: 1px solid ${NOBILVA_STYLE.border};">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted}; width: 100px; font-size: 14px;">日時</td>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text}; font-weight: 700; font-size: 16px;">${data.date} ${data.time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted}; font-size: 14px;">担当</td>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text}; font-weight: 600;">${data.staffName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.textMuted}; font-size: 14px;">形式</td>
            <td style="padding: 8px 0; color: ${NOBILVA_STYLE.text};">オンライン・30分</td>
          </tr>
        </table>
      </div>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; border-left: 4px solid ${NOBILVA_STYLE.accent}; padding: 16px; margin: 20px 0; border-radius: 0 ${NOBILVA_STYLE.radius} ${NOBILVA_STYLE.radius} 0;">
        <p style="color: ${NOBILVA_STYLE.text}; margin: 0; font-weight: 600;">
          面談リンクは前日までに別途メールでお送りします。
        </p>
      </div>

      <div style="margin: 24px 0; padding: 20px; border: 1px solid ${NOBILVA_STYLE.border}; border-radius: ${NOBILVA_STYLE.radius};">
        <h3 style="color: ${NOBILVA_STYLE.accent}; font-size: 14px; font-weight: 700; margin: 0 0 8px;">当日について</h3>
        <ul style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 8px 0; padding-left: 20px;">
          <li>事前準備は不要です</li>
          <li>保護者の方・生徒ご本人、どちらでもご参加いただけます</li>
          <li>日程変更をご希望の場合は、このメールにご返信ください</li>
        </ul>
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid ${NOBILVA_STYLE.border};">
        <p style="color: ${NOBILVA_STYLE.accent}; font-weight: 700; margin: 0 0 8px;">Nobilva（Nectere）</p>
        <p style="color: ${NOBILVA_STYLE.textMuted}; margin: 0; font-size: 14px;">Email: contact@nectere.jp</p>
      </div>
    </div>
  `;

  const text = `
面談日時が確定しました

${data.userName}様

無料学習相談の日時が確定しましたのでお知らせいたします。

日時: ${data.date} ${data.time}
担当: ${data.staffName}
形式: オンライン・30分

面談リンクは前日までに別途メールでお送りします。

【当日について】
- 事前準備は不要です
- 保護者の方・生徒ご本人、どちらでもご参加いただけます
- 日程変更をご希望の場合は、このメールにご返信ください

---
Nobilva（Nectere）
Email: contact@nectere.jp
  `.trim();

  const fromName = process.env.CONTACT_FROM_NAME || 'Nectere';
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: data.userEmail,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('[sendScheduleConfirmEmail] Resend error:', error);
    throw new Error(`Failed to send schedule confirm email: ${error.message}`);
  }
}

// ─── 日程再調整メール ───────────────────────────────────

export interface ScheduleRescheduleEmailData {
  userName: string;
  userEmail: string;
  message: string;
}

export async function sendScheduleRescheduleEmail(data: ScheduleRescheduleEmailData): Promise<void> {
  const subject = '【Nobilva】面談日時の再調整のお願い';

  const html = `
    <div style="font-family: ${NOBILVA_STYLE.fontFamily}; max-width: 600px; margin: 0 auto; padding: 24px; color: ${NOBILVA_STYLE.text};">
      <div style="margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid ${NOBILVA_STYLE.accent};">
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${NOBILVA_STYLE.accent};">Nobilva</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: ${NOBILVA_STYLE.textMuted};">部活と勉強の両立を支える学習管理</p>
      </div>

      <h2 style="color: ${NOBILVA_STYLE.accent}; font-size: 18px; font-weight: 700; margin: 0 0 20px; padding-left: 12px; border-left: 4px solid ${NOBILVA_STYLE.accent};">
        面談日時の再調整のお願い
      </h2>

      <p style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 0 0 16px;">
        ${data.userName}様<br>
        この度は無料学習相談にお申し込みいただきありがとうございます。
      </p>

      <div style="background-color: ${NOBILVA_STYLE.accentLight}; padding: 20px; border-radius: ${NOBILVA_STYLE.radius}; margin: 20px 0; border: 1px solid ${NOBILVA_STYLE.border}; white-space: pre-wrap; line-height: 1.8;">
        ${data.message}
      </div>

      <p style="color: ${NOBILVA_STYLE.text}; line-height: 1.8; margin: 16px 0;">
        お手数ですが、このメールにご返信いただくか、再度<a href="https://nectere.jp/ja/services/nobilva/diagnosis" style="color: ${NOBILVA_STYLE.accent};">お申し込みフォーム</a>からご都合の良い日時をお知らせください。
      </p>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid ${NOBILVA_STYLE.border};">
        <p style="color: ${NOBILVA_STYLE.accent}; font-weight: 700; margin: 0 0 8px;">Nobilva（Nectere）</p>
        <p style="color: ${NOBILVA_STYLE.textMuted}; margin: 0; font-size: 14px;">Email: contact@nectere.jp</p>
      </div>
    </div>
  `;

  const text = `
面談日時の再調整のお願い

${data.userName}様

この度は無料学習相談にお申し込みいただきありがとうございます。

${data.message}

お手数ですが、このメールにご返信いただくか、再度お申し込みフォーム（https://nectere.jp/ja/services/nobilva/diagnosis）からご都合の良い日時をお知らせください。

---
Nobilva（Nectere）
Email: contact@nectere.jp
  `.trim();

  const fromName = process.env.CONTACT_FROM_NAME || 'Nectere';
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';

  const { error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: data.userEmail,
    replyTo: process.env.CONTACT_EMAIL || 'contact@nectere.jp',
    subject,
    html,
    text,
  });

  if (error) {
    console.error('[sendScheduleRescheduleEmail] Resend error:', error);
    throw new Error(`Failed to send reschedule email: ${error.message}`);
  }
}

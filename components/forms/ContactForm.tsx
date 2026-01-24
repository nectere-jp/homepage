'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { CTAButton } from '../ui/CTAButton';

const createContactSchema = (locale: string) => z.object({
  name: z.string().min(1, locale === 'ja' ? '名前は必須です' : 'Name is required'),
  email: z.string().email(locale === 'ja' ? '有効なメールアドレスを入力してください' : 'Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  inquiryType: z.string().min(1, locale === 'ja' ? 'お問い合わせ種別を選択してください' : 'Please select an inquiry type'),
  message: z.string().min(10, locale === 'ja' ? 'お問い合わせ内容は10文字以上で入力してください' : 'Message must be at least 10 characters'),
  privacy: z.boolean().refine((val) => val === true, locale === 'ja' ? '個人情報の取り扱いに同意してください' : 'Please agree to the privacy policy'),
});

export function ContactForm() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const contactSchema = createContactSchema(locale);
  type ContactFormData = z.infer<typeof contactSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus('success');
        reset();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.name')} <span className="text-pink">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.email')} <span className="text-pink">*</span>
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.company')} <span className="text-gray-400">({t('form.optional')})</span>
        </label>
        <input
          type="text"
          id="company"
          {...register('company')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.phone')} <span className="text-gray-400">({t('form.optional')})</span>
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.inquiryType')} <span className="text-pink">*</span>
        </label>
        <select
          id="inquiryType"
          {...register('inquiryType')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
        >
          <option value="">{locale === 'ja' ? '選択してください' : 'Please select'}</option>
          <option value="translation">{t('inquiryTypes.translation')}</option>
          <option value="webDesign">{t('inquiryTypes.webDesign')}</option>
          <option value="print">{t('inquiryTypes.print')}</option>
          <option value="combo">{t('inquiryTypes.combo')}</option>
          <option value="other">{t('inquiryTypes.other')}</option>
        </select>
        {errors.inquiryType && (
          <p className="mt-1 text-sm text-red-600">{errors.inquiryType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          {t('form.message')} <span className="text-pink">*</span>
        </label>
        <textarea
          id="message"
          rows={6}
          {...register('message')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            {...register('privacy')}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            {t('form.privacy')} <span className="text-pink">*</span>
          </span>
        </label>
        {errors.privacy && (
          <p className="mt-1 text-sm text-red-600">{errors.privacy.message}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {t('success')}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {t('error')}
        </div>
      )}

      <div className="pt-4">
        <CTAButton type="submit" className="text-lg" disabled={isSubmitting}>
          {isSubmitting ? (locale === 'ja' ? '送信中...' : 'Sending...') : t('form.submit')}
        </CTAButton>
      </div>
    </form>
  );
}

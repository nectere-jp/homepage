'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { CTAButton } from '../ui/CTAButton';
import { 
  HiOutlineTranslate, 
  HiOutlineDesktopComputer, 
  HiOutlinePrinter, 
  HiOutlineSparkles, 
  HiOutlineChatAlt2,
  HiCheck
} from 'react-icons/hi';

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
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: '',
    }
  });

  const selectedInquiryType = watch('inquiryType');

  const inquiryTypes = [
    { id: 'translation', label: t('inquiryTypes.translation'), icon: HiOutlineTranslate },
    { id: 'webDesign', label: t('inquiryTypes.webDesign'), icon: HiOutlineDesktopComputer },
    { id: 'print', label: t('inquiryTypes.print'), icon: HiOutlinePrinter },
    { id: 'combo', label: t('inquiryTypes.combo'), icon: HiOutlineSparkles },
    { id: 'other', label: t('inquiryTypes.other'), icon: HiOutlineChatAlt2 },
  ];

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

  const RequiredBadge = () => (
    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-pink text-white uppercase tracking-wider">
      {t('form.required')}
    </span>
  );

  const OptionalBadge = () => (
    <span className="ml-2 px-2 py-0.5 text-[10px] font-bold rounded bg-gray-400 text-white uppercase tracking-wider">
      {t('form.optional')}
    </span>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label htmlFor="name" className="flex items-center text-sm font-bold text-blue mb-2">
          {t('form.name')} <RequiredBadge />
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink/20 focus:border-pink transition-all bg-white"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="flex items-center text-sm font-bold text-blue mb-2">
          {t('form.email')} <RequiredBadge />
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink/20 focus:border-pink transition-all bg-white"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="company" className="flex items-center text-sm font-bold text-blue mb-2">
          {t('form.company')} <OptionalBadge />
        </label>
        <input
          type="text"
          id="company"
          {...register('company')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink/20 focus:border-pink transition-all bg-white"
        />
      </div>

      <div>
        <label htmlFor="phone" className="flex items-center text-sm font-bold text-blue mb-2">
          {t('form.phone')} <OptionalBadge />
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink/20 focus:border-pink transition-all bg-white"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-bold text-blue mb-4">
          {t('form.inquiryType')} <RequiredBadge />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inquiryTypes.map((type, index) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setValue('inquiryType', type.id, { shouldValidate: true })}
              className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                selectedInquiryType === type.id
                  ? 'border-pink bg-white shadow-soft ring-4 ring-pink/5 text-blue'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-pink/30 hover:bg-gray-50'
              } ${index === inquiryTypes.length - 1 && inquiryTypes.length % 2 !== 0 ? 'md:col-span-2' : ''}`}
            >
              <div className={`p-3 rounded-xl transition-colors ${
                selectedInquiryType === type.id ? 'bg-pink text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
              }`}>
                <type.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm md:text-base leading-tight">
                {type.label}
              </span>
              {selectedInquiryType === type.id && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-pink rounded-full flex items-center justify-center text-white">
                  <HiCheck className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('inquiryType')} />
        {errors.inquiryType && (
          <p className="mt-2 text-sm text-red-500">{errors.inquiryType.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="flex items-center text-sm font-bold text-blue mb-2">
          {t('form.message')} <RequiredBadge />
        </label>
        <textarea
          id="message"
          rows={6}
          {...register('message')}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink/20 focus:border-pink transition-all bg-white"
        />
        {errors.message && (
          <p className="mt-2 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            {...register('privacy')}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-pink focus:ring-pink cursor-pointer"
          />
          <span className="text-sm text-text group-hover:text-blue transition-colors">
            {t('form.privacy')} <RequiredBadge />
          </span>
        </label>
        {errors.privacy && (
          <p className="mt-2 text-sm text-red-500">{errors.privacy.message}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
          {t('success')}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800">
          {t('error')}
        </div>
      )}

      <div className="pt-4 flex justify-center">
        <CTAButton 
          type="submit" 
          variant="solid"
          className="text-lg min-w-[200px]" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (locale === 'ja' ? '送信中...' : 'Sending...') : t('form.submit')}
        </CTAButton>
      </div>
    </form>
  );
}

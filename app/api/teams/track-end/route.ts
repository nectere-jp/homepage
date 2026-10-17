import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * sendBeacon から到達するセッション終了シグナルを受け取り、
 * `teamSessions` コレクションにサマリーを upsert する。
 * documentId は sessionId を直指しするため、重複送信は idempotent に吸収される。
 */

const firstTouchSchema = z.object({
  campaignSlug: z.string().nullable(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    content: z.string().optional(),
    term: z.string().optional(),
  }),
  referrer: z.string().nullable(),
  landedAt: z.string(),
  landingPath: z.string(),
});

const trackEndSchema = z.object({
  slug: z.string().min(1),
  sessionId: z.string().min(1),
  campaignSlug: z.string().nullable(),
  firstTouch: firstTouchSchema,
  device: z.enum(['mobile', 'tablet', 'desktop']),
  userAgent: z.string(),
  screenWidth: z.number(),
  maxScrollDepth: z.number(),
  sections: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      dwellMs: z.number(),
    }),
  ),
  ctaClicks: z.array(
    z.object({
      ctaId: z.string(),
      href: z.string(),
      at: z.string(),
    }),
  ),
  landedAt: z.string(),
  endedAt: z.string(),
  durationMs: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = trackEndSchema.parse(body);

    const { firestore } = getFirebaseAdmin();
    const docRef = firestore.collection('teamSessions').doc(data.sessionId);

    const now = Timestamp.now();
    const dateStr = data.endedAt.slice(0, 10);

    const payload: Record<string, unknown> = {
      sessionId: data.sessionId,
      teamSlug: data.slug,
      campaignSlug: data.campaignSlug,
      firstTouch: data.firstTouch,
      device: data.device,
      userAgent: data.userAgent,
      screenWidth: data.screenWidth,
      maxScrollDepth: data.maxScrollDepth,
      sections: data.sections,
      ctaClicks: data.ctaClicks,
      landedAt: data.landedAt,
      endedAt: data.endedAt,
      durationMs: data.durationMs,
      date: dateStr,
      updatedAt: now,
    };

    const existing = await docRef.get();
    if (existing.exists) {
      await docRef.set(payload, { merge: true });
    } else {
      await docRef.set({ ...payload, createdAt: now });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    console.error('[Team Track-End] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from '../../../../../lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function sendEmail(to: string, subject: string, body: string) {
  console.log('Email Notification:');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  return true;
}

async function sendSlackNotification(webhookUrl: string, message: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    return response.ok;
  } catch (error) {
    console.error('Slack notification error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, message } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user || !user.preferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }

    const results = {
      email: false,
      slack: false,
    };

    if (user.preferences.emailNotifications && user.email) {
      results.email = await sendEmail(user.email, title, message);
    }

    if (user.preferences.slackNotifications && user.preferences.slackWebhookUrl) {
      results.slack = await sendSlackNotification(
        user.preferences.slackWebhookUrl,
        `*${title}*\n${message}`
      );
    }

    return NextResponse.json({
      success: true,
      sent: results,
    });
  } catch (error: any) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
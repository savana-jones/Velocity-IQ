import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions); // Pass authOptions
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.preferences) {
      const newPreferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          fullName: user.name || '',
          emailNotifications: true,
          slackNotifications: false,
          autoSync: true,
          syncInterval: 30,
          riskScoreThreshold: 8.0,
          language: 'en-US',
          timezone: 'UTC',
          darkMode: true,
        },
      });

      return NextResponse.json({
        success: true,
        preferences: newPreferences,
      });
    }

    return NextResponse.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error: any) {
    console.error('Preferences GET error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions); // Pass authOptions
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        fullName: body.fullName,
        emailNotifications: body.emailNotifications,
        slackNotifications: body.slackNotifications,
        slackWebhookUrl: body.slackWebhookUrl,
        autoSync: body.autoSync,
        syncInterval: body.syncInterval,
        riskScoreThreshold: body.riskScoreThreshold,
        language: body.language,
        timezone: body.timezone,
        darkMode: body.darkMode,
      },
      create: {
        userId: user.id,
        fullName: body.fullName || '',
        emailNotifications: body.emailNotifications ?? true,
        slackNotifications: body.slackNotifications ?? false,
        slackWebhookUrl: body.slackWebhookUrl,
        autoSync: body.autoSync ?? true,
        syncInterval: body.syncInterval ?? 30,
        riskScoreThreshold: body.riskScoreThreshold ?? 8.0,
        language: body.language || 'en-US',
        timezone: body.timezone || 'UTC',
        darkMode: body.darkMode ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    console.error('Preferences PUT error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
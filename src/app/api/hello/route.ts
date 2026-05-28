import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    env: {
      NEXT_PUBLIC_VALUE_FROM_SECRET: process.env.NEXT_PUBLIC_VALUE_FROM_SECRET || "(secret not configured)",
      NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE: process.env.NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE || "(module variable not set)",
      NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG: process.env.NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG || "(environment config not set)"
    },
    timestamp: new Date().toISOString()
  });
}
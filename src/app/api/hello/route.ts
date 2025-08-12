import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    env: {
      NEXT_PUBLIC_VALUE_FROM_SECRET: process.env.NEXT_PUBLIC_VALUE_FROM_SECRET || "",
      NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE: process.env.NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE || "",
      NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG: process.env.NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG || ""
    },
    timestamp: new Date().toISOString()
  });
}
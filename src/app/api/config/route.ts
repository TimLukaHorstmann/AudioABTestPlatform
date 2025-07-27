import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password, name, email } = await request.json();
    
    const userPassword = process.env.USER_PASSWORD || 'demo';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    // Verify credentials first
    let isValidUser = false;
    let isDeveloper = false;

    if (password === userPassword) {
      isValidUser = true;
    } else if (password === adminPassword && name === adminName && email === adminEmail) {
      isValidUser = true;
      isDeveloper = true;
    }

    if (!isValidUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Only return what's needed for the authenticated user
    return NextResponse.json({
      success: true,
      isDeveloper,
      adminName: isDeveloper ? adminName : undefined,
      adminEmail: isDeveloper ? adminEmail : undefined,
    });
  } catch (error) {
    console.error('Error verifying credentials:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

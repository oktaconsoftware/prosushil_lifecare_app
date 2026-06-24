import { NextResponse } from 'next/server';
import { db } from '../../../../db/index';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request) {
  try {
    const { employeeId, password } = await request.json();
    console.log(`\n--- LOGIN ATTEMPT: ${employeeId} ---`);

    if (!employeeId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // 1. Check if user exists (forcing exact string match)
    const userResult = await db.select().from(users).where(eq(users.employeeId, employeeId));
    
    if (userResult.length === 0) {
      console.log('❌ Result: User not found in database.');
      return NextResponse.json({ error: 'Invalid Employee ID or Password' }, { status: 401 });
    }

    const user = userResult[0];
    console.log(`✅ User found! DB Hash starts with: ${user.passwordHash.substring(0, 10)}...`);

    if (!user.isActive) {
      console.log('❌ Result: Account deactivated.');
      return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 });
    }

    // 2. Compare hashes
    const inputHash = await hashPassword(password);
    console.log(`🔑 Input Hash starts with: ${inputHash.substring(0, 10)}...`);
    
    if (inputHash !== user.passwordHash) {
      console.log('❌ Result: Hashes do NOT match.');
      return NextResponse.json({ error: 'Invalid Employee ID or Password' }, { status: 401 });
    }

    console.log('✅ Result: Login Successful!');
    return NextResponse.json({ 
      success: true, 
      role: user.role,
      name: user.name
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Same secure hashing function
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function PUT(request) {
  try {
    const { currentEmployeeId, newEmployeeId, newPassword } = await request.json();

    if (!currentEmployeeId) {
      return NextResponse.json({ error: 'Missing authentication identity.' }, { status: 400 });
    }

    // Prepare the fields to update
    const updateData = {};
    if (newEmployeeId && newEmployeeId.trim() !== '') {
      updateData.employeeId = newEmployeeId;
    }
    if (newPassword && newPassword.trim() !== '') {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No changes provided.' }, { status: 400 });
    }

    // Execute the update in PostgreSQL
    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.employeeId, currentEmployeeId))
      .returning({ employeeId: users.employeeId, name: users.name });

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully.',
      user: updatedUser[0] 
    }, { status: 200 });

  } catch (error) {
    console.error('Profile Update Error:', error);
    // 23505 is the PostgreSQL code for a unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ error: 'That username is already taken by someone else.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
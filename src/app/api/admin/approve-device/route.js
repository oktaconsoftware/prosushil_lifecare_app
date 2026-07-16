import { NextResponse } from 'next/server';
import { db } from '../../../../db/index';
import { users } from '../../../../db/schema';
import { eq, isNotNull } from 'drizzle-orm';

// GET all pending requests
export async function GET() {
  try {
    const pendingUsers = await db.select({
      employeeId: users.employeeId,
      name: users.name,
      deviceEnv: users.deviceEnv,
      pendingDeviceEnv: users.pendingDeviceEnv
    })
    .from(users)
    .where(isNotNull(users.pendingDeviceId));

    return NextResponse.json(pendingUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pending devices' }, { status: 500 });
  }
}

// POST to approve a specific request
export async function POST(request) {
  try {
    const { employeeId } = await request.json();

    const userResult = await db.select().from(users).where(eq(users.employeeId, employeeId));
    if (userResult.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const user = userResult[0];

    // Move the pending device to the official slot, and clear the pending state
    await db.update(users)
      .set({
        deviceId: user.pendingDeviceId,
        deviceEnv: user.pendingDeviceEnv,
        pendingDeviceId: null,
        pendingDeviceEnv: null
      })
      .where(eq(users.employeeId, employeeId));

    return NextResponse.json({ success: true, message: 'Device approved successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
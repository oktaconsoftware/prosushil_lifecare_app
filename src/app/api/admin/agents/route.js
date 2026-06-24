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

// FETCH ALL AGENTS
export async function GET() {
  try {
    const agents = await db.select({
      id: users.employeeId,
      name: users.name,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.role, 'AGENT'));

    const formattedTeam = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      target: "Awaiting Target", 
      deviation: "Offline",      
      dealsClosed: 0,
      dealVolume: 0,
      status: agent.isActive ? "Verified" : "Inactive"
    }));

    return NextResponse.json(formattedTeam);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load team data' }, { status: 500 });
  }
}

// PROVISION NEW AGENT
export async function POST(request) {
  try {
    const { name, employeeId, password, role } = await request.json();

    if (!name || !employeeId || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newAgent = await db.insert(users).values({
      name,
      employeeId,
      passwordHash: hashedPassword,
      role: role || 'AGENT',
      isActive: true,
    }).returning({
      id: users.employeeId
    });

    return NextResponse.json({ success: true, agent: newAgent[0] }, { status: 201 });
  } catch (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Employee ID already exists.' }, { status: 409 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// EDIT EXISTING AGENT
export async function PUT(request) {
  try {
    const { originalEmployeeId, name, employeeId, password } = await request.json();

    if (!originalEmployeeId || !name || !employeeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData = { name, employeeId };
    
    // Only update password if the admin typed a new one
    if (password && password.trim() !== '') {
      updateData.passwordHash = await hashPassword(password);
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.employeeId, originalEmployeeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'That Employee ID is taken.' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE AGENT
export async function DELETE(request) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) return NextResponse.json({ error: 'Missing Agent ID' }, { status: 400 });

    await db.delete(users).where(eq(users.employeeId, employeeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    // If they have foreign key ties (e.g. visit logs), PostgreSQL will block deletion.
    return NextResponse.json({ error: 'Cannot delete an agent who has active visit logs. You must deactivate them instead.' }, { status: 400 });
  }
}
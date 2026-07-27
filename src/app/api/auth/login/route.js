
// import { cookies, headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import { db } from '../../../../db/index';
// import { users } from '../../../../db/schema';
// import { eq } from 'drizzle-orm';

// async function hashPassword(password) {
//   const encoder = new TextEncoder();
//   const data = encoder.encode(password);
//   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
// }

// export async function POST(request) {
//   try {
//     const { employeeId, password } = await request.json();
//     console.log(`\n--- LOGIN ATTEMPT: ${employeeId} ---`);

//     if (!employeeId || !password) {
//       return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
//     }

//     // 1. Check if user exists
//     const userResult = await db.select().from(users).where(eq(users.employeeId, employeeId));
    
//     if (userResult.length === 0) {
//       console.log('❌ Result: User not found in database.');
//       return NextResponse.json({ error: 'Invalid Employee ID or Password' }, { status: 401 });
//     }

//     const user = userResult[0];

//     if (!user.isActive) {
//       console.log('❌ Result: Account deactivated.');
//       return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 });
//     }

//     // 2. Compare hashes
//     const inputHash = await hashPassword(password);
    
//     if (inputHash !== user.passwordHash) {
//       console.log('❌ Result: Hashes do NOT match.');
//       return NextResponse.json({ error: 'Invalid Employee ID or Password' }, { status: 401 });
//     }

//     console.log('✅ Password Verified! Running Device Security Check...');

//     // 3. 🚨 ENTERPRISE DEVICE BINDING LOGIC 🚨
//     if (user.role !== 'ADMIN') { // Exclude admins from device binding restrictions
//       // 🚨 FIX: Added `await` to cookies() and headers() for Next.js 15+ compatibility
//       const cookieStore = await cookies();
//       const headersList = await headers();
      
//       const deviceTokenCookie = cookieStore.get('deviceToken')?.value;
//       const userAgent = headersList.get('user-agent') || 'Unknown Device';

//       // SCENARIO A: First ever login (UNBOUND state)
//       if (!user.deviceId) {
//         console.log('📱 First login detected: Binding new device to user...');
//         const newDeviceToken = crypto.randomUUID();
        
//         // Lock the account in DB using Drizzle
//         await db.update(users)
//           .set({ deviceId: newDeviceToken, deviceEnv: userAgent })
//           .where(eq(users.employeeId, employeeId));

//         // Inject un-extractable HttpOnly cookie
//         cookieStore.set('deviceToken', newDeviceToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
//           path: '/',
//         });
//       } 
      
//       // SCENARIO B: Happy Path (Token matches AND Phone matches)
//       else if (user.deviceId === deviceTokenCookie && user.deviceEnv === userAgent) {
//         console.log('📱 Secure Device match successful!');
//         // Perfect match. Allow login to proceed.
//       } 
      
//       // SCENARIO C: The phone is waiting for admin approval
//       else if (user.pendingDeviceId === deviceTokenCookie) {
//         console.log('🚫 Login Blocked: This new device is still pending approval.');
//         return NextResponse.json(
//           { error: "Device is still pending Admin approval.", code: "DEVICE_PENDING" }, 
//           { status: 403 }
//         );
//       } 
      
//       // SCENARIO D: Hacker / Proxy Attempt / Broken Phone Replacement
//       else {
//         console.log(`🚨 UNAUTHORIZED DEVICE DETECTED! Expected: ${user.deviceEnv}, Got: ${userAgent}`);
//         const pendingToken = crypto.randomUUID();

//         // Save the attempt to DB using Drizzle for the Admin to review
//         await db.update(users)
//           .set({ pendingDeviceId: pendingToken, pendingDeviceEnv: userAgent })
//           .where(eq(users.employeeId, employeeId));

//         // Give the unauthorized phone the pending token
//         cookieStore.set('deviceToken', pendingToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 60 * 60 * 24 * 365 * 10,
//           path: '/',
//         });

//         return NextResponse.json(
//           { error: "Unrecognized device. Admin approval requested.", code: "DEVICE_PENDING" }, 
//           { status: 403 }
//         );
//       }
//     }

//     // 4. IF ALL CHECKS PASS: Set Auth Cookies (For your middleware/proxy.js)
//     // 🚨 FIX: Added `await` to cookies() here as well
//     const authCookieStore = await cookies();
//     authCookieStore.set('employeeId', user.employeeId, { path: '/', maxAge: 86400, sameSite: 'strict' });
//     authCookieStore.set('userRole', user.role, { path: '/', maxAge: 86400, sameSite: 'strict' });

//     console.log('✅ Result: Login Fully Successful!');
//     return NextResponse.json({ 
//       success: true, 
//       role: user.role,
//       name: user.name
//     }, { status: 200 });

//   } catch (error) {
//     console.error('Login Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


import { cookies } from 'next/headers';
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

    // 1. Check if user exists
    const userResult = await db.select().from(users).where(eq(users.employeeId, employeeId));
    
    if (userResult.length === 0) {
      console.log('❌ Result: User not found in database.');
      return NextResponse.json({ error: 'Invalid Employee ID or Password' }, { status: 401 });
    }

    const user = userResult[0];

    if (!user.isActive) {
      console.log('❌ Result: Account deactivated.');
      return NextResponse.json({ error: 'This account has been deactivated.' }, { status: 403 });
    }

    // 2. Compare hashes
    const inputHash = await hashPassword(password);
    
    if (inputHash !== user.passwordHash) {
      console.log('❌ Result: Hashes do NOT match.');
      return NextResponse.json({ error: 'Invalid Employee ID or Password' }, { status: 401 });
    }

    console.log('✅ Password Verified! Device tracking disabled. Proceeding to login...');

    // 3. IF ALL CHECKS PASS: Set Auth Cookies (For your middleware/proxy.js)
    const authCookieStore = await cookies();
    authCookieStore.set('employeeId', user.employeeId, { path: '/', maxAge: 86400, sameSite: 'strict' });
    authCookieStore.set('userRole', user.role, { path: '/', maxAge: 86400, sameSite: 'strict' });

    console.log('✅ Result: Login Fully Successful!');
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
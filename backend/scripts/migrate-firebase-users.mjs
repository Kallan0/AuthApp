import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import mongoose from 'mongoose';

process.loadEnvFile('.env');
const mongoUri = process.env.MONGODB_URI;
const projectId = process.env.FIREBASE_PROJECT_ID;
if (!mongoUri || !projectId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Set MONGODB_URI, FIREBASE_PROJECT_ID, and GOOGLE_APPLICATION_CREDENTIALS in backend/.env.');
}
const apply = process.argv.includes('--apply');
if (process.argv.some(arg => arg.startsWith('--') && arg !== '--apply')) {
  throw new Error('Only --apply is supported.');
}
initializeApp({ credential: applicationDefault(), projectId });
const auth = getAuth();

async function findFirebaseUser(uid, email) {
  let byUid;
  let byEmail;
  try { byUid = await auth.getUser(uid); }
  catch (error) { if (error.code !== 'auth/user-not-found') throw error; }
  try { byEmail = await auth.getUserByEmail(email); }
  catch (error) { if (error.code !== 'auth/user-not-found') throw error; }
  return { byUid, byEmail };
}

await mongoose.connect(mongoUri);
try {
  const users = mongoose.connection.collection('users');
  const legacy = await users.find({ firebaseUid: { $exists: false } }, {
    projection: { _id: 1, email: 1, name: 1, passwordHash: 1 },
  }).toArray();
  let ready = 0;
  let linked = 0;
  let conflicts = 0;
  for (const user of legacy) {
    const uid = user._id.toString();
    const email = String(user.email).trim().toLowerCase();
    const { byUid, byEmail } = await findFirebaseUser(uid, email);
    if ((byUid && byUid.email?.toLowerCase() !== email) ||
        (byEmail && byEmail.uid !== uid)) {
      console.error('Conflict for ' + email + ': Firebase already has a different account. Resolve manually.');
      conflicts++;
      continue;
    }
    if (!byUid && (typeof user.passwordHash !== 'string' || !/^\$2[aby]\$/.test(user.passwordHash))) {
      console.error('Cannot import ' + email + ': missing or unsupported bcrypt hash.');
      conflicts++;
      continue;
    }
    ready++;
    if (!apply) continue;
    if (!byUid) {
      const result = await auth.importUsers([{
        uid, email, displayName: user.name,
        passwordHash: Buffer.from(user.passwordHash, 'utf8'),
      }], { hash: { algorithm: 'BCRYPT' } });
      if (result.failureCount) {
        console.error('Firebase import failed for ' + email + ': ' + result.errors[0]?.error?.message);
        conflicts++;
        continue;
      }
    }
    const result = await users.updateOne(
      { _id: user._id, firebaseUid: { $exists: false } },
      { $set: { firebaseUid: uid } },
    );
    if (result.modifiedCount !== 1) {
      console.error('Mongo link did not update for ' + email + '. Rerun the migration.');
      conflicts++;
      continue;
    }
    linked++;
  }
  console.log(apply
    ? `Linked ${linked} of ${legacy.length} legacy accounts. Conflicts: ${conflicts}.`
    : `Dry run: ${ready} accounts ready to import or link; ${conflicts} conflicts. Run npm run migrate:firebase -- --apply to apply.`);
  if (conflicts) process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

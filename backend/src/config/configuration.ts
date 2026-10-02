export default () => {
  const mongodbUri = process.env.MONGODB_URI;
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
  if (!mongodbUri || !firebaseProjectId) {
    throw new Error('MONGODB_URI and FIREBASE_PROJECT_ID are required');
  }
  return { mongodbUri, firebaseProjectId };
};

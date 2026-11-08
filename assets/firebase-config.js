// Firebase's browser config is public by design. Firestore rules are the security boundary.
// Fill these values from Hassan's Firebase Console > Project settings > Your apps.
export const firebaseConfig = {
  apiKey: "AIzaSyCQcjKYJFhwKY8ga7WflrYzR9iw4ZBX0JI",
  authDomain: "hassan-portfoli.firebaseapp.com",
  projectId: "hassan-portfoli",
  appId: "1:29449899527:web:64c45cff954ad75506a4a2",
};

// Replace with the UID of Hassan's authorized admin account. Match firestore.rules.
export const ADMIN_UID = "PiAkU1oz3IdbTnQVSK9Bx1HKOTr2";

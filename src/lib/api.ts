import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserProfile(userId: string) {
  if (!userId) return null;

  try {
    const docRef = doc(db, 'nui-userdata-1', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No such user profile!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile from Firestore:', error);
    return null;
  }
}

export async function getCalendarEvents(userId: string) {
  if (!userId) return null;

  try {
    const docRef = doc(db, 'nui-userdata-1', userId, 'calendarContext', 'current');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No calendar context found!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching calendar context from Firestore:', error);
    return null;
  }
}

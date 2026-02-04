import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDfLY42NF49q0Ayr8n5xgU9aBvcfMS-AeY",
  authDomain: "project-8389853575566695424.firebaseapp.com",
  databaseURL: "https://project-8389853575566695424-default-rtdb.firebaseio.com",
  projectId: "project-8389853575566695424",
  storageBucket: "project-8389853575566695424.firebasestorage.app",
  messagingSenderId: "32711427090",
  appId: "1:32711427090:web:d16b9fafd910aff7d7c4cb",
  measurementId: "G-5QLLEPE4X3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  profilePhotoUrl?: string;
  userType: 'school' | 'user';
  city?: string;
  schoolName?: string;
  address?: string;
  phone?: string;
  website?: string;
  createdAt: string;
  followersCount?: number;
  postsCount?: number;
}

export interface PostData {
  id: string;
  schoolId: string;
  schoolName: string;
  schoolPhotoUrl?: string;
  content: string;
  category: 'notice' | 'exam' | 'event' | 'holiday' | 'emergency';
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  createdAt: string;
  likes: number;
}

export interface FollowData {
  id: string;
  userId: string;
  schoolId: string;
  createdAt: string;
}

export interface LikeData {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface SaveData {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

// Helper to remove undefined values
export function cleanObject<T extends Record<string, any>>(obj: T): T {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj as T;
}

// ========== USER FUNCTIONS ==========

export async function createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<UserData> {
  const usersRef = ref(database, 'users');
  const newUserRef = push(usersRef);
  const id = newUserRef.key!;
  
  const user: UserData = cleanObject({
    ...userData,
    id,
    createdAt: new Date().toISOString(),
    followersCount: 0,
    postsCount: 0,
  });
  
  await set(newUserRef, user);
  return user;
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'users'));
  
  if (snapshot.exists()) {
    const users = snapshot.val();
    for (const key in users) {
      if (users[key].email === email) {
        return users[key];
      }
    }
  }
  return null;
}

export async function getUserById(userId: string): Promise<UserData | null> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, `users/${userId}`));
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

export async function loginUser(email: string, password: string): Promise<UserData | null> {
  const user = await getUserByEmail(email);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserData>): Promise<void> {
  const userRef = ref(database, `users/${userId}`);
  await update(userRef, cleanObject(updates));
}

export function setCurrentUser(user: UserData): void {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

export function getCurrentUser(): UserData | null {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

export function logoutUser(): void {
  localStorage.removeItem('currentUser');
}

// ========== SCHOOL FUNCTIONS ==========

export async function getAllSchools(): Promise<UserData[]> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'users'));
  
  const schools: UserData[] = [];
  if (snapshot.exists()) {
    const users = snapshot.val();
    for (const key in users) {
      if (users[key].userType === 'school') {
        schools.push(users[key]);
      }
    }
  }
  return schools;
}

export async function getSchoolsByCity(city: string): Promise<UserData[]> {
  const schools = await getAllSchools();
  return schools.filter(school => 
    school.city?.toLowerCase().includes(city.toLowerCase())
  );
}

// ========== POST FUNCTIONS ==========

export async function createPost(postData: Omit<PostData, 'id' | 'createdAt' | 'likes'>): Promise<PostData> {
  const postsRef = ref(database, 'posts');
  const newPostRef = push(postsRef);
  const id = newPostRef.key!;
  
  const post: PostData = cleanObject({
    ...postData,
    id,
    createdAt: new Date().toISOString(),
    likes: 0,
  });
  
  await set(newPostRef, post);
  
  // Update school's post count
  const schoolRef = ref(database, `users/${postData.schoolId}`);
  const schoolSnapshot = await get(schoolRef);
  if (schoolSnapshot.exists()) {
    const school = schoolSnapshot.val();
    await update(schoolRef, { postsCount: (school.postsCount || 0) + 1 });
  }
  
  return post;
}

export async function getAllPosts(): Promise<PostData[]> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'posts'));
  
  const posts: PostData[] = [];
  if (snapshot.exists()) {
    const postsData = snapshot.val();
    for (const key in postsData) {
      posts.push(postsData[key]);
    }
  }
  
  // Sort by date, emergency first
  return posts.sort((a, b) => {
    if (a.category === 'emergency' && b.category !== 'emergency') return -1;
    if (a.category !== 'emergency' && b.category === 'emergency') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getPostsBySchool(schoolId: string): Promise<PostData[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.schoolId === schoolId);
}

export async function getPostsForUser(userId: string): Promise<PostData[]> {
  const followedSchools = await getFollowedSchools(userId);
  const schoolIds = followedSchools.map(s => s.id);
  
  if (schoolIds.length === 0) {
    return [];
  }
  
  const allPosts = await getAllPosts();
  return allPosts.filter(post => schoolIds.includes(post.schoolId));
}

// ========== FOLLOW FUNCTIONS ==========

export async function followSchool(userId: string, schoolId: string): Promise<void> {
  const followsRef = ref(database, 'follows');
  const newFollowRef = push(followsRef);
  const id = newFollowRef.key!;
  
  const follow: FollowData = {
    id,
    userId,
    schoolId,
    createdAt: new Date().toISOString(),
  };
  
  await set(newFollowRef, follow);
  
  // Update school's follower count
  const schoolRef = ref(database, `users/${schoolId}`);
  const schoolSnapshot = await get(schoolRef);
  if (schoolSnapshot.exists()) {
    const school = schoolSnapshot.val();
    await update(schoolRef, { followersCount: (school.followersCount || 0) + 1 });
  }
}

export async function unfollowSchool(userId: string, schoolId: string): Promise<void> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'follows'));
  
  if (snapshot.exists()) {
    const follows = snapshot.val();
    for (const key in follows) {
      if (follows[key].userId === userId && follows[key].schoolId === schoolId) {
        await remove(ref(database, `follows/${key}`));
        
        // Update school's follower count
        const schoolRef = ref(database, `users/${schoolId}`);
        const schoolSnapshot = await get(schoolRef);
        if (schoolSnapshot.exists()) {
          const school = schoolSnapshot.val();
          await update(schoolRef, { followersCount: Math.max((school.followersCount || 1) - 1, 0) });
        }
        break;
      }
    }
  }
}

export async function isFollowing(userId: string, schoolId: string): Promise<boolean> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'follows'));
  
  if (snapshot.exists()) {
    const follows = snapshot.val();
    for (const key in follows) {
      if (follows[key].userId === userId && follows[key].schoolId === schoolId) {
        return true;
      }
    }
  }
  return false;
}

export async function getFollowedSchools(userId: string): Promise<UserData[]> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'follows'));
  
  const schoolIds: string[] = [];
  if (snapshot.exists()) {
    const follows = snapshot.val();
    for (const key in follows) {
      if (follows[key].userId === userId) {
        schoolIds.push(follows[key].schoolId);
      }
    }
  }
  
  const schools: UserData[] = [];
  for (const schoolId of schoolIds) {
    const school = await getUserById(schoolId);
    if (school) {
      schools.push(school);
    }
  }
  
  return schools;
}

export async function getFollowersCount(schoolId: string): Promise<number> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'follows'));
  
  let count = 0;
  if (snapshot.exists()) {
    const follows = snapshot.val();
    for (const key in follows) {
      if (follows[key].schoolId === schoolId) {
        count++;
      }
    }
  }
  return count;
}

// ========== LIKE FUNCTIONS ==========

export async function likePost(userId: string, postId: string): Promise<void> {
  const likesRef = ref(database, 'likes');
  const newLikeRef = push(likesRef);
  const id = newLikeRef.key!;
  
  const like: LikeData = {
    id,
    userId,
    postId,
    createdAt: new Date().toISOString(),
  };
  
  await set(newLikeRef, like);
  
  // Update post's like count
  const dbRef = ref(database);
  const postsSnapshot = await get(child(dbRef, 'posts'));
  if (postsSnapshot.exists()) {
    const posts = postsSnapshot.val();
    for (const key in posts) {
      if (posts[key].id === postId) {
        await update(ref(database, `posts/${key}`), { likes: (posts[key].likes || 0) + 1 });
        break;
      }
    }
  }
}

export async function unlikePost(userId: string, postId: string): Promise<void> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'likes'));
  
  if (snapshot.exists()) {
    const likes = snapshot.val();
    for (const key in likes) {
      if (likes[key].userId === userId && likes[key].postId === postId) {
        await remove(ref(database, `likes/${key}`));
        
        // Update post's like count
        const postsSnapshot = await get(child(dbRef, 'posts'));
        if (postsSnapshot.exists()) {
          const posts = postsSnapshot.val();
          for (const postKey in posts) {
            if (posts[postKey].id === postId) {
              await update(ref(database, `posts/${postKey}`), { 
                likes: Math.max((posts[postKey].likes || 1) - 1, 0) 
              });
              break;
            }
          }
        }
        break;
      }
    }
  }
}

export async function hasLikedPost(userId: string, postId: string): Promise<boolean> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'likes'));
  
  if (snapshot.exists()) {
    const likes = snapshot.val();
    for (const key in likes) {
      if (likes[key].userId === userId && likes[key].postId === postId) {
        return true;
      }
    }
  }
  return false;
}

// ========== SAVE FUNCTIONS ==========

export async function savePost(userId: string, postId: string): Promise<void> {
  const savesRef = ref(database, 'saves');
  const newSaveRef = push(savesRef);
  const id = newSaveRef.key!;
  
  const save: SaveData = {
    id,
    userId,
    postId,
    createdAt: new Date().toISOString(),
  };
  
  await set(newSaveRef, save);
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'saves'));
  
  if (snapshot.exists()) {
    const saves = snapshot.val();
    for (const key in saves) {
      if (saves[key].userId === userId && saves[key].postId === postId) {
        await remove(ref(database, `saves/${key}`));
        break;
      }
    }
  }
}

export async function hasSavedPost(userId: string, postId: string): Promise<boolean> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'saves'));
  
  if (snapshot.exists()) {
    const saves = snapshot.val();
    for (const key in saves) {
      if (saves[key].userId === userId && saves[key].postId === postId) {
        return true;
      }
    }
  }
  return false;
}

export async function getSavedPosts(userId: string): Promise<PostData[]> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'saves'));
  
  const postIds: string[] = [];
  if (snapshot.exists()) {
    const saves = snapshot.val();
    for (const key in saves) {
      if (saves[key].userId === userId) {
        postIds.push(saves[key].postId);
      }
    }
  }
  
  const allPosts = await getAllPosts();
  return allPosts.filter(post => postIds.includes(post.id));
}

export { database };

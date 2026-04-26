import { v4 as uuidv4 } from "uuid";
import { getUsers, saveUsers, getSession, saveSession, clearSession } from "./storage";
import type { User, Session } from "@/types/auth";

// find user by email
export function getUserByEmail(users: User[], email: string) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

// validate credentials
export function validateCredentials(users: User[], email: string, password: string): User | null {
  const user = getUserByEmail(users, email)

  if (!user) return null;
  if(user.password !== password) return null;

  return user;
}

// create user
export function createUser(email: string, password: string): User {
  return {
    id: uuidv4(),
    email: email.trim().toLowerCase(),
    password,
    createdAt: new Date().toISOString()
  }
}

export function buildSession(user: User): Session {
  return {
    userId: user.id,
    email: user.email
  }
}


// Auth operations
export type AuthResult = 
| {success: true; session: Session}
| {success: false; error: string}

// sign up
export function signUp(email: string, password: string): AuthResult {
  const users = getUsers()

  const existingUser = getUserByEmail(users, email)
  if (existingUser) return {success: false, error: 'User already exists'}

  const newUser = createUser(email, password);
  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  const session = buildSession(newUser);
  saveSession(session);

  return {success: true, session}
}

// sign in
export function signIn(email: string, password: string): AuthResult {
  const users = getUsers();

  const user = validateCredentials(users, email, password);
  if(!user) {
    return {success: false, error: 'Invalid email or password'}
  }

  const session = buildSession(user);
  saveSession(session)

  return {success: true, session}
}

// log out
export function logOut(): void {
  clearSession();
}

// read session
export function readSession(): Session | null {
  return getSession();
}
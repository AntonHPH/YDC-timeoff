export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

const USERS_KEY = "hp-eleave-users";
const CURRENT_USER_KEY = "hp-eleave-current-user";

const seedUser: StoredUser = {
  id: "seed-admin-user",
  name: "System Admin",
  email: "admin@hutchisonports.com",
  password: "Password123!",
};

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify([seedUser]));
    return [seedUser];
  }

  try {
    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify([seedUser]));
      return [seedUser];
    }

    return parsed;
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify([seedUser]));
    return [seedUser];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function login(email: string, password: string): { ok: true; user: AuthUser } | { ok: false; message: string } {
  const users = readUsers();
  const matched = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());

  if (!matched || matched.password !== password) {
    return { ok: false, message: "Invalid email or password." };
  }

  const user: AuthUser = { id: matched.id, name: matched.name, email: matched.email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function register(
  name: string,
  email: string,
  password: string
): { ok: true; user: AuthUser } | { ok: false; message: string } {
  const normalizedEmail = email.trim().toLowerCase();

  if (!name.trim()) {
    return { ok: false, message: "Name is required." };
  }

  if (!normalizedEmail) {
    return { ok: false, message: "Email is required." };
  }

  if (password.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters." };
  }

  const users = readUsers();
  const exists = users.some((x) => x.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return { ok: false, message: "This email is already registered." };
  }

  const created: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
  };

  const next = [...users, created];
  writeUsers(next);

  const user: AuthUser = { id: created.id, name: created.name, email: created.email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { ok: true, user };
}

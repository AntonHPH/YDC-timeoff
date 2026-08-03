export type UserRole = "Employee" | "Supervisor" | "Manager" | "HR" | "SystemAdministrator";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
}

interface StoredUser extends AuthUser {
  password: string;
  isActive: boolean;
}

const USERS_KEY = "hp-eleave-users";
const CURRENT_USER_KEY = "hp-eleave-current-user";

const employeeIds = {
  bot0: "11111111-1111-1111-1111-111111111111",
  bot1: "22222222-2222-2222-2222-222222222222",
  bot2: "33333333-3333-3333-3333-333333333333",
  bot3: "44444444-4444-4444-4444-444444444444",
  bot4: "55555555-5555-5555-5555-555555555555",
  bot5: "66666666-6666-6666-6666-666666666666",
  bot6: "77777777-7777-7777-7777-777777777777",
  bot7: "88888888-8888-8888-8888-888888888888",
  bot8: "99999999-9999-9999-9999-999999999999",
  bot9: "aaaaaaaa-1111-1111-1111-111111111111",
  bot10: "bbbbbbbb-1111-1111-1111-111111111111",
  bot11: "cccccccc-1111-1111-1111-111111111111",
  bot12: "dddddddd-1111-1111-1111-111111111111",
};

const seedUsers: StoredUser[] = [
  {
    id: "seed-bot0-user",
    name: "Bot0",
    email: "bot0@hutchisonports.com",
    password: "1234",
    role: "SystemAdministrator",
    employeeId: employeeIds.bot0,
    isActive: true,
  },
  {
    id: "seed-bot1-user",
    name: "Bot1",
    email: "bot1@hutchisonports.com",
    password: "1234",
    role: "Manager",
    employeeId: employeeIds.bot1,
    isActive: true,
  },
  {
    id: "seed-bot2-user",
    name: "Bot2",
    email: "bot2@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot2,
    isActive: true,
  },
  {
    id: "seed-bot3-user",
    name: "Bot3",
    email: "bot3@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot3,
    isActive: true,
  },
  {
    id: "seed-bot4-user",
    name: "Bot4",
    email: "bot4@hutchisonports.com",
    password: "1234",
    role: "Manager",
    employeeId: employeeIds.bot4,
    isActive: true,
  },
  {
    id: "seed-bot5-user",
    name: "Bot5",
    email: "bot5@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot5,
    isActive: true,
  },
  {
    id: "seed-bot6-user",
    name: "Bot6",
    email: "bot6@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot6,
    isActive: true,
  },
  {
    id: "seed-bot7-user",
    name: "Bot7",
    email: "bot7@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot7,
    isActive: true,
  },
  {
    id: "seed-bot8-user",
    name: "Bot8",
    email: "bot8@hutchisonports.com",
    password: "1234",
    role: "Supervisor",
    employeeId: employeeIds.bot8,
    isActive: true,
  },
  {
    id: "seed-bot9-user",
    name: "Bot9",
    email: "bot9@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot9,
    isActive: true,
  },
  {
    id: "seed-bot10-user",
    name: "Bot10",
    email: "bot10@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot10,
    isActive: true,
  },
  {
    id: "seed-bot11-user",
    name: "Bot11",
    email: "bot11@hutchisonports.com",
    password: "1234",
    role: "Employee",
    employeeId: employeeIds.bot11,
    isActive: true,
  },
  {
    id: "seed-bot12-user",
    name: "Bot12",
    email: "bot12@hutchisonports.com",
    password: "1234",
    role: "Manager",
    employeeId: employeeIds.bot12,
    isActive: true,
  },
];
const allowedBotEmails = new Set(seedUsers.map((x) => x.email));

export const roleList: UserRole[] = ["Employee", "Supervisor", "Manager", "HR", "SystemAdministrator"];

function isUserRole(value: string): value is UserRole {
  return roleList.includes(value as UserRole);
}

function normalizeStoredUser(raw: Partial<StoredUser> & Record<string, unknown>): StoredUser | null {
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  if (!email) {
    return null;
  }

  const baseByEmail = seedUsers.find((x) => x.email === email);
  const role = typeof raw.role === "string" && isUserRole(raw.role) ? raw.role : baseByEmail?.role ?? "Employee";
  const employeeId =
    typeof raw.employeeId === "string" && raw.employeeId
      ? raw.employeeId
      : baseByEmail?.employeeId ?? employeeIds.bot2;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : baseByEmail?.name ?? email,
    email,
    password: typeof raw.password === "string" ? raw.password : "1234",
    role,
    employeeId,
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : true,
  };
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    writeUsers(seedUsers);
    return [...seedUsers];
  }

  try {
    const parsed = JSON.parse(raw) as Array<Partial<StoredUser> & Record<string, unknown>>;
    if (!Array.isArray(parsed)) {
      writeUsers(seedUsers);
      return [...seedUsers];
    }

    const normalized = parsed
      .map((item) => normalizeStoredUser(item))
      .filter((item): item is StoredUser => Boolean(item))
      .filter((item) => allowedBotEmails.has(item.email));

    const merged = [...normalized];
    for (const seed of seedUsers) {
      if (!merged.some((x) => x.email === seed.email)) {
        merged.push(seed);
      }
    }

    if (merged.length === 0) {
      writeUsers(seedUsers);
      return [...seedUsers];
    }

    writeUsers(merged);
    return merged;
  } catch {
    writeUsers(seedUsers);
    return [...seedUsers];
  }
}

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
  };
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser> & Record<string, unknown>;
    const users = readUsers();
    const parsedEmail = typeof parsed.email === "string" ? parsed.email.toLowerCase() : "";
    const found = parsedEmail ? users.find((x) => x.email === parsedEmail) : null;
    if (!found || !found.isActive) {
      return null;
    }

    return toAuthUser(found);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function login(email: string, password: string): { ok: true; user: AuthUser } | { ok: false; message: string } {
  const users = readUsers();
  const matched = users.find((x) => x.email === email.trim().toLowerCase());

  if (!matched || matched.password !== password) {
    return { ok: false, message: "Invalid email or password." };
  }

  if (!matched.isActive) {
    return { ok: false, message: "This user account is inactive." };
  }

  const user = toAuthUser(matched);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { ok: true, user };
}

export function register(
  name: string,
  email: string,
  password: string
): { ok: true; user: AuthUser } | { ok: false; message: string } {
  void name;
  void email;
  void password;
  return { ok: false, message: "Self-registration is disabled in bot demo mode." };
}

export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) {
    return false;
  }

  return roles.includes(user.role);
}

export function isAdminRole(user: AuthUser | null): boolean {
  return hasAnyRole(user, ["HR", "SystemAdministrator"]);
}

export function isApproverRole(user: AuthUser | null): boolean {
  return hasAnyRole(user, ["Supervisor", "Manager", "HR", "SystemAdministrator"]);
}

export function getCurrentEmployeeId(): string {
  return getCurrentUser()?.employeeId ?? employeeIds.bot0;
}


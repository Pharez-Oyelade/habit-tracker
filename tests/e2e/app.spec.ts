import { test, expect, type Page } from '@playwright/test';

// Constants

const BASE_URL    = 'http://localhost:3000';
const TEST_EMAIL  = 'e2e-user@example.com';
const TEST_PASS   = 'testpass123';
const TEST_EMAIL2 = 'e2e-user2@example.com';
const TEST_PASS2  = 'testpass456';

// Helpers

async function seedAuthenticatedUser(
  page: Page,
  email  = TEST_EMAIL,
  userId = 'e2e-user-001'
) {
  await page.evaluate(
    ({ email, userId }) => {
      const user = {
        id: userId,
        email,
        password: 'testpass123',
        createdAt: new Date().toISOString(),
      };
      const existing = JSON.parse(
        localStorage.getItem('habit-tracker-users') ?? '[]'
      );
      const alreadyExists = existing.some((u: { email: string }) => u.email === email);
      if (!alreadyExists) {
        localStorage.setItem(
          'habit-tracker-users',
          JSON.stringify([...existing, user])
        );
      }
      localStorage.setItem(
        'habit-tracker-session',
        JSON.stringify({ userId, email })
      );
    },
    { email, userId }
  );
}

/**
 * Clears all habit-tracker localStorage keys
 * between tests for isolation.
 */
async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('habit-tracker-users');
    localStorage.removeItem('habit-tracker-session');
    localStorage.removeItem('habit-tracker-habits');
  });
}

/**
 * Signs up a new user through the UI and lands on /dashboard.
 */
async function signUpViaUI(
  page: Page,
  email = TEST_EMAIL,
  password = TEST_PASS
) {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(email);
  await page.getByTestId('auth-signup-password').fill(password);
  await page.getByTestId('auth-signup-submit').click();
  await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
}

/**
 * Logs in an existing user through the UI and lands on /dashboard.
 */
async function loginViaUI(
  page: Page,
  email = TEST_EMAIL,
  password = TEST_PASS
) {
  await page.goto('/login');
  await page.getByTestId('auth-login-email').fill(email);
  await page.getByTestId('auth-login-password').fill(password);
  await page.getByTestId('auth-login-submit').click();
  await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
}

/**
 * Creates a habit via the dashboard UI.
 * Assumes the user is already on /dashboard.
 */
async function createHabitViaUI(
  page: Page,
  name: string,
  description = ''
) {
  await page.getByTestId('create-habit-button').click();
  await expect(page.getByTestId('habit-form')).toBeVisible();
  await page.getByTestId('habit-name-input').fill(name);
  if (description) {
    await page.getByTestId('habit-description-input').fill(description);
  }
  await page.getByTestId('habit-save-button').click();
  await expect(page.getByTestId('habit-form')).not.toBeVisible({ timeout: 3000 });
}

/**
 * Converts a habit name to its expected slug.
 * Mirrors the getHabitSlug logic from src/lib/slug.ts.
 */
function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Test Suite

test.describe('Habit Tracker app', () => {


  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearStorage(page);
  });

  // Splash & routing

  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');

    // Splash screen must be immediately visible
    await expect(page.getByTestId('splash-screen')).toBeVisible();

    // Splash must contain the app name
    await expect(page.getByTestId('splash-screen')).toContainText('Habit Tracker');

    // After the splash delay (max 2000ms per spec + buffer), must land on /login
    await expect(page).toHaveURL('/login', { timeout: 3000 });

    // Splash screen must no longer be visible after redirect
    await expect(page.getByTestId('splash-screen')).not.toBeVisible({ timeout: 1000 });
  });

  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await page.goto('/');

    // Seed a valid session while on the page
    await seedAuthenticatedUser(page);

    // Reload to trigger the splash redirect logic with the session present
    await page.reload();

    // Splash must still show first
    await expect(page.getByTestId('splash-screen')).toBeVisible();

    // Then redirect to dashboard since session exists
    await expect(page).toHaveURL('/dashboard', { timeout: 3000 });
  });

  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    // No session seeded — direct navigation to dashboard
    await page.goto('/dashboard');

    // Must be immediately redirected to /login
    await expect(page).toHaveURL('/login', { timeout: 3000 });

    // Dashboard page must not be rendered
    await expect(page.getByTestId('dashboard-page')).not.toBeVisible();
  });

  // Auth flows

  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');

    await page.getByTestId('auth-signup-email').fill(TEST_EMAIL);
    await page.getByTestId('auth-signup-password').fill(TEST_PASS);
    await page.getByTestId('auth-signup-submit').click();

    // Must land on dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });

    // Dashboard page must be visible
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Session must have been written to localStorage
    const session = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null')
    );
    expect(session).not.toBeNull();
    expect(session.email).toBe(TEST_EMAIL);
  });

  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    // Create user 1 and seed a habit for them
    await page.goto('/');
    await seedAuthenticatedUser(page, TEST_EMAIL, 'user-001');

    const user1Habit = {
      id: 'habit-u1-001',
      userId: 'user-001',
      name: 'Morning Run',
      description: '',
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      completions: [],
    };

    // Create user 2 and seed a habit for them
    await page.evaluate(
      ({ email, habit }) => {
        // Add user 2 to users array
        const users = JSON.parse(
          localStorage.getItem('habit-tracker-users') ?? '[]'
        );
        users.push({
          id: 'user-002',
          email,
          password: 'testpass456',
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('habit-tracker-users', JSON.stringify(users));

        // Save user 1's habit
        const user2Habit = {
          id: 'habit-u2-001',
          userId: 'user-002',
          name: 'Evening Walk',
          description: '',
          frequency: 'daily',
          createdAt: new Date().toISOString(),
          completions: [],
        };
        localStorage.setItem(
          'habit-tracker-habits',
          JSON.stringify([habit, user2Habit])
        );

        // Clear session so we can login fresh
        localStorage.removeItem('habit-tracker-session');
      },
      { email: TEST_EMAIL2, habit: user1Habit }
    );

    // Log in as user 1
    await loginViaUI(page, TEST_EMAIL, TEST_PASS);

    // User 1's habit must be visible
    await expect(
      page.getByTestId(`habit-card-${toSlug('Morning Run')}`)
    ).toBeVisible();

    // User 2's habit must NOT be visible
    await expect(
      page.getByTestId(`habit-card-${toSlug('Evening Walk')}`)
    ).not.toBeVisible();
  });

  // Habit CRUD

  test('creates a habit from the dashboard', async ({ page }) => {
    await page.goto('/');
    await seedAuthenticatedUser(page);
    await page.goto('/dashboard');

    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Empty state should be visible before any habits exist
    await expect(page.getByTestId('empty-state')).toBeVisible();

    // Create a habit via the UI
    await createHabitViaUI(page, 'Drink Water', '8 glasses a day');

    // The habit card must now appear in the list
    const slug = toSlug('Drink Water');
    await expect(page.getByTestId(`habit-card-${slug}`)).toBeVisible();

    // Empty state must be gone
    await expect(page.getByTestId('empty-state')).not.toBeVisible();

    // Streak starts at 0
    await expect(page.getByTestId(`habit-streak-${slug}`)).toContainText('0');

    // Confirm persistence in localStorage
    const habits = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('habit-tracker-habits') ?? '[]')
    );
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Drink Water');
    expect(habits[0].frequency).toBe('daily');
  });

  // Completion & streak

  test('completes a habit for today and updates the streak', async ({ page }) => {
    await page.goto('/');
    await seedAuthenticatedUser(page);
    await page.goto('/dashboard');

    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    await createHabitViaUI(page, 'Read Books');
    const slug = toSlug('Read Books');

    // Confirm streak is 0 before completion
    await expect(page.getByTestId(`habit-streak-${slug}`)).toContainText('0');

    // Mark the habit as complete for today
    await page.getByTestId(`habit-complete-${slug}`).click();

    // Streak must update to 1 immediately
    await expect(
      page.getByTestId(`habit-streak-${slug}`)
    ).toContainText('1', { timeout: 2000 });

    // Verify the completion was written to localStorage
    const today   = new Date().toISOString().slice(0, 10);
    const habits  = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('habit-tracker-habits') ?? '[]')
    );
    expect(habits[0].completions).toContain(today);

    // Toggle it off — click again to unmark
    await page.getByTestId(`habit-complete-${slug}`).click();

    // Streak must drop back to 0
    await expect(
      page.getByTestId(`habit-streak-${slug}`)
    ).toContainText('0', { timeout: 2000 });
  });

  // Persistence

  test('persists session and habits after page reload', async ({ page }) => {
    // Sign up and create a habit
    await signUpViaUI(page);
    await createHabitViaUI(page, 'Meditate');

    const slug = toSlug('Meditate');
    await expect(page.getByTestId(`habit-card-${slug}`)).toBeVisible();

    // Hard reload — simulates closing and reopening the app
    await page.reload();

    // Session must still be valid — dashboard must render
    await expect(page).toHaveURL('/dashboard', { timeout: 3000 });
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Habit must still be present
    await expect(page.getByTestId(`habit-card-${slug}`)).toBeVisible();

    // Mark complete, reload again — completion must persist too
    await page.getByTestId(`habit-complete-${slug}`).click();
    await expect(
      page.getByTestId(`habit-streak-${slug}`)
    ).toContainText('1', { timeout: 2000 });

    await page.reload();

    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(
      page.getByTestId(`habit-streak-${slug}`)
    ).toContainText('1');
  });

  // Logout

  test('logs out and redirects to /login', async ({ page }) => {
    await signUpViaUI(page);

    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Click the logout button
    await page.getByTestId('auth-logout-button').click();

    // Must be redirected to /login
    await expect(page).toHaveURL('/login', { timeout: 3000 });

    // Session must be cleared from localStorage
    const session = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null')
    );
    expect(session).toBeNull();

    // Attempting to access /dashboard must redirect back to /login
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login', { timeout: 3000 });
  });

  // Offline / PWA

  test('loads the cached app shell when offline after the app has been loaded once', async ({ page, context }) => {
    // Step 1 — Load the app online first so the service worker
    // can install and cache the app shell
    await page.goto('/');

    // Wait for the redirect (confirms full load)
    await expect(page).toHaveURL('/login', { timeout: 5000 });

    // Also load the login page to ensure it gets cached
    await page.goto('/login');
    await expect(page.getByTestId('auth-login-submit')).toBeVisible();

    // Give the service worker time to finish caching
    await page.waitForTimeout(1500);

    // Step 2 — Go offline
    await context.setOffline(true);

    // Step 3 — Reload the page while offline
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Step 4 — App shell must render — no browser-level crash page
    // Check that the body has actual app content, not a network error
    const bodyText = await page.locator('body').textContent();

    // A hard crash would show browser error strings
    expect(bodyText).not.toContain('ERR_INTERNET_DISCONNECTED');
    expect(bodyText).not.toContain('ERR_CONNECTION_REFUSED');
    expect(bodyText).not.toContain('No internet');
    expect(bodyText).not.toContain('DNS_PROBE_FINISHED');

    // The page must have rendered meaningful HTML
    const htmlContent = await page.content();
    expect(htmlContent.length).toBeGreaterThan(200);

    // Restore network
    await context.setOffline(false);
  });

});
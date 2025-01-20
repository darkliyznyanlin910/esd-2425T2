import { test, expect } from '@playwright/test';

test('API request returns status code 200', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok()).toBeTruthy();
  expect(await response.json()).toEqual({ ok: true });
}); 
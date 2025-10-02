import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('landing page loads and displays all sections', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Hero section
    await expect(page.getByRole('heading', { name: /parceiro de IA/i })).toBeVisible();

    // CTA buttons
    await expect(page.getByRole('button', { name: /Quero meu headhunter pessoal/i }).first()).toBeVisible();

    // How It Works sections
    await expect(page.getByText('Como funciona a TalentBase?')).toBeVisible();
    await expect(page.getByText('1. Preencha seu perfil')).toBeVisible();
    await expect(page.getByText('2. IA procura a vaga para você')).toBeVisible();
    await expect(page.getByText('3. Apresentamos você')).toBeVisible();

    // CTA Section
    await expect(page.getByText('Enquanto você pensa')).toBeVisible();

    // Footer
    await expect(page.getByText('© 2025 TalentBase')).toBeVisible();
  });

  test('page has correct SEO meta tags', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Check title
    await expect(page).toHaveTitle(/TalentBase.*Recrutamento Tech/i);

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /vagas tech.*IA/i);
  });

  test('page is responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/');
    await expect(page.getByRole('heading', { name: /parceiro de IA/i })).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /parceiro de IA/i })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('heading', { name: /parceiro de IA/i })).toBeVisible();
  });

  test('CTA buttons are clickable', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    const ctaButton = page.getByRole('button', { name: /Quero meu headhunter pessoal/i }).first();
    await expect(ctaButton).toBeEnabled();
    await expect(ctaButton).toBeVisible();
  });

  test('social proof section displays company names', async ({ page }) => {
    await page.goto('http://localhost:3000/');

    // Check for company names
    await expect(page.getByText('Totus')).toBeVisible();
    await expect(page.getByText('Mindsight')).toBeVisible();
    await expect(page.getByText('Ploomes')).toBeVisible();
    await expect(page.getByText('Sankhya')).toBeVisible();
    await expect(page.getByText('Caju')).toBeVisible();
  });
});

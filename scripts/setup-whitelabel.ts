import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface WhitelabelSetup {
  appName: string
  appSubtitle: string
  brandName: string
  companyName: string
  primaryColor: string
  features: string[]
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

export async function setupWhitelabel() {
  console.log('🚀 Whitelabel Setup - DNZ Central\n');

  const appName = await question('App Name (default: DNZ Central): ') || 'DNZ Central';
  const appSubtitle = await question('App Subtitle (default: DOES NOT ZERO): ') || 'DOES NOT ZERO';
  const brandName = await question('Brand Name (default: DNZ Films): ') || 'DNZ Films';
  const companyName = await question('Company Name (default: DNZ Films): ') || 'DNZ Films';
  const primaryColor = await question('Primary Color (default: #ff2400): ') || '#ff2400';

  console.log('\n📦 Select features (comma-separated, or press Enter for all):');
  console.log('Available: commandPalette, googleDrive, videoReview, studioDocs, finance, analytics');
  const featuresInput = await question('Features: ');
  const features = featuresInput 
    ? featuresInput.split(',').map(f => f.trim())
    : ['commandPalette', 'googleDrive', 'videoReview', 'studioDocs', 'finance', 'analytics'];

  const brandingConfig = {
    appName,
    appSubtitle,
    brandName,
    companyName,
    primaryColor,
    primaryColorDark: adjustColor(primaryColor, -20),
    salesEmail: '',
    salesWhatsapp: '',
    whatsapp: '',
    currency: 'BRL'
  };

  const featureConfig = features.reduce((acc, feature) => {
    acc[feature] = true;
    return acc;
  }, {} as Record<string, boolean>);

  const limitConfig = {
    maxWorkspaces: 1,
    maxMembersPerWorkspace: 10,
    maxProjects: 100,
    maxStorageGB: 10
  };

  const envContent = `VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_EMAILS=
VITE_BRANDING_CONFIG=${JSON.stringify(brandingConfig)}
VITE_FEATURE_CONFIG=${JSON.stringify(featureConfig)}
VITE_LIMIT_CONFIG=${JSON.stringify(limitConfig)}
VITE_ASSET_CONFIG={"logoUrl":"","loginLogoUrl":"","heroPreviewUrl":"","aboutImageUrl":"","productScreenshots":[]}
VITE_INSTAGRAM_URL=
`;

  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Whitelabel setup complete!');
  console.log(`📝 .env file created at: ${envPath}`);
  console.log('\n🎨 Configuration:');
  console.log(`  App Name: ${appName}`);
  console.log(`  Brand: ${brandName}`);
  console.log(`  Primary Color: ${primaryColor}`);
  console.log(`  Features: ${features.join(', ')}`);

  rl.close();
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupWhitelabel().catch(console.error);
}

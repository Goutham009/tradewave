import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Default country configurations for major trading nations
const DEFAULT_COUNTRY_CONFIGS: Record<string, any> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    region: 'NORTH_AMERICA',
    taxIdType: 'EIN',
    taxIdExample: '12-3456789',
    riskLevel: 'LOW',
    defaultLanguage: 'en',
    businessTypes: ['LLC', 'CORPORATION', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'S_CORP', 'C_CORP'],
    mandatoryDocuments: ['TAX_CERTIFICATE', 'REGISTRATION_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    region: 'EUROPE',
    taxIdType: 'VAT',
    taxIdExample: 'GB123456789',
    riskLevel: 'LOW',
    defaultLanguage: 'en',
    businessTypes: ['LIMITED', 'PLC', 'LLP', 'SOLE_TRADER', 'PARTNERSHIP'],
    mandatoryDocuments: ['VAT_CERTIFICATE', 'INCORPORATION_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    region: 'EUROPE',
    taxIdType: 'VAT',
    taxIdExample: 'DE123456789',
    riskLevel: 'LOW',
    defaultLanguage: 'de',
    businessTypes: ['GMBH', 'AG', 'UG', 'OHG', 'KG', 'EINZELUNTERNEHMEN'],
    mandatoryDocuments: ['VAT_CERTIFICATE', 'HANDELSREGISTER', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  IN: {
    countryCode: 'IN',
    countryName: 'India',
    region: 'ASIA',
    taxIdType: 'GST',
    taxIdExample: '22AAAAA0000A1Z5',
    riskLevel: 'MEDIUM',
    defaultLanguage: 'en',
    businessTypes: ['PRIVATE_LTD', 'PUBLIC_LTD', 'LLP', 'PARTNERSHIP', 'SOLE_PROPRIETOR', 'OPC'],
    mandatoryDocuments: ['GST_CERTIFICATE', 'PAN_CARD', 'INCORPORATION_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF', 'PAN_VERIFICATION']
  },
  CN: {
    countryCode: 'CN',
    countryName: 'China',
    region: 'ASIA',
    taxIdType: 'USCC',
    taxIdExample: '91310000MA1FL8XXXX',
    riskLevel: 'MEDIUM',
    defaultLanguage: 'zh',
    businessTypes: ['LLC', 'JOINT_STOCK', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'WFOE', 'JV'],
    mandatoryDocuments: ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    region: 'OCEANIA',
    taxIdType: 'ABN',
    taxIdExample: '12345678901',
    riskLevel: 'LOW',
    defaultLanguage: 'en',
    businessTypes: ['PTY_LTD', 'PUBLIC', 'SOLE_TRADER', 'PARTNERSHIP', 'TRUST'],
    mandatoryDocuments: ['ABN_CERTIFICATE', 'REGISTRATION_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    region: 'NORTH_AMERICA',
    taxIdType: 'BN',
    taxIdExample: '123456789RC0001',
    riskLevel: 'LOW',
    defaultLanguage: 'en',
    businessTypes: ['CORPORATION', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'COOPERATIVE'],
    mandatoryDocuments: ['BN_CERTIFICATE', 'INCORPORATION_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    region: 'ASIA',
    taxIdType: 'CN',
    taxIdExample: '1234567890123',
    riskLevel: 'LOW',
    defaultLanguage: 'ja',
    businessTypes: ['KK', 'GK', 'GMK', 'NK', 'SOLE_PROPRIETOR'],
    mandatoryDocuments: ['CORPORATE_REGISTRATION', 'TAX_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    region: 'ASIA',
    taxIdType: 'UEN',
    taxIdExample: '202012345A',
    riskLevel: 'LOW',
    defaultLanguage: 'en',
    businessTypes: ['PRIVATE_LTD', 'PUBLIC_LTD', 'LLP', 'SOLE_PROPRIETOR', 'PARTNERSHIP'],
    mandatoryDocuments: ['ACRA_CERTIFICATE', 'TAX_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  AE: {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    region: 'ASIA',
    taxIdType: 'TRN',
    taxIdExample: '100123456789012',
    riskLevel: 'LOW',
    defaultLanguage: 'en',
    businessTypes: ['LLC', 'FREE_ZONE', 'BRANCH', 'SOLE_ESTABLISHMENT'],
    mandatoryDocuments: ['TRADE_LICENSE', 'TRN_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brazil',
    region: 'SOUTH_AMERICA',
    taxIdType: 'CNPJ',
    taxIdExample: '12345678000195',
    riskLevel: 'MEDIUM',
    defaultLanguage: 'pt',
    businessTypes: ['LTDA', 'SA', 'EIRELI', 'MEI', 'SIMPLES'],
    mandatoryDocuments: ['CNPJ_CERTIFICATE', 'SOCIAL_CONTRACT', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  MX: {
    countryCode: 'MX',
    countryName: 'Mexico',
    region: 'NORTH_AMERICA',
    taxIdType: 'RFC',
    taxIdExample: 'ABC123456789',
    riskLevel: 'MEDIUM',
    defaultLanguage: 'es',
    businessTypes: ['SA', 'SAPI', 'SC', 'PERSONA_FISICA'],
    mandatoryDocuments: ['RFC_CERTIFICATE', 'ACTA_CONSTITUTIVA', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    region: 'EUROPE',
    taxIdType: 'VAT',
    taxIdExample: 'FR12345678901',
    riskLevel: 'LOW',
    defaultLanguage: 'fr',
    businessTypes: ['SARL', 'SAS', 'SA', 'EURL', 'AUTO_ENTREPRENEUR'],
    mandatoryDocuments: ['KBIS', 'VAT_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  },
  NL: {
    countryCode: 'NL',
    countryName: 'Netherlands',
    region: 'EUROPE',
    taxIdType: 'VAT',
    taxIdExample: 'NL123456789B01',
    riskLevel: 'LOW',
    defaultLanguage: 'nl',
    businessTypes: ['BV', 'NV', 'VOF', 'EENMANSZAAK', 'CV'],
    mandatoryDocuments: ['KVK_EXTRACT', 'VAT_CERTIFICATE', 'BANK_STATEMENT'],
    complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country');
  const region = searchParams.get('region');

  try {
    if (country) {
      // Get specific country config
      const dbConfig = await prisma.countryComplianceConfig.findUnique({
        where: { countryCode: country.toUpperCase() }
      });

      if (dbConfig) {
        return NextResponse.json(dbConfig);
      }

      // Return default config if exists
      const defaultConfig = DEFAULT_COUNTRY_CONFIGS[country.toUpperCase()];
      if (defaultConfig) {
        return NextResponse.json(defaultConfig);
      }

      // Return generic config for unknown countries
      return NextResponse.json({
        countryCode: country.toUpperCase(),
        countryName: country.toUpperCase(),
        region: 'OTHER',
        taxIdType: 'TAX_ID',
        taxIdExample: 'XXXXXXXXXX',
        riskLevel: 'MEDIUM',
        requiresManualReview: true,
        defaultLanguage: 'en',
        businessTypes: ['LLC', 'CORPORATION', 'SOLE_PROPRIETOR', 'PARTNERSHIP'],
        mandatoryDocuments: ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'BANK_STATEMENT'],
        complianceItems: ['TAX_REGISTRATION', 'BUSINESS_LICENSE', 'BANK_ACCOUNT', 'ADDRESS_PROOF']
      });
    }

    if (region) {
      // Get countries by region
      const configs = await prisma.countryComplianceConfig.findMany({
        where: { region: region.toUpperCase() }
      });

      // Add defaults for region
      const defaultsForRegion = Object.values(DEFAULT_COUNTRY_CONFIGS).filter(
        (c: any) => c.region === region.toUpperCase()
      );

      const dbCountryCodes = configs.map((c: any) => c.countryCode);
      const combinedConfigs = [
        ...configs,
        ...defaultsForRegion.filter((d: any) => !dbCountryCodes.includes(d.countryCode))
      ];

      return NextResponse.json({ countries: combinedConfigs });
    }

    // Return all available country configs
    const dbConfigs = await prisma.countryComplianceConfig.findMany({
      orderBy: { countryName: 'asc' }
    });

    const dbCountryCodes = dbConfigs.map((c: any) => c.countryCode);
    const allConfigs = [
      ...dbConfigs,
      ...Object.values(DEFAULT_COUNTRY_CONFIGS).filter(
        (d: any) => !dbCountryCodes.includes(d.countryCode)
      )
    ].sort((a: any, b: any) => a.countryName.localeCompare(b.countryName));

    return NextResponse.json({
      countries: allConfigs,
      regions: ['NORTH_AMERICA', 'SOUTH_AMERICA', 'EUROPE', 'ASIA', 'AFRICA', 'OCEANIA', 'OTHER']
    });
  } catch (error) {
    console.error('Error fetching country config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const fs = require('fs');
const path = require('path');

/**
 * ISO 3166-1 Country/Territory Registry with Subdivision Support
 * Versioned jurisdiction -> capability -> state -> approval/evidence schema
 */

const JURISDICTION_VERSION = '1.0.0';

const JURISDICTION_STATES = {
  SUPPORTED: 'SUPPORTED',
  PILOT_ONLY: 'PILOT_ONLY',
  RESTRICTED: 'RESTRICTED',
  BLOCKED: 'BLOCKED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED'
};

const DEFAULT_JURISDICTION_PROFILE = {
  countryCode: 'XX',
  name: 'Unknown Jurisdiction',
  subdivisions: {},
  capabilities: {},
  defaultState: JURISDICTION_STATES.BLOCKED,
  metadata: {
    version: JURISDICTION_VERSION,
    lastUpdated: new Date().toISOString(),
    source: 'default-deny'
  }
};

class JurisdictionRegistry {
  constructor() {
    this.profiles = new Map();
    this.capabilityIndex = new Map(); // capability -> Set of jurisdiction codes
    this.loadBuiltinProfiles();
  }

  loadBuiltinProfiles() {
    // China Mainland
    this.registerProfile({
      countryCode: 'CN',
      name: 'China Mainland',
      subdivisions: {
        'CN-HK': { name: 'Hong Kong SAR', capabilities: {} },
        'CN-MO': { name: 'Macao SAR', capabilities: {} },
        'CN-TW': { name: 'Taiwan', capabilities: {} }
      },
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.BLOCKED,
          approvalRequired: true,
          evidence: ['PBOC-2021-09-24', 'CSRC-2021-09-24'],
          metadata: { reason: 'Regulatory ban on crypto trading' }
        },
        'crypto_mining': {
          state: JURISDICTION_STATES.BLOCKED,
          approvalRequired: true,
          evidence: ['NDRC-2021-10-08'],
          metadata: { reason: 'Energy consumption restrictions' }
        },
        'digital_yuan': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: false,
          evidence: ['PBOC-DCEP-2020'],
          metadata: { reason: 'Official CBDC pilot program' }
        },
        'blockchain_services': {
          state: JURISDICTION_STATES.RESTRICTED,
          approvalRequired: true,
          evidence: ['CAC-2019-01-10', 'MIIT-2020-10'],
          metadata: { reason: 'BSN permissioned blockchain only' }
        }
      },
      defaultState: JURISDICTION_STATES.RESTRICTED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'regulatory-analysis'
      }
    });

    // Singapore
    this.registerProfile({
      countryCode: 'SG',
      name: 'Singapore',
      subdivisions: {},
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['MAS-PSA-2019', 'MAS-Guidelines-2020'],
          metadata: { reason: 'Licensed under Payment Services Act', licenseType: 'DPT' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['MAS-PSA-2019'],
          metadata: { licenseType: 'DPT' }
        },
        'defi_protocols': {
          state: JURISDICTION_STATES.REVIEW_REQUIRED,
          approvalRequired: true,
          evidence: ['MAS-Consultation-2022', 'MAS-Guidelines-2023'],
          metadata: { reason: 'Case-by-case assessment under SFA' }
        },
        'stablecoin_issuance': {
          state: JURISDICTION_STATES.PILOT_ONLY,
          approvalRequired: true,
          evidence: ['MAS-Stablecoin-Framework-2023'],
          metadata: { reason: 'MAS stablecoin regulatory framework' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'mas-regulatory-framework'
      }
    });

    // United States (Federal + State-level)
    this.registerProfile({
      countryCode: 'US',
      name: 'United States',
      subdivisions: {
        'US-NY': {
          name: 'New York',
          capabilities: {
            'crypto_trading': {
              state: JURISDICTION_STATES.RESTRICTED,
              approvalRequired: true,
              evidence: ['NYDFS-BitLicense-2015'],
              metadata: { reason: 'BitLicense required', licenseType: 'BitLicense' }
            },
            'crypto_custody': {
              state: JURISDICTION_STATES.RESTRICTED,
              approvalRequired: true,
              evidence: ['NYDFS-BitLicense-2015'],
              metadata: { licenseType: 'BitLicense' }
            }
          },
          defaultState: JURISDICTION_STATES.RESTRICTED
        },
        'US-CA': {
          name: 'California',
          capabilities: {
            'crypto_trading': {
              state: JURISDICTION_STATES.REVIEW_REQUIRED,
              approvalRequired: true,
              evidence: ['CA-DFPI-2022', 'CA-AB-39-2023'],
              metadata: { reason: 'DFPI licensing regime pending' }
            }
          },
          defaultState: JURISDICTION_STATES.REVIEW_REQUIRED
        },
        'US-WY': {
          name: 'Wyoming',
          capabilities: {
            'crypto_trading': {
              state: JURISDICTION_STATES.SUPPORTED,
              approvalRequired: true,
              evidence: ['WY-SF0125-2019', 'WY-HB0070-2020'],
              metadata: { reason: 'SPDI charter available', licenseType: 'SPDI' }
            },
            'crypto_custody': {
              state: JURISDICTION_STATES.SUPPORTED,
              approvalRequired: true,
              evidence: ['WY-SF0125-2019'],
              metadata: { licenseType: 'SPDI' }
            },
            'dao_formation': {
              state: JURISDICTION_STATES.SUPPORTED,
              approvalRequired: false,
              evidence: ['WY-SF0038-2021'],
              metadata: { reason: 'DAO LLC legislation' }
            }
          },
          defaultState: JURISDICTION_STATES.SUPPORTED
        },
        'US-TX': {
          name: 'Texas',
          capabilities: {
            'crypto_mining': {
              state: JURISDICTION_STATES.SUPPORTED,
              approvalRequired: false,
              evidence: ['TX-HB-4474-2021'],
              metadata: { reason: 'Pro-mining legislation' }
            },
            'crypto_trading': {
              state: JURISDICTION_STATES.SUPPORTED,
              approvalRequired: true,
              evidence: ['TX-Finance-Code-Ch151'],
              metadata: { reason: 'Money transmitter license may apply' }
            }
          },
          defaultState: JURISDICTION_STATES.SUPPORTED
        }
      },
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.REVIEW_REQUIRED,
          approvalRequired: true,
          evidence: ['FinCEN-2013-Guidance', 'SEC-Framework-2019', 'CFTC-Act-2022'],
          metadata: { reason: 'Federal MSB registration + state licenses', federalRegulators: ['FinCEN', 'SEC', 'CFTC'] }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.REVIEW_REQUIRED,
          approvalRequired: true,
          evidence: ['OCC-Interpretive-Letter-1170', 'OCC-Interpretive-Letter-1172'],
          metadata: { reason: 'National bank custody authority', federalRegulators: ['OCC'] }
        },
        'defi_protocols': {
          state: JURISDICTION_STATES.REVIEW_REQUIRED,
          approvalRequired: true,
          evidence: ['SEC-DeFi-Report-2022', 'CFTC-DeFi-Advisory-2023'],
          metadata: { reason: 'Evolving regulatory landscape' }
        },
        'stablecoin_issuance': {
          state: JURISDICTION_STATES.RESTRICTED,
          approvalRequired: true,
          evidence: ['PWG-Report-2021', 'OCC-Interpretive-Letter-1172'],
          metadata: { reason: 'Bank-issued stablecoins only under current guidance' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'us-federal-state-regulatory-analysis'
      }
    });

    // European Union (representative)
    this.registerProfile({
      countryCode: 'EU',
      name: 'European Union',
      subdivisions: {
        'DE': { name: 'Germany', capabilities: {} },
        'FR': { name: 'France', capabilities: {} },
        'NL': { name: 'Netherlands', capabilities: {} }
      },
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['MiCA-2023', 'AMLD5-2018', 'AMLD6-2021'],
          metadata: { reason: 'MiCA regulation effective 2024', licenseType: 'CASP' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['MiCA-2023'],
          metadata: { licenseType: 'CASP' }
        },
        'defi_protocols': {
          state: JURISDICTION_STATES.REVIEW_REQUIRED,
          approvalRequired: true,
          evidence: ['MiCA-2023-Recital-22', 'ESMA-DeFi-Report-2023'],
          metadata: { reason: 'MiCA excludes fully decentralized protocols' }
        },
        'stablecoin_issuance': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['MiCA-2023-Title-III-IV'],
          metadata: { reason: 'ART/EMT authorization required', licenseType: 'ART/EMT' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'mica-regulation'
      }
    });

    // Japan
    this.registerProfile({
      countryCode: 'JP',
      name: 'Japan',
      subdivisions: {},
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['PSA-2017', 'FSA-Guidelines-2020'],
          metadata: { reason: 'Licensed under Payment Services Act', licenseType: 'Crypto Asset Exchange' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['PSA-2017'],
          metadata: { licenseType: 'Crypto Asset Exchange' }
        },
        'stablecoin_issuance': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['PSA-Amendment-2022', 'FSA-Stablecoin-Guidelines-2023'],
          metadata: { reason: 'Stablecoin regulation effective 2023', licenseType: 'Electronic Payment Instruments' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'fsa-regulatory-framework'
      }
    });

    // United Kingdom
    this.registerProfile({
      countryCode: 'GB',
      name: 'United Kingdom',
      subdivisions: {},
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.RESTRICTED,
          approvalRequired: true,
          evidence: ['FCA-PS19-22', 'FCA-PS20-10', 'MLR-2017'],
          metadata: { reason: 'FCA registration required', licenseType: 'Cryptoasset Registration' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.RESTRICTED,
          approvalRequired: true,
          evidence: ['FCA-PS19-22'],
          metadata: { licenseType: 'Cryptoasset Registration' }
        },
        'defi_protocols': {
          state: JURISDICTION_STATES.REVIEW_REQUIRED,
          approvalRequired: true,
          evidence: ['FCA-CP23-13', 'HMT-Consultation-2023'],
          metadata: { reason: 'Future regulatory perimeter consultation' }
        }
      },
      defaultState: JURISDICTION_STATES.RESTRICTED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'fca-regulatory-framework'
      }
    });

    // Australia
    this.registerProfile({
      countryCode: 'AU',
      name: 'Australia',
      subdivisions: {},
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['AUSTRAC-2018', 'ASIC-INFO-225'],
          metadata: { reason: 'AUSTRAC registration + AFSL for derivatives', licenseType: 'DCE Registration' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['AUSTRAC-2018'],
          metadata: { licenseType: 'DCE Registration' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'austrac-asic-framework'
      }
    });

    // Canada
    this.registerProfile({
      countryCode: 'CA',
      name: 'Canada',
      subdivisions: {},
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['CSA-Notice-21-327', 'FINTRAC-2020'],
          metadata: { reason: 'CSA registration + provincial securities law', licenseType: 'Restricted Dealer' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['CSA-Notice-21-327'],
          metadata: { licenseType: 'Restricted Dealer' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'csa-fintrac-framework'
      }
    });

    // Switzerland
    this.registerProfile({
      countryCode: 'CH',
      name: 'Switzerland',
      subdivisions: {},
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['FINMA-Guidance-2019', 'DLT-Act-2021'],
          metadata: { reason: 'FINMA licensing under DLT Act', licenseType: 'FinTech/Bank License' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['FINMA-Guidance-2019'],
          metadata: { licenseType: 'FinTech/Bank License' }
        },
        'defi_protocols': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: false,
          evidence: ['FINMA-Guidance-2019', 'DLT-Act-2021'],
          metadata: { reason: 'Technology-neutral approach' }
        },
        'stablecoin_issuance': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['FINMA-Stablecoin-Guidance-2021', 'DLT-Act-2021'],
          metadata: { reason: 'Payment token classification' }
        }
      },
      defaultState: JURISDICTION_STATES.SUPPORTED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'finma-dlt-framework'
      }
    });

    // United Arab Emirates
    this.registerProfile({
      countryCode: 'AE',
      name: 'United Arab Emirates',
      subdivisions: {
        'AE-DU': { name: 'Dubai (VARA)', capabilities: {} },
        'AE-AZ': { name: 'Abu Dhabi (ADGM/FSRA)', capabilities: {} }
      },
      capabilities: {
        'crypto_trading': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['VARA-2022', 'FSRA-2018', 'SCA-2020'],
          metadata: { reason: 'VARA/FSRA/SCA licensing regimes', licenseType: 'VARA VASP / FSRA Permission' }
        },
        'crypto_custody': {
          state: JURISDICTION_STATES.SUPPORTED,
          approvalRequired: true,
          evidence: ['VARA-2022', 'FSRA-2018'],
          metadata: { licenseType: 'VARA VASP / FSRA Permission' }
        }
      },
      defaultState: JURISDICTION_STATES.REVIEW_REQUIRED,
      metadata: {
        version: JURISDICTION_VERSION,
        lastUpdated: '2024-01-15T00:00:00Z',
        source: 'vara-fsra-sca-framework'
      }
    });
  }

  registerProfile(profile) {
    const normalizedProfile = this.normalizeProfile(profile);
    this.profiles.set(normalizedProfile.countryCode.toUpperCase(), normalizedProfile);
    this.indexCapabilities(normalizedProfile);
    
    // Register subdivisions
    for (const [subCode, subProfile] of Object.entries(normalizedProfile.subdivisions || {})) {
      const fullCode = `${normalizedProfile.countryCode.toUpperCase()}-${subCode.toUpperCase()}`;
      this.profiles.set(fullCode, {
        ...DEFAULT_JURISDICTION_PROFILE,
        countryCode: fullCode,
        name: `${normalizedProfile.name} - ${subProfile.name}`,
        parentCountry: normalizedProfile.countryCode.toUpperCase(),
        capabilities: { ...normalizedProfile.capabilities, ...subProfile.capabilities },
        defaultState: subProfile.defaultState || normalizedProfile.defaultState,
        metadata: {
          ...normalizedProfile.metadata,
          subdivision: true,
          parentCountry: normalizedProfile.countryCode.toUpperCase()
        }
      });
      this.indexCapabilities(this.profiles.get(fullCode));
    }
  }

  normalizeProfile(profile) {
    return {
      ...DEFAULT_JURISDICTION_PROFILE,
      ...profile,
      countryCode: profile.countryCode.toUpperCase(),
      capabilities: this.normalizeCapabilities(profile.capabilities || {}),
      subdivisions: profile.subdivisions || {},
      defaultState: profile.defaultState || JURISDICTION_STATES.BLOCKED
    };
  }

  normalizeCapabilities(capabilities) {
    const normalized = {};
    for (const [cap, config] of Object.entries(capabilities)) {
      normalized[cap] = {
        state: config.state || JURISDICTION_STATES.BLOCKED,
        approvalRequired: config.approvalRequired !== false,
        evidence: config.evidence || [],
        metadata: config.metadata || {}
      };
    }
    return normalized;
  }

  indexCapabilities(profile) {
    for (const capability of Object.keys(profile.capabilities)) {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, new Set());
      }
      this.capabilityIndex.get(capability).add(profile.countryCode);
    }
  }

  getProfile(jurisdictionCode) {
    const code = jurisdictionCode.toUpperCase();
    return this.profiles.get(code) || this.getDefaultProfile(code);
  }

  getDefaultProfile(code) {
    return {
      ...DEFAULT_JURISDICTION_PROFILE,
      countryCode: code,
      name: `Unknown Jurisdiction (${code})`
    };
  }

  getCapabilityState(jurisdictionCode, capability) {
    const profile = this.getProfile(jurisdictionCode);
    const capConfig = profile.capabilities[capability];
    
    if (!capConfig) {
      // Fail-closed: unknown capability defaults to BLOCKED
      return {
        state: JURISDICTION_STATES.BLOCKED,
        approvalRequired: true,
        evidence: [],
        metadata: { reason: 'Unknown capability - fail closed' },
        isDefault: true
      };
    }

    return { ...capConfig, isDefault: false };
  }

  isCapabilitySupported(jurisdictionCode, capability) {
    const result = this.getCapabilityState(jurisdictionCode, capability);
    return result.state === JURISDICTION_STATES.SUPPORTED && !result.isDefault;
  }

  getCapabilityRequirements(jurisdictionCode, capability) {
    const result = this.getCapabilityState(jurisdictionCode, capability);
    return {
      capability,
      jurisdiction: jurisdictionCode,
      state: result.state,
      approvalRequired: result.approvalRequired,
      evidence: result.evidence,
      metadata: result.metadata,
      isDefaultDeny: result.isDefault || result.state === JURISDICTION_STATES.BLOCKED
    };
  }

  getAllCapabilitiesForJurisdiction(jurisdictionCode) {
    const profile = this.getProfile(jurisdictionCode);
    const capabilities = {};
    
    for (const [cap, config] of Object.entries(profile.capabilities)) {
      capabilities[cap] = {
        state: config.state,
        approvalRequired: config.approvalRequired,
        evidence: config.evidence,
        metadata: config.metadata
      };
    }
    
    return {
      jurisdiction: profile.countryCode,
      jurisdictionName: profile.name,
      defaultState: profile.defaultState,
      capabilities,
      metadata: profile.metadata
    };
  }

  getJurisdictionsForCapability(capability) {
    const jurisdictions = this.capabilityIndex.get(capability) || new Set();
    return Array.from(jurisdictions).map(code => {
      const profile = this.profiles.get(code);
      return {
        jurisdiction: code,
        name: profile.name,
        state: profile.capabilities[capability]?.state || profile.defaultState
      };
    });
  }

  getAllJurisdictions() {
    return Array.from(this.profiles.values()).map(p => ({
      countryCode: p.countryCode,
      name: p.name,
      defaultState: p.defaultState,
      capabilityCount: Object.keys(p.capabilities).length,
      isSubdivision: p.metadata?.subdivision || false,
      parentCountry: p.parentCountry
    }));
  }

  getRegistryVersion() {
    return JURISDICTION_VERSION;
  }

  getSupportedStates() {
    return Object.values(JURISDICTION_STATES);
  }
}

module.exports = {
  JurisdictionRegistry,
  JURISDICTION_STATES,
  JURISDICTION_VERSION,
  DEFAULT_JURISDICTION_PROFILE
};

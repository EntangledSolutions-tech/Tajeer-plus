#!/usr/bin/env node

/**
 * Script to update API routes with user-based filtering
 * This script will add user_id filtering to all user-specific APIs
 */

const fs = require('fs');
const path = require('path');

// APIs that need user filtering (user-specific data)
const USER_SPECIFIC_APIS = [
  'app/api/vehicles/[id]/route.ts',
  'app/api/vehicles/[id]/transfers/route.ts',
  'app/api/vehicles/[id]/maintenance/route.ts',
  'app/api/vehicles/[id]/documents/route.ts',
  'app/api/vehicles/[id]/contracts/route.ts',
  'app/api/vehicles/[id]/branch-transfer/route.ts',
  'app/api/vehicles/[id]/accidents/route.ts',
  'app/api/vehicles/[id]/accidents/[accidentId]/route.ts',
  'app/api/vehicles/[id]/total-loss/route.ts',
  'app/api/vehicles/export/route.ts',
  'app/api/customers/[id]/route.ts',
  'app/api/customers/[id]/documents/route.ts',
  'app/api/customers/[id]/contracts/route.ts',
  'app/api/customers/export/route.ts',
  'app/api/contracts/[id]/route.ts',
  'app/api/contracts/[id]/documents/route.ts',
  'app/api/contracts/temp/documents/route.ts',
  'app/api/insurance-policies/[id]/route.ts',
  'app/api/insurance-options/route.ts',
  'app/api/insurance-options/[id]/route.ts',
  'app/api/add-vehicle/route.ts'
];

// APIs that should NOT be filtered by user (shared configuration data)
const SHARED_CONFIGURATION_APIS = [
  'app/api/vehicle-configuration/makes/route.ts',
  'app/api/vehicle-configuration/statuses/route.ts',
  'app/api/vehicle-configuration/owners/route.ts',
  'app/api/vehicle-configuration/models/route.ts',
  'app/api/vehicle-configuration/features/route.ts',
  'app/api/vehicle-configuration/colors/route.ts',
  'app/api/vehicle-configuration/actual-users/route.ts',
  'app/api/customer-configurations/professions/route.ts',
  'app/api/customer-configurations/professions/[id]/route.ts',
  'app/api/customer-configurations/nationalities/route.ts',
  'app/api/customer-configurations/nationalities/[id]/route.ts',
  'app/api/customer-configurations/license-types/route.ts',
  'app/api/customer-configurations/license-types/[id]/route.ts',
  'app/api/customer-configurations/classifications/route.ts',
  'app/api/customer-configurations/classifications/[id]/route.ts',
  'app/api/customer-configuration/statuses/route.ts',
  'app/api/contract-configuration/statuses/route.ts',
  'app/api/branches/route.ts',
  'app/api/branches/[id]/route.ts',
  'app/api/profile/route.ts',
  'app/api/account-data/route.ts',
  'app/api/upload-avatar/route.ts'
];

// Helper function to add user filtering to a file
function addUserFilteringToFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if file already has user filtering
    if (content.includes('getAuthenticatedUser') || content.includes('.eq(\'user_id\', user.id)')) {
      console.log(`✅ Already has user filtering: ${filePath}`);
      return;
    }

    // Add import for helper functions
    if (!content.includes('from \'../../../lib/api-helpers\'')) {
      content = content.replace(
        /import { NextRequest, NextResponse } from 'next\/server';\nimport { getSupabaseServerClient } from '@kit\/supabase\/server-client';/,
        `import { NextRequest, NextResponse } from 'next/server';\nimport { getSupabaseServerClient } from '@kit/supabase/server-client';\nimport { getAuthenticatedUser, addUserIdToData, updateUserRecord, getUserData, buildPaginationResponse, getPaginationParams } from '../../../lib/api-helpers';`
      );
    }

    // Replace authentication patterns
    const authPatterns = [
      // Pattern 1: Standard auth check
      /const supabase = getSupabaseServerClient\(\);\s*\n\s*\/\/ Check if user is authenticated\s*\n\s*const { data: { user }, error: authError } = await supabase\.auth\.getUser\(\);\s*\n\s*if \(authError \|\| !user\) \{\s*\n\s*return NextResponse\.json\(\s*\{ error: 'Unauthorized' \},\s*\{ status: 401 \}\s*\);\s*\n\s*\}/g,

      // Pattern 2: Session-based auth
      /const supabase = getSupabaseServerClient\(\);\s*\n\s*\/\/ Check authentication\s*\n\s*const { data: { session }, error: sessionError } = await supabase\.auth\.getSession\(\);\s*\n\s*if \(sessionError \|\| !session\) \{\s*\n\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*\}/g
    ];

    let updated = false;
    authPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, 'const { user, supabase } = await getAuthenticatedUser(request);');
        updated = true;
      }
    });

    // Add user filtering to queries
    const queryPatterns = [
      // Pattern for .from('table_name').select()
      /\.from\('([^']+)'\)\s*\.select\(/g,
      // Pattern for .from('table_name').insert()
      /\.from\('([^']+)'\)\s*\.insert\(/g,
      // Pattern for .from('table_name').update()
      /\.from\('([^']+)'\)\s*\.update\(/g,
      // Pattern for .from('table_name').delete()
      /\.from\('([^']+)'\)\s*\.delete\(/g
    ];

    queryPatterns.forEach(pattern => {
      content = content.replace(pattern, (match, tableName) => {
        // Only add user filtering for user-specific tables
        const userSpecificTables = ['vehicles', 'customers', 'contracts', 'insurance_policies', 'simple_insurance_options', 'vehicle_transfers', 'vehicle_maintenance', 'contract_documents'];

        if (userSpecificTables.includes(tableName)) {
          if (match.includes('.insert(')) {
            // For insert operations, we'll handle this differently
            return match;
          } else if (match.includes('.select(')) {
            return match + `\n      .eq('user_id', user.id) // Filter by user`;
          } else if (match.includes('.update(')) {
            return match + `\n      .eq('user_id', user.id) // Filter by user`;
          } else if (match.includes('.delete(')) {
            return match + `\n      .eq('user_id', user.id) // Filter by user`;
          }
        }
        return match;
      });
    });

    // Handle insert operations by adding user_id to data
    content = content.replace(
      /\.insert\(\{([^}]+)\}\)/g,
      (match, dataContent) => {
        // Check if this is a user-specific table insert
        const lines = content.split('\n');
        const insertLineIndex = lines.findIndex(line => line.includes(match));
        const fromLine = lines.slice(0, insertLineIndex).reverse().find(line => line.includes('.from('));

        if (fromLine) {
          const tableMatch = fromLine.match(/\.from\('([^']+)'\)/);
          if (tableMatch) {
            const tableName = tableMatch[1];
            const userSpecificTables = ['vehicles', 'customers', 'contracts', 'insurance_policies', 'simple_insurance_options', 'vehicle_transfers', 'vehicle_maintenance', 'contract_documents'];

            if (userSpecificTables.includes(tableName)) {
              return `.insert({\n        ...data,\n        user_id: user.id\n      })`;
            }
          }
        }
        return match;
      }
    );

    if (updated) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⚠️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Starting API user filtering update...\n');

console.log('📋 User-specific APIs to update:');
USER_SPECIFIC_APIS.forEach(api => {
  console.log(`  - ${api}`);
});

console.log('\n📋 Shared configuration APIs (will be skipped):');
SHARED_CONFIGURATION_APIS.forEach(api => {
  console.log(`  - ${api}`);
});

console.log('\n🚀 Processing files...\n');

USER_SPECIFIC_APIS.forEach(addUserFilteringToFile);

console.log('\n✅ User filtering update completed!');
console.log('\n📝 Next steps:');
console.log('1. Review the updated files');
console.log('2. Test the APIs to ensure they work correctly');
console.log('3. Make sure all database tables have user_id columns');
console.log('4. Update any frontend code that might be affected');

// Nhost Database Initialization Script
// Run: NHOST_ADMIN_SECRET=your_secret node scripts/init-db.js

const SUBDOMAIN = process.env.NHOST_SUBDOMAIN || 'wgwxhiacglizdxosamcj';
const REGION = process.env.NHOST_REGION || 'ap-southeast-1';
const ADMIN_SECRET = process.env.NHOST_ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error('Error: NHOST_ADMIN_SECRET environment variable is required');
  console.log('Usage: NHOST_ADMIN_SECRET=your_secret node scripts/init-db.js');
  process.exit(1);
}

// Hasura Endpoints
const HASURA_GRAPHQL_URL = `https://${SUBDOMAIN}.hasura.${REGION}.nhost.run/v1/graphql`;
const HASURA_QUERY_URL = `https://${SUBDOMAIN}.hasura.${REGION}.nhost.run/v2/query`;
const HASURA_METADATA_URL = `https://${SUBDOMAIN}.hasura.${REGION}.nhost.run/v1/metadata`;

const headers = {
  'Content-Type': 'application/json',
  'x-hasura-admin-secret': ADMIN_SECRET
};

// SQL for creating tables
const createTablesSQL = `
-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table for card news projects
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  headline text,
  image_urls jsonb,
  project_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
`;

const createTriggerSQL = `
-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.display_name)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

async function runSQL(sql, description) {
  console.log(`\n${description}...`);

  const res = await fetch(HASURA_QUERY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: "run_sql",
      args: {
        source: "default",
        sql: sql
      }
    })
  });

  const data = await res.json();

  if (data.error || data.code) {
    console.log(`⚠️  ${data.error || data.internal?.error?.message || JSON.stringify(data)}`);
    return false;
  }

  console.log(`✅ ${description}: Success`);
  return true;
}

async function trackTable(tableName) {
  console.log(`\nTracking table: ${tableName}...`);

  const res = await fetch(HASURA_METADATA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: "pg_track_table",
      args: {
        source: "default",
        table: {
          schema: "public",
          name: tableName
        }
      }
    })
  });

  const data = await res.json();

  if (data.error || data.code) {
    if (data.code === 'already-tracked') {
      console.log(`ℹ️  Table ${tableName} already tracked`);
      return true;
    }
    console.log(`⚠️  ${data.error || data.code}`);
    return false;
  }

  console.log(`✅ Table ${tableName} tracked`);
  return true;
}

async function createSelectPermission(tableName, filter = {}) {
  console.log(`\nCreating SELECT permission for ${tableName}...`);

  const res = await fetch(HASURA_METADATA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: "pg_create_select_permission",
      args: {
        source: "default",
        table: {
          schema: "public",
          name: tableName
        },
        role: "user",
        permission: {
          columns: "*",
          filter: filter,
          allow_aggregations: true
        }
      }
    })
  });

  const data = await res.json();

  if (data.error || data.code) {
    if (data.code === 'already-exists') {
      console.log(`ℹ️  SELECT permission already exists`);
      return true;
    }
    console.log(`⚠️  ${data.error || data.code}`);
    return false;
  }

  console.log(`✅ SELECT permission created`);
  return true;
}

async function createInsertPermission(tableName, columns, check, set = {}) {
  console.log(`\nCreating INSERT permission for ${tableName}...`);

  const res = await fetch(HASURA_METADATA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: "pg_create_insert_permission",
      args: {
        source: "default",
        table: {
          schema: "public",
          name: tableName
        },
        role: "user",
        permission: {
          columns: columns,
          check: check,
          set: set
        }
      }
    })
  });

  const data = await res.json();

  if (data.error || data.code) {
    if (data.code === 'already-exists') {
      console.log(`ℹ️  INSERT permission already exists`);
      return true;
    }
    console.log(`⚠️  ${data.error || data.code}`);
    return false;
  }

  console.log(`✅ INSERT permission created`);
  return true;
}

async function createUpdatePermission(tableName, columns, filter) {
  console.log(`\nCreating UPDATE permission for ${tableName}...`);

  const res = await fetch(HASURA_METADATA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: "pg_create_update_permission",
      args: {
        source: "default",
        table: {
          schema: "public",
          name: tableName
        },
        role: "user",
        permission: {
          columns: columns,
          filter: filter,
          check: null
        }
      }
    })
  });

  const data = await res.json();

  if (data.error || data.code) {
    if (data.code === 'already-exists') {
      console.log(`ℹ️  UPDATE permission already exists`);
      return true;
    }
    console.log(`⚠️  ${data.error || data.code}`);
    return false;
  }

  console.log(`✅ UPDATE permission created`);
  return true;
}

async function createDeletePermission(tableName, filter) {
  console.log(`\nCreating DELETE permission for ${tableName}...`);

  const res = await fetch(HASURA_METADATA_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: "pg_create_delete_permission",
      args: {
        source: "default",
        table: {
          schema: "public",
          name: tableName
        },
        role: "user",
        permission: {
          filter: filter
        }
      }
    })
  });

  const data = await res.json();

  if (data.error || data.code) {
    if (data.code === 'already-exists') {
      console.log(`ℹ️  DELETE permission already exists`);
      return true;
    }
    console.log(`⚠️  ${data.error || data.code}`);
    return false;
  }

  console.log(`✅ DELETE permission created`);
  return true;
}

async function run() {
  console.log('🚀 Initializing Nhost Database...\n');
  console.log(`Subdomain: ${SUBDOMAIN}`);
  console.log(`Region: ${REGION}`);

  // 1. Create tables
  await runSQL(createTablesSQL, "Creating tables");

  // 2. Create trigger for auto profile creation
  await runSQL(createTriggerSQL, "Creating trigger for auto profile creation");

  // 3. Track tables in Hasura
  await trackTable("profiles");
  await trackTable("posts");

  // 4. Profiles permissions
  // Anyone can SELECT profiles
  await createSelectPermission("profiles", {});
  // Users can INSERT their own profile
  await createInsertPermission("profiles",
    ["id", "display_name", "avatar_url"],
    { "id": { "_eq": "X-Hasura-User-Id" } }
  );
  // Users can UPDATE their own profile
  await createUpdatePermission("profiles",
    ["display_name", "avatar_url", "updated_at"],
    { "id": { "_eq": "X-Hasura-User-Id" } }
  );

  // 5. Posts permissions
  // Users can SELECT their own posts
  await createSelectPermission("posts", { "user_id": { "_eq": "X-Hasura-User-Id" } });
  // Users can INSERT posts (user_id auto-set)
  await createInsertPermission("posts",
    ["headline", "image_urls", "project_data"],
    { "user_id": { "_eq": "X-Hasura-User-Id" } },
    { "user_id": "X-Hasura-User-Id" }
  );
  // Users can UPDATE their own posts
  await createUpdatePermission("posts",
    ["headline", "image_urls", "project_data", "updated_at"],
    { "user_id": { "_eq": "X-Hasura-User-Id" } }
  );
  // Users can DELETE their own posts
  await createDeletePermission("posts", { "user_id": { "_eq": "X-Hasura-User-Id" } });

  console.log('\n✨ Database initialization complete!');
  console.log('\nCreated tables:');
  console.log('  - profiles (linked to auth.users)');
  console.log('  - posts (for card news projects)');
  console.log('\nFeatures:');
  console.log('  - Auto profile creation on signup');
  console.log('  - Hasura permissions configured for "user" role');
}

run().catch(console.error);

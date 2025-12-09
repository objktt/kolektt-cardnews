// Server-side Nhost client for API routes
// This avoids using @nhost/nextjs which requires React context

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const NHOST_SUBDOMAIN = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || '';
const NHOST_REGION = process.env.NEXT_PUBLIC_NHOST_REGION || '';
const NHOST_ADMIN_SECRET = process.env.NHOST_ADMIN_SECRET || '';

const GRAPHQL_URL = `https://${NHOST_SUBDOMAIN}.hasura.${NHOST_REGION}.nhost.run/v1/graphql`;

export const nhostServer = {
  graphql: {
    async request<T = unknown>(
      query: string,
      variables?: Record<string, unknown>
    ): Promise<GraphQLResponse<T>> {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': NHOST_ADMIN_SECRET,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result as GraphQLResponse<T>;
    },
  },
};

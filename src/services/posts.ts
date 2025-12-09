import { NhostClient } from '@nhost/nextjs';
import { ProjectData } from '@/types';

export interface Post {
  id?: string;
  user_id?: string;
  title: string;
  status: 'draft' | 'generated' | 'published';
  scheduled_date?: string;
  project_data: ProjectData;
  generated_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export class PostsService {
  private nhost: NhostClient;

  constructor(nhost: NhostClient) {
    this.nhost = nhost;
  }

  async saveDraft(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
    const { data, error } = await this.nhost.graphql.request(`
      mutation InsertPost($object: posts_insert_input!) {
        insert_posts_one(object: $object) {
          id
        }
      }
    `, {
      object: {
        title: post.title,
        status: post.status,
        project_data: post.project_data,
        generated_images: post.generated_images || [],
      }
    });

    if (error) {
      console.error('Error saving draft:', JSON.stringify(error, null, 2));
      return null;
    }

    return data?.insert_posts_one;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<boolean> {
    const { error } = await this.nhost.graphql.request(`
      mutation UpdatePost($id: uuid!, $updates: posts_set_input!) {
        update_posts_by_pk(pk_columns: { id: $id }, _set: $updates) {
          id
        }
      }
    `, {
      id,
      updates: {
        ...updates,
        updated_at: new Date().toISOString(),
      }
    });

    if (error) {
      console.error('Error updating post:', JSON.stringify(error, null, 2));
      return false;
    }

    return true;
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    const { data, error } = await this.nhost.graphql.request(`
      query GetUserPosts($userId: uuid!) {
        posts(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
          id
          user_id
          title
          status
          project_data
          generated_images
          created_at
          updated_at
        }
      }
    `, { userId });

    if (error) {
      console.error('Error fetching posts:', JSON.stringify(error, null, 2));
      return [];
    }

    return data?.posts || [];
  }

  async getPostsByDate(_userId: string, _date: string): Promise<Post[]> {
    // Note: scheduled_date column needs to be added via migration
    // For now, return empty array until migration is applied
    console.warn('getPostsByDate: scheduled_date column not yet available');
    return [];
  }

  async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await this.nhost.graphql.request(`
      query GetPostById($id: uuid!) {
        posts_by_pk(id: $id) {
          id
          user_id
          title
          status
          project_data
          generated_images
          created_at
          updated_at
        }
      }
    `, { id });

    if (error) {
      console.error('Error fetching post:', JSON.stringify(error, null, 2));
      return null;
    }

    return data?.posts_by_pk || null;
  }

  async deletePost(id: string): Promise<boolean> {
    const { error } = await this.nhost.graphql.request(`
      mutation DeletePost($id: uuid!) {
        delete_posts_by_pk(id: $id) {
          id
        }
      }
    `, { id });

    if (error) {
      console.error('Error deleting post:', JSON.stringify(error, null, 2));
      return false;
    }

    return true;
  }
}

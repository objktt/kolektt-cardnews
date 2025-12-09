'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus, useUserData, useNhostClient } from '@nhost/nextjs';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { PostsService, Post } from '@/services/posts';
import { format } from 'date-fns';
import { FileText, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function DraftsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const nhost = useNhostClient();
  const toast = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch user's posts
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const postsService = new PostsService(nhost);
      postsService.getPostsByUser(user.id).then((data) => {
        setPosts(data);
        setIsLoadingPosts(false);
      });
    }
  }, [isAuthenticated, user?.id, nhost]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleEdit = (postId: string) => {
    router.push(`/editor?draft=${postId}`);
  };

  const handleDeleteClick = (postId: string) => {
    setConfirmDeleteId(postId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;

    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      const postsService = new PostsService(nhost);
      const success = await postsService.deletePost(confirmDeleteId);
      if (success) {
        setPosts(posts.filter(p => p.id !== confirmDeleteId));
        toast.success('Draft Deleted', 'The draft has been permanently removed.');
      } else {
        toast.error('Delete Failed', 'Failed to delete the draft. Please try again.');
      }
    } catch (e) {
      console.error('Error deleting draft:', e);
      toast.error('Delete Error', String(e));
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: Post['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Draft</span>;
      case 'generated':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Generated</span>;
      case 'published':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Published</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 overflow-hidden text-neutral-100 font-sans">
      <Header user={user} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 pl-16 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="text-indigo-500" />
                My Drafts
              </h1>
              <p className="text-neutral-500 mt-1">Manage your saved drafts and generated posts</p>
            </div>

            {/* Posts List */}
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-neutral-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No drafts yet</p>
                <p className="text-sm mt-1">Start creating content in the editor</p>
                <button
                  onClick={() => router.push('/editor')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm transition-colors"
                >
                  Go to Editor
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 rounded-lg bg-neutral-800 flex-shrink-0 overflow-hidden">
                        {post.generated_images && post.generated_images.length > 0 ? (
                          <img
                            src={post.generated_images[0]}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={24} className="text-neutral-600" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg truncate">{post.title || 'Untitled'}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(post.status)}
                              <span className="text-xs text-neutral-500">
                                {post.created_at && format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => post.id && handleEdit(post.id)}
                              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => post.id && handleDeleteClick(post.id)}
                              disabled={deletingId === post.id}
                              className="p-2 hover:bg-red-500/20 rounded-lg text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deletingId === post.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Slides count */}
                        <div className="mt-3 text-sm text-neutral-500">
                          {post.project_data?.slides?.length || 0} slide{(post.project_data?.slides?.length || 0) !== 1 ? 's' : ''}
                          {post.generated_images && post.generated_images.length > 0 && (
                            <span className="ml-2">· {post.generated_images.length} image{post.generated_images.length !== 1 ? 's' : ''} generated</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Draft?</h3>
            <p className="text-neutral-400 text-sm mb-6">
              This action cannot be undone. The draft and any generated images will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

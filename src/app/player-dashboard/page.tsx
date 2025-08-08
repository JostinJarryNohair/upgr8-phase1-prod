"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Plus, User, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import Image from "next/image";

type PlayerPost = Database['public']['Tables']['player_posts']['Row'] & {
  author: Database['public']['Tables']['player_users']['Row'];
  liked_by_current_user?: boolean;
};

type PlayerComment = Database['public']['Tables']['player_comments']['Row'] & {
  author: Database['public']['Tables']['player_users']['Row'];
};

export default function PlayerDashboard() {
  const [posts, setPosts] = useState<PlayerPost[]>([]);
  const [comments, setComments] = useState<PlayerComment[]>([]);
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState<string>("");
  const [showComments, setShowComments] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Database['public']['Tables']['player_users']['Row'] | null>(null);
  const [isPostingPost, setIsPostingPost] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user and posts on load
  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      const { data: playerData, error } = await supabase
        .from('player_users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching current user:', error);
        return;
      }

      setCurrentUser(playerData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Get current user to check likes
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch posts with author info
      const { data: postsData, error: postsError } = await supabase
        .from('player_posts')
        .select(`
          *,
          author:player_users(*)
        `)
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        return;
      }

      // Check which posts are liked by current user
      if (user && postsData) {
        const { data: likesData } = await supabase
          .from('player_likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(likesData?.map(like => like.post_id) || []);
        
        const postsWithLikes = postsData.map(post => ({
          ...post,
          liked_by_current_user: likedPostIds.has(post.id)
        }));
        
        setPosts(postsWithLikes as PlayerPost[]);
      } else {
        setPosts(postsData as PlayerPost[]);
      }

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('player_comments')
        .select(`
          *,
          author:player_users(*)
        `)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      } else {
        setComments(commentsData as PlayerComment[]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.liked_by_current_user;

    try {
      if (wasLiked) {
        // Unlike: remove from player_likes
        await supabase
          .from('player_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        // Update like count
        await supabase
          .from('player_posts')
          .update({ like_count: (post.like_count || 0) - 1 })
          .eq('id', postId);
      } else {
        // Like: add to player_likes
        await supabase
          .from('player_likes')
          .insert({ post_id: postId, user_id: currentUser.id });

        // Update like count
        await supabase
          .from('player_posts')
          .update({ like_count: (post.like_count || 0) + 1 })
          .eq('id', postId);
      }

      // Update local state
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              liked_by_current_user: !wasLiked,
              like_count: wasLiked ? (p.like_count || 0) - 1 : (p.like_count || 0) + 1
            }
          : p
      ));
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const uploadImageToStorage = async (file: File, userId: string): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('player-post')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message?.includes('Bucket not found')) {
          alert('Storage bucket not configured. Please contact administrator.');
        } else {
          alert('Erreur lors du téléchargement de l\'image: ' + uploadError.message);
        }
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('player-post')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image doit faire moins de 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !currentUser || isPostingPost) return;
    
    try {
      setIsPostingPost(true);
      
      // Upload image if selected
      let imageUrl: string | null = null;
      if (selectedImage) {
        imageUrl = await uploadImageToStorage(selectedImage, currentUser.id);
        if (!imageUrl) {
          alert('Erreur lors du téléchargement de l\'image');
          return;
        }
      }
      
      const { data, error } = await supabase
        .from('player_posts')
        .insert({
          author_id: currentUser.id,
          content: newPost.trim(),
          image_url: imageUrl,
          like_count: 0,
          comment_count: 0
        })
        .select(`
          *,
          author:player_users(*)
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return;
      }

      // Add new post to the top of the list
      const newPostWithAuthor = {
        ...data,
        liked_by_current_user: false
      } as PlayerPost;
      
      setPosts([newPostWithAuthor, ...posts]);
      setNewPost("");
      removeImage();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsPostingPost(false);
    }
  };

  const handleComment = async (postId: string) => {
    if (!newComment.trim() || !currentUser || isPostingComment) return;
    
    try {
      setIsPostingComment(true);
      
      const { data, error } = await supabase
        .from('player_comments')
        .insert({
          post_id: postId,
          author_id: currentUser.id,
          content: newComment.trim()
        })
        .select(`
          *,
          author:player_users(*)
        `)
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        return;
      }

      // Update comment count
      await supabase
        .from('player_posts')
        .update({ 
          comment_count: ((posts.find(p => p.id === postId)?.comment_count || 0) + 1)
        })
        .eq('id', postId);

      // Add new comment to local state
      setComments([...comments, data as PlayerComment]);
      
      // Update post comment count locally
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comment_count: (post.comment_count || 0) + 1 }
          : post
      ));
      
      setNewComment("");
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  // Generate initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "À l'instant";
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}j`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid gap-6">
        {/* Post Creator */}
        <Card className="p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              {currentUser?.profile_picture ? (
                <AvatarImage src={currentUser.profile_picture} alt="Profile" />
              ) : (
                <AvatarFallback className="bg-red-100 text-red-700 text-xs font-medium">
                  {currentUser ? getInitials(currentUser.first_name, currentUser.last_name) : <User className="w-5 h-5" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Partagez vos nouvelles hockey..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none border-none p-0 focus-visible:ring-0"
              />
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3 relative">
                  <div className="relative w-full max-w-sm">
                    <Image
                      src={imagePreview}
                      alt="Aperçu"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPostingPost || isUploadingImage}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Photo
                  </Button>
                  <div className="text-xs text-gray-500">
                    Partagez vos succès hockey!
                  </div>
                </div>
                <Button 
                  onClick={handlePost}
                  disabled={!newPost.trim() || isPostingPost || isUploadingImage}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {isPostingPost ? "Publication..." : isUploadingImage ? "Upload..." : "Publier"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                {post.author?.profile_picture ? (
                  <AvatarImage src={post.author.profile_picture} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-red-100 text-red-700 text-xs font-medium">
                    {post.author ? getInitials(post.author.first_name, post.author.last_name) : <User className="w-5 h-5" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {post.author?.first_name} {post.author?.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(post.created_at)}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-900 leading-relaxed">{post.content}</p>
              
              {/* Post Image */}
              {post.image_url && (
                <div className="mt-3">
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={post.image_url}
                      alt="Post image"
                      width={500}
                      height={300}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-6 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`gap-2 ${post.liked_by_current_user ? 'text-red-600' : 'text-gray-600'}`}
              >
                <Heart className={`w-4 h-4 ${post.liked_by_current_user ? 'fill-current' : ''}`} />
                {post.like_count}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                className="gap-2 text-gray-600"
              >
                <MessageCircle className="w-4 h-4" />
                {post.comment_count}
              </Button>
            </div>

            {/* Comments Section */}
            {showComments === post.id && (
              <div className="mt-4 pt-4 border-t bg-gray-50 -mx-4 -mb-4 p-4 rounded-b-lg">
                {comments
                  .filter(comment => comment.post_id === post.id)
                  .map(comment => (
                    <div key={comment.id} className="flex gap-3 mb-3 last:mb-0">
                      <Avatar className="w-8 h-8">
                        {comment.author?.profile_picture ? (
                          <AvatarImage src={comment.author.profile_picture} alt="Profile" />
                        ) : (
                          <AvatarFallback className="bg-red-100 text-red-700 text-xs font-medium">
                            {comment.author ? getInitials(comment.author.first_name, comment.author.last_name) : <User className="w-4 h-4" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="bg-white rounded-lg px-3 py-2 flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {comment.author?.first_name} {comment.author?.last_name}
                        </div>
                        <div className="text-sm text-gray-700">{comment.content}</div>
                      </div>
                    </div>
                  ))}
                
                {/* Add Comment */}
                <div className="flex gap-3 mt-3 pt-3 border-t">
                  <Avatar className="w-8 h-8">
                    {currentUser?.profile_picture ? (
                      <AvatarImage src={currentUser.profile_picture} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-red-100 text-red-700 text-xs font-medium">
                        {currentUser ? getInitials(currentUser.first_name, currentUser.last_name) : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input 
                      placeholder="Écrivez un commentaire..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="h-9"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(post.id);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleComment(post.id)}
                      disabled={!newComment.trim() || isPostingComment}
                      className="bg-red-600 hover:bg-red-700 h-9"
                    >
                      {isPostingComment ? "..." : "Publier"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Plus, 
  Calendar, 
  User, 
  ThumbsUp, 
  Reply,
  Search,
  Filter,
  Pin,
  Eye,
  Clock,
  Award,
  BookOpen,
  Lightbulb,
  HelpCircle,
  TrendingUp,
  Users
} from 'lucide-react'

interface ForumPost {
  id: string
  title: string
  content: string
  author: {
    address: string
    name: string
    avatar?: string
    reputation: number
    verified: boolean
  }
  category: string
  createdAt: Date
  updatedAt: Date
  likes: number
  replies: number
  views: number
  isPinned?: boolean
  tags: string[]
}

interface ForumReply {
  id: string
  postId: string
  content: string
  author: {
    address: string
    name: string
    avatar?: string
    reputation: number
  }
  createdAt: Date
  likes: number
}

interface Category {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  postCount: number
  color: string
}

const categories: Category[] = [
  {
    id: 'farming-techniques',
    name: 'Farming Techniques',
    description: 'Best practices for growing spices',
    icon: <BookOpen className="h-5 w-5" />,
    postCount: 45,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'market-insights',
    name: 'Market Insights',
    description: 'Pricing trends and market analysis',
    icon: <TrendingUp className="h-5 w-5" />,
    postCount: 32,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'quality-standards',
    name: 'Quality Standards',
    description: 'Grading, certification, and quality tips',
    icon: <Award className="h-5 w-5" />,
    postCount: 28,
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'general-discussion',
    name: 'General Discussion',
    description: 'Community discussions and announcements',
    icon: <Users className="h-5 w-5" />,
    postCount: 67,
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  {
    id: 'questions',
    name: 'Questions & Help',
    description: 'Get help from experienced farmers',
    icon: <HelpCircle className="h-5 w-5" />,
    postCount: 89,
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'innovation',
    name: 'Innovation & Ideas',
    description: 'New techniques and creative solutions',
    icon: <Lightbulb className="h-5 w-5" />,
    postCount: 21,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
]

interface CommunityHubProps {
  userAddress?: string
  userName?: string
  isLoggedIn: boolean
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  userAddress,
  userName,
  isLoggedIn
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'replies'>('newest')

  // Generate mock forum posts
  const generateMockPosts = (): ForumPost[] => {
    const mockPosts: ForumPost[] = [
      {
        id: '1',
        title: 'Best practices for Ceylon Cinnamon drying',
        content: 'I\'ve been experimenting with different drying techniques for Ceylon Cinnamon and wanted to share my findings...',
        author: {
          address: '0x1234567890123456789012345678901234567890',
          name: 'Farmer Priya',
          reputation: 485,
          verified: true
        },
        category: 'farming-techniques',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 23,
        replies: 8,
        views: 156,
        isPinned: true,
        tags: ['cinnamon', 'drying', 'quality']
      },
      {
        id: '2',
        title: 'Market prices for cardamom - what to expect this season?',
        content: 'Has anyone noticed the cardamom prices trending upward? I\'m trying to decide when to sell my harvest...',
        author: {
          address: '0x2345678901234567890123456789012345678901',
          name: 'Ravi Kumar',
          reputation: 312,
          verified: true
        },
        category: 'market-insights',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        likes: 15,
        replies: 12,
        views: 89,
        tags: ['cardamom', 'pricing', 'market']
      },
      {
        id: '3',
        title: 'How do you achieve Grade AA quality consistently?',
        content: 'I\'ve been getting mostly Grade A, but struggling to reach Grade AA consistently. Any tips from experienced farmers?',
        author: {
          address: '0x3456789012345678901234567890123456789012',
          name: 'New Farmer',
          reputation: 45,
          verified: false
        },
        category: 'quality-standards',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 31,
        replies: 18,
        views: 203,
        tags: ['quality', 'grading', 'tips']
      },
      {
        id: '4',
        title: 'Welcome to the Spiced Community!',
        content: 'This is our space to share knowledge, ask questions, and support each other in our journey as spice farmers...',
        author: {
          address: '0x0000000000000000000000000000000000000000',
          name: 'Spiced Team',
          reputation: 1000,
          verified: true
        },
        category: 'general-discussion',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        likes: 89,
        replies: 34,
        views: 445,
        isPinned: true,
        tags: ['welcome', 'community', 'announcement']
      },
      {
        id: '5',
        title: 'Organic certification - is it worth the investment?',
        content: 'I\'m considering getting organic certification for my farm. Has anyone gone through this process? What are the real benefits?',
        author: {
          address: '0x4567890123456789012345678901234567890123',
          name: 'Sustainable Spices',
          reputation: 267,
          verified: true
        },
        category: 'questions',
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 19,
        replies: 11,
        views: 134,
        tags: ['organic', 'certification', 'investment']
      }
    ]

    return mockPosts
  }

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setPosts(generateMockPosts())
      setLoading(false)
    }

    loadPosts()
  }, [])

  const filteredAndSortedPosts = posts
    .filter(post => {
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      // Pinned posts always on top
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      
      switch (sortBy) {
        case 'popular':
          return (b.likes + b.replies) - (a.likes + a.replies)
        case 'replies':
          return b.replies - a.replies
        case 'newest':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else {
      return 'Less than an hour ago'
    }
  }

  const getCategoryById = (id: string) => categories.find(cat => cat.id === id)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Knowledge Hub</h1>
              <p className="text-gray-600">Share knowledge, ask questions, and connect with fellow farmers</p>
            </div>
          </div>
          
          {isLoggedIn && (
            <button
              onClick={() => setShowNewPostModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Post
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search posts, topics, or tags..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="replies">Most Replies</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-orange-100 text-orange-900 border border-orange-200' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">All Posts</span>
                  <span className="text-sm text-gray-500">
                    {posts.length}
                  </span>
                </div>
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === category.id 
                      ? category.color + ' border'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {category.icon}
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {category.postCount} posts
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-3">
          {!isLoggedIn && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Join the Conversation</h4>
                  <p className="text-sm text-blue-700">Connect your wallet to create posts and join discussions.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredAndSortedPosts.map(post => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {post.isPinned && (
                      <Pin className="h-4 w-4 text-orange-600" />
                    )}
                    
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryById(post.category)?.color}`}>
                      {getCategoryById(post.category)?.name}
                    </div>
                    
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {formatTimeAgo(post.updatedAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-orange-600 cursor-pointer">
                  {post.title}
                </h3>
                
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                          {post.author.verified && (
                            <Award className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {post.author.reputation} reputation
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Reply className="h-4 w-4" />
                      <span>{post.replies}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAndSortedPosts.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Try adjusting your search terms or browse different categories.' 
                    : 'Be the first to start a discussion in this category!'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Post Modal - Placeholder for now */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="What would you like to discuss?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Share your thoughts, ask a question, or provide helpful information..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowNewPostModal(false)}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityHub
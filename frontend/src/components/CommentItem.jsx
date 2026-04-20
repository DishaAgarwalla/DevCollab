import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { updateComment, deleteComment } from '../api/comments';
import toast from 'react-hot-toast';

export default function CommentItem({ comment, currentUser, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = currentUser && comment.userId === currentUser._id;

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    
    try {
      const updated = await updateComment(comment._id, { content: editedContent });
      onUpdate(updated);
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    setIsDeleting(true);
    try {
      await deleteComment(comment._id);
      onDelete(comment._id);
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  // Highlight @mentions
  const renderContent = (content) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <span key={index} className="text-blue-600 font-medium">@{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-sm text-gray-800">{comment.userName}</span>
          <span className="text-xs text-gray-400 ml-2">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            {comment.edited && <span className="ml-1 text-gray-400">(edited)</span>}
          </span>
        </div>
        {isAuthor && !isEditing && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-500 transition"
              title="Edit comment"
            >
              <FiEdit2 size={12} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
              title="Delete comment"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
            rows="2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 flex items-center gap-1"
            >
              <FiCheck size={12} />
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 flex items-center gap-1"
            >
              <FiX size={12} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
          {renderContent(comment.content)}
        </p>
      )}
    </div>
  );
}
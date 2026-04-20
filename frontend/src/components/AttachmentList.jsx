import { useState, useEffect } from 'react';
import { FiDownload, FiTrash2, FiFile, FiImage, FiFileText, FiArchive, FiX } from 'react-icons/fi';
import { getAttachments, deleteAttachment, downloadAttachment } from '../api/attachments';
import toast from 'react-hot-toast';

export default function AttachmentList({ taskId, currentUser, projectMembers }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const data = await getAttachments(taskId);
      setAttachments(data);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachmentId, fileName) => {
    try {
      await downloadAttachment(attachmentId);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    
    setDeleting(attachmentId);
    try {
      await deleteAttachment(attachmentId);
      setAttachments(attachments.filter(a => a._id !== attachmentId));
      toast.success('Attachment deleted');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete attachment');
    } finally {
      setDeleting(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FiImage className="text-blue-500" size={20} />;
    if (fileType === 'application/pdf') return <FiFileText className="text-red-500" size={20} />;
    if (fileType.includes('word') || fileType.includes('document')) return <FiFileText className="text-blue-600" size={20} />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FiFileText className="text-green-600" size={20} />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FiArchive className="text-yellow-600" size={20} />;
    return <FiFile className="text-gray-500" size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const canDelete = (attachment) => {
    return currentUser && (
      attachment.uploadedBy === currentUser._id ||
      projectMembers?.some(m => m._id === currentUser._id && m.isOwner)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No attachments yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-500 mb-2">
        Attachments ({attachments.length})
      </div>
      {attachments.map((attachment) => (
        <div
          key={attachment._id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileIcon(attachment.fileType)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate" title={attachment.originalName}>
                {attachment.originalName}
              </p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{formatFileSize(attachment.fileSize)}</span>
                <span>Uploaded by {attachment.uploadedByName}</span>
                <span>{formatDate(attachment.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handleDownload(attachment._id, attachment.originalName)}
              className="p-1.5 text-gray-500 hover:text-blue-600 transition rounded"
              title="Download"
            >
              <FiDownload size={16} />
            </button>
            {canDelete(attachment) && (
              <button
                onClick={() => handleDelete(attachment._id)}
                disabled={deleting === attachment._id}
                className="p-1.5 text-gray-500 hover:text-red-600 transition rounded disabled:opacity-50"
                title="Delete"
              >
                {deleting === attachment._id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                ) : (
                  <FiTrash2 size={16} />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
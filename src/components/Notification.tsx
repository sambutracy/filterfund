import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const bgColor = type === 'success' 
    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
    : type === 'error'
      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-4 z-50 ${bgColor} px-6 py-3 rounded-lg shadow-lg`}
        >
          <div className="flex items-center gap-2">
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-2 hover:text-opacity-80"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
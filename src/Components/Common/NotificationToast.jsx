import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useNotifications } from "../../Context/NotificationContext";

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{
              opacity: 0,
              x: 500,
              transition: {
                duration: 0.5,
                ease: [0.32, 0, 0.67, 0],
              },
            }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02, x: -10 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-lg shadow-lg p-4 max-w-md cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex items-start"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare size={16} className="text-blue-500" />
                  <h4 className="font-medium text-gray-900">
                    New message in ticket #
                    {notification.ticket?.id || notification.message?.ticket}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  By {notification.message?.sender?.name}
                </p>
                <p className="text-sm text-gray-800">
                  {notification.message?.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Project: {notification.project?.name}
                </p>
                <p className="text-sm text-blue-400 underline mt-1">
                  click to open chat
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
            {/* Loading bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 rounded-b-lg overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-blue-500"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;

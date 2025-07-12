"use client";
import { useState, useEffect } from "react";
import { pusherClient } from "@/pusher/client";

type Action = {
  id: string;
  name: string;
  description: string;
  done: boolean;
  type: string;
};

export default function Home() {
  const [actions, setActions] = useState<Action[]>([
    {
      id: "1",
      name: "Action 1",
      description: "Action 1 description",
      done: false,
      type: "action",
    },
    {
      id: "2",
      name: "Action 2",
      description: "Action 2 description",
      done: false,
      type: "action",
    },
    {
      id: "3",
      name: "Action 3",
      description: "Action 3 description",
      done: false,
      type: "action",
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe("actions");

    // Listen for individual action completion
    channel.bind(
      "action-completed",
      (data: { actionId: string; message: string }) => {
        console.log("Action completed:", data);
        setActions((prev) =>
          prev.map((action) =>
            action.id === data.actionId ? { ...action, done: true } : action
          )
        );
        setNotifications((prev) => [...prev, data.message]);
      }
    );

    // Listen for all actions completed
    channel.bind("all-actions-completed", (data: { message: string }) => {
      console.log("All actions completed:", data);
      setNotifications((prev) => [...prev, data.message]);
      setIsRunning(false);
    });

    // Cleanup subscription on unmount
    return () => {
      pusherClient.unsubscribe("actions");
    };
  }, []);
  const handleRunActions = async () => {
    setIsRunning(true);
    setNotifications([]);
    // Reset all actions to not done
    setActions((prev) => prev.map((action) => ({ ...action, done: false })));

    const response = await fetch("/api/actions/run", {
      method: "POST",
      body: JSON.stringify(actions),
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Workflow Actions
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and monitor your workflow executions
                </p>
              </div>
            </div>
            <button
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors ${
                isRunning
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              }`}
              onClick={handleRunActions}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Running...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Run Workflow
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {isRunning && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="animate-spin h-5 w-5 text-blue-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Workflow in Progress
                </h3>
                <p className="text-sm text-blue-700">
                  Executing actions sequentially...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Timeline */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Actions Timeline
            </h2>
            <p className="text-sm text-gray-500">
              Current workflow execution status
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {actions.map((action, index) => (
              <div key={action.id} className="px-6 py-4">
                <div className="flex items-start space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {action.done ? (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : isRunning &&
                      index === actions.findIndex((a) => !a.done) ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="animate-spin w-5 h-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Action Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {action.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {action.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {action.done ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : isRunning &&
                          index === actions.findIndex((a) => !a.done) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Running
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Running Action */}
                    {isRunning &&
                      index === actions.findIndex((a) => !a.done) && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full animate-pulse"
                              style={{ width: "60%" }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Processing...
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Panel */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Execution Log
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification}</p>
                      <p className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Actions
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {actions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {actions.filter((a) => a.done).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {actions.filter((a) => !a.done).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { UserProfile } from '@clerk/nextjs';
import { useState } from 'react';

export default function SettingsClientClerk() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Your Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'billing', name: 'Billing', icon: '💳' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Profile Information
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Update your personal information and profile picture.
              </p>
              <UserProfile 
                appearance={{
                  elements: {
                    card: 'shadow-none border-0',
                    navbar: 'hidden',
                    navbarMobileMenuButton: 'hidden',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Security Settings
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Manage your password, two-factor authentication, and security preferences.
              </p>
              <UserProfile 
                appearance={{
                  elements: {
                    card: 'shadow-none border-0',
                    navbar: 'hidden',
                    navbarMobileMenuButton: 'hidden',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure how you receive notifications about bookings and updates.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive email updates about bookings</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive SMS updates about bookings</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Marketing Emails</h4>
                    <p className="text-sm text-gray-500">Receive updates about new features</p>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Billing & Subscription
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Manage your subscription and billing information.
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Free Plan</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    You're currently on the free plan. Upgrade to unlock more features.
                  </p>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

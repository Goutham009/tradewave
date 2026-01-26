'use client';

import { Smartphone, Download, QrCode, Check, Apple, Play } from 'lucide-react';

export default function MobileAppPage() {
  const features = [
    'Real-time order notifications',
    'Quick RFQ creation on the go',
    'Instant messaging with suppliers',
    'Shipment tracking with push alerts',
    'Secure mobile payments',
    'Offline access to key documents',
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile App</h1>
          <p className="text-gray-500 mt-1">Take Tradewave with you everywhere</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* App Preview */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">T</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Tradewave Mobile</h2>
              <p className="text-blue-100">Version 2.4.1</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-800" />
              </div>
            </div>
            <p className="text-center text-blue-100 text-sm">Scan to download</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-black rounded-lg hover:bg-gray-900 transition-colors">
              <Apple className="w-6 h-6" />
              <div className="text-left">
                <p className="text-xs text-gray-300">Download on the</p>
                <p className="font-semibold">App Store</p>
              </div>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-black rounded-lg hover:bg-gray-900 transition-colors">
              <Play className="w-6 h-6" />
              <div className="text-left">
                <p className="text-xs text-gray-300">Get it on</p>
                <p className="font-semibold">Google Play</p>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Key Features
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">System Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">iOS</p>
                <p className="text-sm text-gray-500">iOS 14.0 or later</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">Android</p>
                <p className="text-sm text-gray-500">Android 8.0 or later</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Already have the app?</h3>
            <p className="text-blue-700 text-sm mb-4">
              Sign in with your Tradewave account to sync your data across all devices.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

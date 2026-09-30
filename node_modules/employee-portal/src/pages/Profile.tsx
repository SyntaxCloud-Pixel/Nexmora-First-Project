import React, { useState } from 'react';
import { useAuth } from 'supabase-client';
import { Mail, Phone, BadgeInfo, Briefcase } from 'lucide-react';
import { EditProfileModal } from '../components/EditProfileModal';

export const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl font-bold text-blue-700">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </button>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900">{profile?.first_name} {profile?.last_name}</h3>
          <p className="text-gray-500 mb-6">{profile?.designation || 'Employee'}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{profile?.phone || 'No phone set'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <BadgeInfo className="w-5 h-5 text-gray-400" />
              <span>ID: {profile?.employee_code}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <span>{profile?.department || 'General'}</span>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

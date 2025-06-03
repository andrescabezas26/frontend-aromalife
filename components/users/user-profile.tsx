import React, { useState } from 'react';
import Image from 'next/image';
import { User } from '@/types/user';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditUserForm } from './edit-user-form';
import { ProfilePictureEdit } from './profile-picture-edit';
import { Mail, MapPin, Calendar, User as UserIcon, Phone, Home, Globe } from 'lucide-react';
import { RoleGuard } from '../auth/role-guard';
interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">            {/* Profile Image */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              {!imageError && (user.profilePicture || user.imageUrl) ? (
                <Image
                  src={user.profilePicture || user.imageUrl || ''}
                  alt={`${user.name}'s profile picture`}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{user.name} {user.lastName}</h1>
              
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                {user.roles?.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{user.phoneCountryCode} {user.phone}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>{user.address}</span>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{user.city}{user.state ? `, ${user.state}` : ''}, {user.country}</span>
                </div>

                {user.createdAt && (
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <RoleGuard requiredRoles={['admin']} hideContent={true}>
              {<div className="flex flex-col space-y-2">
              <EditUserForm user={user} />
            </div>}
            </RoleGuard>
            <ProfilePictureEdit user={user} />
  
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {user.bio && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Biografía</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
          </CardContent>
        </Card>      )}

      {/* Contact & Location Information */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Información de contacto</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-gray-900">{user.phoneCountryCode} {user.phone}</p>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">Dirección</label>
              <p className="text-gray-900">{user.address}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Ciudad</label>
              <p className="text-gray-900">{user.city}</p>
            </div>

            {user.state && (
              <div>
                <label className="text-sm font-medium text-gray-500">Estado/Provincia</label>
                <p className="text-gray-900">{user.state}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">País</label>
              <p className="text-gray-900">{user.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>      <RoleGuard requiredRoles={['admin']} hideContent={true}>
        <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Información adicional</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
              <p className="text-gray-900">{user.id}</p>
            </div>
              <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <p className="text-gray-900">
                <Badge variant="default">
                  Activo
                </Badge>
              </p>
            </div>

            {user.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Última actualización</label>
                <p className="text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </RoleGuard>
      
    </div>
  );
};

export default UserProfile; 
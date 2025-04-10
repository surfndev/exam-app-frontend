
import React from 'react';
import CustomButton from './CustomButton';
import { Ionicons } from '@expo/vector-icons';

type SelfieButtonProps = {
  isVerified: boolean;
  isActive: boolean;
  isLoading?: boolean;
  onPress: () => void;
};

export const SelfieButton = ({ 
  isVerified, 
  isActive, 
  isLoading, 
  onPress 
}: SelfieButtonProps) => (
  <CustomButton
    title={
      isVerified ? 'Selfie Verified' : 
      isActive ? 'Take Selfie' : 'Complete NFC First'
    }
    handlePress={onPress}
    disabled={!isActive || isVerified}
    isLoading={isLoading}
    containerStyles={`${
      isVerified ? 'bg-gray-400' : 
      isActive ? 'bg-secondary' : 'bg-gray-300'
    } flex-row space-x-2`}
    textStyles="text-white"
  >
    <Ionicons 
      name={isVerified ? "checkmark-circle" : "camera"} 
      size={24} 
      color="white" 
    />
  </CustomButton>
);